import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, User, Upload, FileUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Student } from '../types';
import { StorageService } from '../services/storageService';
import { ConfirmationModal } from './ConfirmationModal';

interface Props {
  classId: string;
  onBack: () => void;
}

export const StudentList: React.FC<Props> = ({ classId, onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [importMode, setImportMode] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const loadStudents = () => {
    setStudents(StorageService.getStudents(classId));
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    StorageService.addStudent(newStudentName.trim(), classId);
    setNewStudentName('');
    loadStudents();
    await StorageService.syncToCloud();
  };

  const handleDeleteStudent = (id: string) => {
    setStudentToDelete(id);
  };

  const confirmDeleteStudent = async () => {
    if (studentToDelete) {
      StorageService.deleteStudent(studentToDelete);
      loadStudents();
      setStudentToDelete(null);
      await StorageService.syncToCloud();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        processCSV(text);
      }
    };
    reader.readAsText(file);
  };

  const processCSV = async (csvText: string) => {
    // Basic CSV parser: expects "Name" or "Firstname, Lastname" per line
    const lines = csvText.split(/\r?\n/);
    let count = 0;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Remove generic CSV headers if present
      if (trimmed.toLowerCase().includes('nom') && trimmed.toLowerCase().includes('prénom')) return;

      // Handle "Last, First" or "First;Last" or simple name
      const cleanName = trimmed.replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim();
      
      if (cleanName) {
        StorageService.addStudent(cleanName, classId);
        count++;
      }
    });

    alert(`${count} élèves importés avec succès !`);
    loadStudents();
    setImportMode(false);
    await StorageService.syncToCloud();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manual Add */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <User size={20} className="text-primary"/> Ajout Manuel
          </h3>
          <form onSubmit={handleAddStudent} className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="Nom de l'élève"
              className="flex-1 rounded-lg border-slate-300 shadow-sm border px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>
        </div>

        {/* CSV Import */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <FileUp size={20} className="text-success"/> Import CSV
          </h3>
          <div className="flex flex-col gap-2">
             <p className="text-sm text-slate-500 mb-2">
               Importez une liste depuis Excel/CSV. Format simple : un nom par ligne.
             </p>
             <input 
                type="file" 
                accept=".csv,.txt"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
             />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full border-2 border-dashed border-slate-300 hover:border-primary hover:bg-indigo-50 text-slate-600 hover:text-primary py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2 font-medium"
             >
               <Upload size={18} /> Choisir un fichier
             </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <UsersIcon /> Liste des élèves <span className="bg-slate-200 text-slate-600 text-xs px-2 py-1 rounded-full">{students.length}</span>
          </h3>
        </div>
        <ul className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
          {students.length === 0 ? (
            <li className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
              <User size={48} className="mb-3 text-slate-200" />
              <p className="italic">Aucun élève dans cette classe.</p>
              <p className="text-sm mt-1">Ajoutez-en manuellement ou importez un fichier.</p>
            </li>
          ) : (
            students.map((student) => (
              <li key={student.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {getInitials(student.name)}
                  </div>
                  <span className="font-medium text-slate-800">{student.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteStudent(student.id)}
                  className="text-slate-300 hover:text-danger p-2 rounded-full hover:bg-red-50 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <ConfirmationModal 
        isOpen={!!studentToDelete}
        title="Supprimer l'élève"
        message="Voulez-vous vraiment supprimer cet élève ? Ses notes individuelles seront également effacées."
        onConfirm={confirmDeleteStudent}
        onCancel={() => setStudentToDelete(null)}
        isDangerous={true}
      />
    </div>
  );
};

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
)

function getInitials(name: string) {
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}