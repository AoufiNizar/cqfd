import React, { useState, useEffect } from 'react';
import { Save, Check, X, AlertTriangle, UserMinus, ArrowLeft } from 'lucide-react';
import { Student, HomeworkStatus, HomeworkRecord, ClassGroup } from '../types';
import { StorageService } from '../services/storageService';

interface Props {
  classGroup: ClassGroup;
  onComplete: () => void;
  onCancel: () => void;
}

export const SessionRecorder: React.FC<Props> = ({ classGroup, onComplete, onCancel }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Devoir maison');
  const [records, setRecords] = useState<Record<string, HomeworkStatus>>({});

  useEffect(() => {
    const loadedStudents = StorageService.getStudents(classGroup.id);
    setStudents(loadedStudents);
    // Initialize all as FAIT by default or keep undefined? 
    // Let's initialize as Undefined to force checking, OR FAIT for speed.
    // User requested "replace notebook", usually default is FAIT.
    const initialRecords: Record<string, HomeworkStatus> = {};
    loadedStudents.forEach(s => {
      initialRecords[s.id] = HomeworkStatus.FAIT;
    });
    setRecords(initialRecords);
  }, [classGroup.id]);

  const handleStatusChange = (studentId: string, status: HomeworkStatus) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    if (students.length === 0) return;

    // 1. Create Session
    const newSession = StorageService.createSession(classGroup.id, date, description);

    // 2. Create Records
    const recordsToSave: HomeworkRecord[] = students.map(student => ({
      id: Math.random().toString(36).substr(2, 9),
      sessionId: newSession.id,
      studentId: student.id,
      status: records[student.id] || HomeworkStatus.FAIT // Fallback
    }));

    StorageService.saveRecords(recordsToSave);
    onComplete();
  };

  const statusConfig = {
    [HomeworkStatus.FAIT]: { color: 'bg-green-100 text-green-700 border-green-200', icon: Check, label: 'Fait' },
    [HomeworkStatus.NON_FAIT]: { color: 'bg-red-100 text-red-700 border-red-200', icon: X, label: 'Non Fait' },
    [HomeworkStatus.INCOMPLET]: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertTriangle, label: 'Incomplet' },
    [HomeworkStatus.ABSENT]: { color: 'bg-slate-100 text-slate-600 border-slate-200', icon: UserMinus, label: 'Absent' },
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm -mx-4 px-4 py-3 flex justify-between items-center mb-4">
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-slate-800 truncate px-2">
          {classGroup.name}
        </h2>
        <button 
          onClick={handleSave}
          className="bg-primary text-white px-4 py-2 rounded-full font-medium shadow-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
        >
          <Save size={18} />
          <span className="hidden sm:inline">Enregistrer</span>
        </button>
      </div>

      {/* Session Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border-slate-300 shadow-sm border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Exercices page 42"
            className="w-full rounded-md border-slate-300 shadow-sm border px-3 py-2"
          />
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 gap-3">
        {students.map((student) => {
          const currentStatus = records[student.id];
          const StatusIcon = statusConfig[currentStatus].icon;

          return (
            <div key={student.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="font-medium text-lg text-slate-900">{student.name}</span>
              
              {/* Status Toggles */}
              <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
                {(Object.keys(statusConfig) as HomeworkStatus[]).map((status) => {
                  const isActive = currentStatus === status;
                  const config = statusConfig[status];
                  const Icon = config.icon;
                  
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(student.id, status)}
                      className={`
                        flex-1 sm:flex-none py-2 px-3 rounded-md flex items-center justify-center gap-1 transition-all
                        ${isActive ? `${config.color} shadow-sm ring-1 ring-inset ring-black/5 font-medium` : 'text-slate-400 hover:bg-white'}
                      `}
                      title={config.label}
                    >
                      <Icon size={20} />
                      <span className={`text-xs ${isActive ? 'inline' : 'hidden md:inline'}`}>{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {students.length === 0 && (
        <div className="text-center p-8 text-slate-500">
          Aucun élève dans cette classe. Ajoutez des élèves avant de commencer une session.
        </div>
      )}
    </div>
  );
};