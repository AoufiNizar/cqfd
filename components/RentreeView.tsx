
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Calendar, CheckCircle, FileText, ArrowRight, ExternalLink, 
  Calculator, Ban, Pencil, X, Save, Plus, Trash2, Edit3, Check, Link as LinkIcon
} from 'lucide-react';
import { RentreeTrack, RentreeDay } from '../types';

interface RentreeViewProps {
  tracks: RentreeTrack[];
  isTeacherMode: boolean;
  onUpdateTracks: (tracks: RentreeTrack[]) => void;
}

export const RentreeView: React.FC<RentreeViewProps> = ({ tracks, isTeacherMode, onUpdateTracks }) => {
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id || '');
  
  // Track Management State
  const [renamingTrackId, setRenamingTrackId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Day Editing State
  const [editingDay, setEditingDay] = useState<{trackId: string, dayIndex: number} | null>(null);
  const [editForm, setEditForm] = useState<Partial<RentreeDay>>({});

  const currentTrack = tracks.find(t => t.id === selectedTrackId);

  // --- TRACK MANAGEMENT FUNCTIONS ---

  const handleAddTrack = () => {
    const name = prompt("Nom du nouveau parcours (ex: 'Vers la Prépa')");
    if (!name) return;

    const newId = `track-${uuidv4()}`;
    const newTrack: RentreeTrack = {
      id: newId,
      name,
      days: Array.from({ length: 14 }, (_, i) => ({
        day: i + 1,
        title: `Jour ${i + 1}`,
        description: "Contenu à définir.",
        calculator: true
      }))
    };

    onUpdateTracks([...tracks, newTrack]);
    setSelectedTrackId(newId);
  };

  const handleDeleteTrack = () => {
    if (!currentTrack) return;
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le parcours "${currentTrack.name}" ?`)) return;

    const newTracks = tracks.filter(t => t.id !== currentTrack.id);
    onUpdateTracks(newTracks);
    
    if (newTracks.length > 0) {
      setSelectedTrackId(newTracks[0].id);
    } else {
      setSelectedTrackId('');
    }
  };

  const startRenaming = () => {
    if (!currentTrack) return;
    setRenamingTrackId(currentTrack.id);
    setRenameValue(currentTrack.name);
  };

  const saveRename = () => {
    if (!currentTrack) return;
    if (!renameValue.trim()) return;

    const updatedTracks = tracks.map(t => 
      t.id === currentTrack.id ? { ...t, name: renameValue } : t
    );
    onUpdateTracks(updatedTracks);
    setRenamingTrackId(null);
  };

  // --- DAY EDITING FUNCTIONS ---

  const startEditing = (trackId: string, dayIndex: number, dayData: RentreeDay) => {
    setEditingDay({ trackId, dayIndex });
    setEditForm({
      title: dayData.title,
      description: dayData.description,
      externalLink: dayData.externalLink || '',
      calculator: dayData.calculator || false,
      link: dayData.link || ''
    });
  };

  const saveEdit = () => {
    if (!editingDay) return;

    const updatedTracks = tracks.map(t => {
      if (t.id === editingDay.trackId) {
        const newDays = [...t.days];
        newDays[editingDay.dayIndex] = {
          ...newDays[editingDay.dayIndex],
          ...editForm
        } as RentreeDay;
        return { ...t, days: newDays };
      }
      return t;
    });

    onUpdateTracks(updatedTracks);
    setEditingDay(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in relative">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-100 mb-4 flex items-center justify-center gap-3">
                <Calendar className="text-space-accent" size={40} />
                Objectif Rentrée
            </h1>
            <p className="text-space-400 max-w-xl mx-auto text-lg">
                Une progression sur 2 semaines pour réviser les essentiels et démarrer l'année en toute confiance.
            </p>
        </div>

        {/* --- TRACK SELECTION & MANAGEMENT --- */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10">
            <div className="relative w-full max-w-md">
                {renamingTrackId === selectedTrackId ? (
                    <div className="flex gap-2 animate-fade-in">
                       <input 
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="flex-grow bg-space-900 border border-space-accent rounded-xl py-3 px-4 text-white outline-none focus:ring-2 focus:ring-space-accent/50"
                          autoFocus
                          placeholder="Nom du parcours"
                       />
                       <button onClick={saveRename} className="bg-green-600 hover:bg-green-500 text-white p-3 rounded-xl transition-colors" title="Valider">
                          <Check size={20} />
                       </button>
                       <button onClick={() => setRenamingTrackId(null)} className="bg-space-800 hover:bg-space-700 text-white p-3 rounded-xl transition-colors" title="Annuler">
                          <X size={20} />
                       </button>
                    </div>
                ) : (
                    <div className="relative">
                        {tracks.length > 0 ? (
                            <>
                                <select 
                                    value={selectedTrackId}
                                    onChange={(e) => setSelectedTrackId(e.target.value)}
                                    className="w-full bg-space-900 border border-space-700 text-slate-200 text-lg py-3 px-4 pr-10 rounded-xl focus:border-space-accent focus:ring-1 focus:ring-space-accent outline-none appearance-none cursor-pointer hover:bg-space-800 transition-colors shadow-lg"
                                >
                                    {tracks.map(track => (
                                        <option key={track.id} value={track.id}>{track.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-space-400">
                                    <ArrowRight size={20} className="rotate-90" />
                                </div>
                            </>
                        ) : (
                            <div className="w-full bg-space-900/50 border border-space-800 border-dashed rounded-xl py-3 px-4 text-space-500 text-center italic">
                                Aucun parcours disponible. Créez-en un !
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Teacher Controls */}
            {isTeacherMode && !renamingTrackId && (
                <div className="flex gap-2">
                     <button 
                        onClick={handleAddTrack} 
                        className="p-3 bg-space-800 text-space-400 hover:text-white hover:bg-space-700 rounded-xl transition-colors border border-space-700"
                        title="Ajouter un nouveau parcours"
                     >
                        <Plus size={20} />
                     </button>
                     {tracks.length > 0 && (
                        <>
                            <button 
                                onClick={startRenaming} 
                                className="p-3 bg-space-800 text-space-400 hover:text-space-accent hover:bg-space-700 rounded-xl transition-colors border border-space-700"
                                title="Renommer ce parcours"
                            >
                                <Edit3 size={20} />
                            </button>
                            <button 
                                onClick={handleDeleteTrack} 
                                className="p-3 bg-space-800 text-space-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-colors border border-space-700"
                                title="Supprimer ce parcours"
                            >
                                <Trash2 size={20} />
                            </button>
                        </>
                     )}
                </div>
            )}
        </div>

        {/* --- EDIT DAY MODAL --- */}
        {editingDay && (
          <div className="fixed inset-0 z-[80] bg-space-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-space-900 w-full max-w-md rounded-xl border border-space-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
               <div className="flex justify-between items-center p-4 border-b border-space-800 bg-space-800/50 sticky top-0 z-10">
                  <h3 className="font-bold text-slate-200">Modifier Jour {editingDay.dayIndex + 1}</h3>
                  <button onClick={() => setEditingDay(null)}><X className="text-space-400 hover:text-white"/></button>
               </div>
               <div className="p-4 space-y-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-space-500 block mb-1">Titre</label>
                    <input 
                      value={editForm.title} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})} 
                      className="w-full bg-space-950 border border-space-700 rounded p-2 text-white focus:border-space-accent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-space-500 block mb-1">Description</label>
                    <textarea 
                      value={editForm.description} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})} 
                      className="w-full bg-space-950 border border-space-700 rounded p-2 text-white h-24 focus:border-space-accent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-blue-400 block mb-1 flex items-center gap-1">
                        <ExternalLink size={12}/> Lien Exercice Interactif (ex: CoopMaths)
                    </label>
                    <input 
                      value={editForm.externalLink} 
                      onChange={e => setEditForm({...editForm, externalLink: e.target.value})} 
                      className="w-full bg-space-950 border border-space-700 rounded p-2 text-white placeholder-space-700 focus:border-blue-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-orange-400 block mb-1 flex items-center gap-1">
                        <LinkIcon size={12}/> Lien Fiche PDF / Drive (Optionnel)
                    </label>
                    <input 
                      value={editForm.link} 
                      onChange={e => setEditForm({...editForm, link: e.target.value})} 
                      className="w-full bg-space-950 border border-space-700 rounded p-2 text-white placeholder-space-700 focus:border-orange-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                     <input 
                        type="checkbox" 
                        id="calc-toggle"
                        checked={editForm.calculator} 
                        onChange={e => setEditForm({...editForm, calculator: e.target.checked})} 
                        className="w-4 h-4 rounded border-space-700 bg-space-950 text-space-accent focus:ring-offset-0 focus:ring-1 focus:ring-space-accent cursor-pointer"
                     />
                     <label htmlFor="calc-toggle" className="text-sm text-slate-300 flex items-center gap-2 cursor-pointer select-none">
                        {editForm.calculator ? (
                          <span className="flex items-center gap-1 text-green-400"><Calculator size={14}/> Calculatrice Autorisée</span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-400"><Ban size={14}/> Calculatrice Interdite</span>
                        )}
                     </label>
                  </div>
               </div>
               <div className="p-4 border-t border-space-800 flex justify-end gap-2 bg-space-800/30 sticky bottom-0">
                  <button onClick={() => setEditingDay(null)} className="px-3 py-1.5 text-space-400 hover:text-white transition-colors">Annuler</button>
                  <button onClick={saveEdit} className="px-3 py-1.5 bg-space-accent text-space-950 font-bold rounded hover:bg-blue-400 flex items-center gap-1 transition-colors shadow-lg">
                     <Save size={14}/> Enregistrer
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* --- TIMELINE GRID --- */}
        {currentTrack ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentTrack.days.map((day, index) => (
                    <div 
                        key={day.day} 
                        className="bg-space-900 border border-space-800 rounded-xl p-6 hover:border-space-600 transition-all group relative overflow-hidden flex flex-col shadow-lg hover:shadow-xl"
                    >
                        {isTeacherMode && (
                        <button 
                            onClick={() => startEditing(currentTrack.id, index, day)}
                            className="absolute top-2 left-2 p-1.5 bg-space-800 text-space-400 hover:text-white rounded z-20 hover:bg-space-700 border border-space-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            title="Modifier le contenu"
                        >
                            <Pencil size={14} />
                        </button>
                        )}

                        {/* Day Badge */}
                        <div className="absolute top-0 right-0 bg-space-800 px-3 py-1 rounded-bl-xl text-xs font-bold text-space-500 uppercase tracking-wider group-hover:bg-space-accent group-hover:text-space-950 transition-colors">
                            J - {15 - day.day}
                        </div>

                        <div className="flex items-start gap-4 mb-4 mt-2">
                            <div className="w-10 h-10 rounded-full bg-space-950 border border-space-700 flex items-center justify-center text-space-accent font-bold font-mono shadow-inner shrink-0">
                                {day.day}
                            </div>
                            <h3 className="text-lg font-bold text-slate-200 pt-1 group-hover:text-space-accent transition-colors">
                                {day.title}
                            </h3>
                        </div>
                        
                        <p className="text-space-400 text-sm mb-6 leading-relaxed flex-grow whitespace-pre-line">
                            {day.description}
                        </p>

                        <div className="space-y-3 mt-auto">
                            {/* Calculator Status */}
                            <div className={`flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide py-1.5 rounded border ${
                                day.calculator 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                                {day.calculator ? <Calculator size={14}/> : <Ban size={14}/>}
                                {day.calculator ? 'Avec Calculatrice' : 'Sans Calculatrice'}
                            </div>

                            {/* External Exercise Link */}
                            {day.externalLink ? (
                                <a 
                                    href={day.externalLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full bg-space-accent text-space-950 font-bold py-2 rounded-lg hover:bg-blue-400 transition-colors shadow-lg shadow-space-accent/10"
                                >
                                    <ExternalLink size={16} /> Cliquer ici
                                </a>
                            ) : (
                                /* Placeholder if no link */
                                <div className="text-center text-xs text-space-600 italic py-2">
                                    Pas de lien interactif
                                </div>
                            )}

                            {/* PDF Resource (Secondary) */}
                            {day.link && (
                                <a 
                                    href={day.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 text-xs font-medium text-space-500 hover:text-white transition-colors border-t border-space-800 pt-3"
                                >
                                    <FileText size={12} /> Voir fiche PDF / Drive
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 opacity-50">
                <p className="text-xl text-space-400">Sélectionnez ou créez un parcours pour commencer.</p>
            </div>
        )}
    </div>
  );
};
