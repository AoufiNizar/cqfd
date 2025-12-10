import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Plus, History, GraduationCap, ArrowLeft, Trash2, Database, Settings, LogOut, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { ClassGroup, ViewState } from './types';
import { StorageService } from './services/storageService';
import { StudentList } from './components/StudentList';
import { SessionRecorder } from './components/SessionRecorder';
import { AnalysisView } from './components/AnalysisView';
import { DataSync } from './components/DataSync';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AuthWrapper } from './components/AuthWrapper';
import { supabase } from './services/supabaseClient';

function AppContent() {
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'HISTORY' | 'ANALYSIS'>('STUDENTS');
  const [showNewClassInput, setShowNewClassInput] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  
  // Sync State
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'ERROR'>('IDLE');

  // Initial Load & Auto-Sync
  useEffect(() => {
    loadClasses();
    performInitialSync();
  }, []);

  const performInitialSync = async () => {
      setSyncStatus('SYNCING');
      await StorageService.syncFromCloud();
      loadClasses(); // Reload after potential update
      setSyncStatus('IDLE');
  };

  const loadClasses = () => {
    setClasses(StorageService.getClasses());
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    StorageService.addClass(newClassName.trim());
    setNewClassName('');
    setShowNewClassInput(false);
    loadClasses();
    triggerCloudSave();
  };

  const handleDeleteClass = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setClassToDelete(id);
  };

  const confirmDeleteClass = () => {
    if (classToDelete) {
      StorageService.deleteClass(classToDelete);
      loadClasses();
      setClassToDelete(null);
      triggerCloudSave();
    }
  };

  const triggerCloudSave = async () => {
      setSyncStatus('SYNCING');
      await StorageService.syncToCloud();
      setSyncStatus('IDLE');
  };

  const handleSelectClass = (cls: ClassGroup) => {
    setSelectedClass(cls);
    setView('CLASS_DETAILS');
    setActiveTab('STUDENTS');
  };

  const handleLogout = async () => {
    if (supabase) {
        await supabase.auth.signOut();
    } else {
        window.location.reload(); // Simple refresh for local mode reset if needed
    }
  };

  // --- Views ---

  const renderDashboard = () => (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">FINA</h1>
          <p className="text-slate-500 mt-1">Gérez vos classes et suivez les devoirs.</p>
        </div>
        <div className="flex gap-2">
            {/* Sync Indicator */}
            {supabase && (
                <div className="flex items-center px-3 text-slate-400 gap-2">
                    {syncStatus === 'SYNCING' && (
                        <div title="Synchronisation en cours">
                             <Loader2 className="animate-spin text-primary" size={20} />
                        </div>
                    )}
                    {syncStatus === 'IDLE' && (
                        <div title="Synchronisé">
                             <Cloud size={20} />
                        </div>
                    )}
                    {syncStatus === 'ERROR' && (
                        <div title="Erreur Sync">
                             <CloudOff size={20} className="text-red-400" />
                        </div>
                    )}
                </div>
            )}

            <button
               onClick={() => setShowSyncModal(true)}
               className="p-2.5 text-slate-500 hover:text-primary hover:bg-indigo-50 rounded-lg transition-colors"
               title="Options de Données"
            >
               <Database size={24} />
            </button>
            <button
               onClick={handleLogout}
               className="p-2.5 text-slate-500 hover:text-danger hover:bg-red-50 rounded-lg transition-colors"
               title="Se déconnecter"
            >
               <LogOut size={24} />
            </button>
            <button 
              onClick={() => setShowNewClassInput(true)}
              className="hidden sm:flex bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all items-center justify-center gap-2"
            >
              <Plus size={20} /> Nouvelle Classe
            </button>
            <button 
              onClick={() => setShowNewClassInput(true)}
              className="sm:hidden bg-primary hover:bg-indigo-700 text-white p-2.5 rounded-lg shadow-sm transition-all"
            >
              <Plus size={24} />
            </button>
        </div>
      </header>

      {showNewClassInput && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Nom de la classe (ex: 3ème B)"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="flex-1 rounded-lg border-slate-300 border px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              autoFocus
            />
            <div className="flex gap-2">
                <button type="submit" className="flex-1 sm:flex-none bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800">
                Créer
                </button>
                <button 
                type="button" 
                onClick={() => setShowNewClassInput(false)}
                className="flex-1 sm:flex-none text-slate-500 hover:text-slate-800 px-4 py-2 font-medium"
                >
                Annuler
                </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">Aucune classe</h3>
            <p className="text-slate-500 mb-4">Commencez par créer votre première classe.</p>
            <button 
              onClick={() => setShowNewClassInput(true)}
              className="text-primary font-medium hover:underline"
            >
              + Créer une classe
            </button>
          </div>
        ) : (
          classes.map((cls) => (
            <div 
              key={cls.id}
              onClick={() => handleSelectClass(cls)}
              className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{cls.name}</h3>
                    <p className="text-sm text-slate-500">{StorageService.getStudents(cls.id).length} élèves</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteClass(e, cls.id)}
                  className="text-slate-300 hover:text-danger p-2 rounded-full hover:bg-red-50 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderClassDetails = () => {
    if (!selectedClass) return null;

    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col">
        <header className="mb-6">
           <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={() => setView('DASHBOARD')}
                    className="text-slate-500 hover:text-slate-800 flex items-center gap-2 font-medium transition-colors"
                >
                    <ArrowLeft size={18} /> Retour
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSyncModal(true)}
                    className="p-2 text-slate-400 hover:text-primary transition-colors"
                    title="Sauvegarde"
                  >
                    <Database size={20} />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-danger transition-colors"
                    title="Se déconnecter"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
           </div>
           
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <h1 className="text-3xl font-extrabold text-slate-900">{selectedClass.name}</h1>
             <button
               onClick={() => setView('NEW_SESSION')}
               className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
             >
               <BookOpen size={20} />
               Noter les Devoirs
             </button>
           </div>
        </header>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6 flex gap-6 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('STUDENTS')}
            className={`pb-3 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'STUDENTS' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Users size={18} /> Liste Élèves
          </button>
          <button 
            onClick={() => setActiveTab('ANALYSIS')}
            className={`pb-3 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === 'ANALYSIS' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <History size={18} /> Historique & IA
          </button>
        </div>

        <div className="flex-1">
          {activeTab === 'STUDENTS' && (
            <StudentList 
              classId={selectedClass.id} 
              onBack={() => {}} 
              // We pass a key to force re-render if needed, but not strictly required
            />
          )}
          {activeTab === 'ANALYSIS' && (
            <AnalysisView classGroup={selectedClass} />
          )}
        </div>
      </div>
    );
  };

  const renderNewSession = () => {
    if (!selectedClass) return null;
    return (
      <div className="max-w-3xl mx-auto p-4 min-h-screen bg-slate-50">
        <SessionRecorder 
          classGroup={selectedClass}
          onComplete={() => {
            triggerCloudSave(); // Auto save to cloud
            setView('CLASS_DETAILS');
            setActiveTab('ANALYSIS'); 
          }}
          onCancel={() => setView('CLASS_DETAILS')}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {view === 'DASHBOARD' && renderDashboard()}
      {view === 'CLASS_DETAILS' && renderClassDetails()}
      {view === 'NEW_SESSION' && renderNewSession()}
      
      {showSyncModal && (
          <DataSync 
            onClose={() => setShowSyncModal(false)} 
            onDataChanged={() => {
                loadClasses();
                if (view !== 'DASHBOARD') setView('DASHBOARD');
            }} 
          />
      )}

      <ConfirmationModal 
        isOpen={!!classToDelete}
        title="Supprimer la classe"
        message="Êtes-vous sûr de vouloir supprimer cette classe ? Toutes les données associées (élèves, notes, historique) seront définitivement perdues."
        onConfirm={confirmDeleteClass}
        onCancel={() => setClassToDelete(null)}
        isDangerous={true}
      />
    </div>
  );
}

function App() {
  return (
    <AuthWrapper children={<AppContent />} />
  );
}

export default App;