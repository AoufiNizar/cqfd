
import React, { useState } from 'react';
import { Sigma, GraduationCap, Target, Heart, Pencil, Save, X } from 'lucide-react';
import { AboutPageData } from '../types';
import { SmartText } from './Latex';
import { RichTextEditor } from './RichTextEditor';

interface AboutViewProps {
  data: AboutPageData;
  isTeacherMode: boolean;
  onUpdate: (data: AboutPageData) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ data, isTeacherMode, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            <div className="bg-space-900 border border-space-700 rounded-xl p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-space-800">
                    <h2 className="text-xl font-bold text-white">Modifier le Profil</h2>
                    <button onClick={() => setIsEditing(false)}><X className="text-space-400 hover:text-white"/></button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-space-500 uppercase">Titre Principal</label>
                            <input 
                                value={formData.title} 
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-space-950 border border-space-700 rounded p-2 text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-space-500 uppercase">Sous-titre</label>
                            <input 
                                value={formData.subtitle} 
                                onChange={e => setFormData({...formData, subtitle: e.target.value})}
                                className="w-full bg-space-950 border border-space-700 rounded p-2 text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-space-500 uppercase">Nom de l'auteur</label>
                            <input 
                                value={formData.authorName} 
                                onChange={e => setFormData({...formData, authorName: e.target.value})}
                                className="w-full bg-space-950 border border-space-700 rounded p-2 text-white mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-space-500 uppercase">Rôle / Titre</label>
                            <input 
                                value={formData.authorRole} 
                                onChange={e => setFormData({...formData, authorRole: e.target.value})}
                                className="w-full bg-space-950 border border-space-700 rounded p-2 text-white mt-1"
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label className="text-xs font-bold text-space-500 uppercase">URL Photo (Optionnel)</label>
                             <input 
                                value={formData.authorPhotoUrl} 
                                onChange={e => setFormData({...formData, authorPhotoUrl: e.target.value})}
                                className="w-full bg-space-950 border border-space-700 rounded p-2 text-white mt-1 placeholder-space-700"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-space-500 uppercase mb-2 block">Biographie (Supporte LaTeX & Markdown)</label>
                        <RichTextEditor 
                            value={formData.bioContent} 
                            onChange={val => setFormData({...formData, bioContent: val})}
                            minHeight="min-h-[400px]"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-space-400 hover:text-white">Annuler</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-space-accent text-space-950 font-bold rounded hover:bg-blue-400 flex items-center gap-2">
                        <Save size={16}/> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in relative">
      {/* Edit Button */}
      {isTeacherMode && (
        <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 bg-space-800 hover:bg-space-700 text-space-400 hover:text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-space-700"
        >
            <Pencil size={16} /> Modifier
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-block p-4 rounded-full bg-space-900 border border-space-800 mb-6 shadow-xl">
           <Sigma className="text-space-accent w-16 h-16" strokeWidth={2} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-100 mb-4 tracking-tight">
          {data.title}
        </h1>
        <p className="text-xl text-space-400 font-light">
          {data.subtitle}
        </p>
      </div>

      {/* Author Section */}
      <div className="bg-space-900 rounded-2xl border border-space-800 p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-space-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
           {/* Photo */}
           <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-space-800 border-4 border-space-700 flex items-center justify-center shrink-0 overflow-hidden shadow-inner self-center md:self-start">
              {data.authorPhotoUrl ? (
                  <img src={data.authorPhotoUrl} alt={data.authorName} className="w-full h-full object-cover" />
              ) : (
                  <span className="text-4xl font-bold text-space-600">
                    {data.authorName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                  </span>
              )}
           </div>
           
           <div className="text-center md:text-left flex-grow">
              <h2 className="text-2xl font-bold text-white mb-2">{data.authorName}</h2>
              <div className="text-space-accent font-medium mb-6 uppercase tracking-wider text-sm">{data.authorRole}</div>
              
              <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                 <SmartText text={data.bioContent} />
              </div>
           </div>
        </div>
      </div>

      {/* Features Grid (Static for design purposes, can be made dynamic if needed later) */}
      <div className="grid md:grid-cols-3 gap-6">
         <div className="bg-space-900/50 p-6 rounded-xl border border-space-800/50 hover:bg-space-900 hover:border-space-700 transition-all">
            <GraduationCap className="text-blue-400 mb-4" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Pédagogie</h3>
            <p className="text-sm text-space-400">
               Des cours structurés et des parcours adaptés à chaque niveau pour construire des bases solides.
            </p>
         </div>
         <div className="bg-space-900/50 p-6 rounded-xl border border-space-800/50 hover:bg-space-900 hover:border-space-700 transition-all">
            <Target className="text-orange-400 mb-4" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Pratique</h3>
            <p className="text-sm text-space-400">
               L'accent est mis sur l'entraînement régulier via des exercices types et des flashcards interactives.
            </p>
         </div>
         <div className="bg-space-900/50 p-6 rounded-xl border border-space-800/50 hover:bg-space-900 hover:border-space-700 transition-all">
            <Heart className="text-pink-400 mb-4" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Accompagnement</h3>
            <p className="text-sm text-space-400">
               Un suivi tout au long de l'année et des ressources spécifiques pour préparer la rentrée et les examens.
            </p>
         </div>
      </div>
    </div>
  );
};
