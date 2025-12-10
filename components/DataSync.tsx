import React, { useRef, useState } from 'react';
import { Download, Upload, AlertTriangle, RefreshCw, Check, FileJson } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface Props {
  onClose: () => void;
  onDataChanged: () => void;
}

export const DataSync: React.FC<Props> = ({ onClose, onDataChanged }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleExport = () => {
    const json = StorageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `fina_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Sauvegarde téléchargée avec succès.' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        const success = StorageService.importAllData(text);
        if (success) {
          await StorageService.syncToCloud();
          setMessage({ type: 'success', text: 'Données restaurées avec succès !' });
          onDataChanged();
          setTimeout(onClose, 1500); // Auto close on success
        } else {
          setMessage({ type: 'error', text: 'Erreur: Le fichier est invalide ou corrompu.' });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (confirm("ATTENTION : Cela va effacer TOUTES les données de l'application sur cet appareil. Cette action est irréversible. Êtes-vous sûr ?")) {
       StorageService.clearAllData();
       await StorageService.syncToCloud();
       onDataChanged();
       onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
             <RefreshCw size={20} className="text-primary"/> Synchronisation
           </h3>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-600">
            Utilisez cette fonction pour transférer vos données entre votre smartphone et votre ordinateur via un fichier de sauvegarde.
          </p>

          {message && (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' ? <Check size={16}/> : <AlertTriangle size={16}/>}
              {message.text}
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-primary hover:bg-indigo-50 hover:text-primary transition-all group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 text-primary p-2 rounded-lg group-hover:bg-white">
                   <Download size={20} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-800 group-hover:text-primary">Sauvegarder</div>
                  <div className="text-xs text-slate-500">Exporter vers un fichier .json</div>
                </div>
              </div>
            </button>

            <div className="relative">
               <input 
                  type="file" 
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleImport}
                  className="hidden"
               />
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-success hover:bg-green-50 hover:text-success transition-all group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-success p-2 rounded-lg group-hover:bg-white">
                      <Upload size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-slate-800 group-hover:text-success">Restaurer</div>
                      <div className="text-xs text-slate-500">Importer depuis un fichier .json</div>
                    </div>
                  </div>
                </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
             <button 
               onClick={handleReset}
               className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 mx-auto"
             >
               <AlertTriangle size={12} /> Réinitialiser toutes les données
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};