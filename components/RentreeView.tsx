
import React, { useState } from 'react';
import { Calendar, CheckCircle, FileText, ArrowRight, ExternalLink, Calculator, Ban, Pencil, X, Save } from 'lucide-react';
import { RentreeTrack, RentreeDay } from '../types';

interface RentreeViewProps {
  tracks: RentreeTrack[];
  isTeacherMode: boolean;
  onUpdateTracks: (tracks: RentreeTrack[]) => void;
}

export const RentreeView: React.FC<RentreeViewProps> = ({ tracks, isTeacherMode, onUpdateTracks }) => {
  const [selectedTrackId, setSelectedTrackId] = useState(tracks[0]?.id || '');
  
  // Edit State
  const [editingDay, setEditingDay] = useState<{trackId: string, dayIndex: number} | null>(null);
  const [editForm, setEditForm] = useState<Partial<RentreeDay>>({});

  const currentTrack = tracks.find(t => t.id === selectedTrackId);

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

        {/* Track Selector */}
        <div className="flex justify-center mb-10">
            <div className="relative inline-block w-full max-w-md">
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
            </div>
        </div>

        {/* Edit Modal */}
        {editingDay && (
          <div className="fixed inset-0 z-[80] bg-space-950/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-space-900 w-full max-w-md rounded-xl border border-space-700 shadow-2xl overflow-hidden">
               <div className="flex justify-between items-center p-4 border-b border-space-800 bg-space-800/50">
                  <h3 className="font-bold text-slate-200">Modifier Jour {editingDay.dayIndex + 1}</h3>
                  <button onClick={() => setEditingDay(null)}><X className="text-space-400 hover:text-white"/></button>
               </div>
               <div className="p-4 space-y-4">
                  <div>
                    <label className="text-xs uppercase font-bold text-space-500 block mb-1">Titre</label>
                    <input 
                      value={editForm.title} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})} 
                      className="w-full bg-space-950 border border-space-700 rounded p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-space-500 block mb-1">Description</label>
                    <textarea 
                      value={editForm.description} 
                      onChange={e => setEditForm({...editForm, description: e.target.value})} 
                      className="w-full bg-space-950 border border-space-700 rounded p-2 text-white h-24"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold text-space-500 block mb-1">Lien Exercice (CoopMaths)</label>
                    <input 
                      value={editForm.externalLink} 
                      onChange={e => setEditForm({...editForm, externalLink: e.target.value})} 
                      className="w-full bg-space-950 border border-space-700 rounded p-2 text-white placeholder-space-700"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                     <input 
                        type="checkbox" 
                        id="calc-toggle"
                        checked={editForm.calculator} 
                        onChange={e => setEditForm({...editForm, calculator: e.target.checked})} 
                        className="w-4 h-4 rounded border-space-700 bg-space-950 text-space-accent focus:ring-offset-0 focus:ring-1 focus:ring-space-accent"
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
               <div className="p-4 border-t border-space-800 flex justify-end gap-2 bg-space-800/30">
                  <button onClick={() => setEditingDay(null)} className="px-3 py-1.5 text-space-400 hover:text-white">Annuler</button>
                  <button onClick={saveEdit} className="px-3 py-1.5 bg-space-accent text-space-950 font-bold rounded hover:bg-blue-400 flex items-center gap-1">
                     <Save size={14}/> Enregistrer
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Timeline Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentTrack?.days.map((day, index) => (
                <div 
                    key={day.day} 
                    className="bg-space-900 border border-space-800 rounded-xl p-6 hover:border-space-600 transition-all group relative overflow-hidden flex flex-col"
                >
                    {isTeacherMode && (
                       <button 
                         onClick={() => startEditing(currentTrack.id, index, day)}
                         className="absolute top-2 left-2 p-1.5 bg-space-800 text-space-400 hover:text-white rounded z-20 hover:bg-space-700 border border-space-700"
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
                    
                    <p className="text-space-400 text-sm mb-6 leading-relaxed flex-grow">
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
                                className="flex items-center justify-center gap-2 text-xs font-medium text-space-500 hover:text-white transition-colors"
                            >
                                <FileText size={12} /> Voir fiche PDF
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
