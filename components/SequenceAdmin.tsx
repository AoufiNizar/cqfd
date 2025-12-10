
import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Save, Plus, Trash2, GripVertical, FileText, Link as LinkIcon, HelpCircle, CheckCircle, Tag, Pencil, Eye, Star, Download, Upload } from 'lucide-react';
import { Sequence, Flashcard } from '../types';
import { SmartText } from './Latex';

interface SequenceAdminProps {
  sequence?: Sequence; // If undefined, we are creating a new one
  availableCategories?: string[]; // Categories available for this level
  defaultCategory?: string; // Default category if none selected
  onSave: (seq: Sequence) => void;
  onCancel: () => void;
}

export const SequenceAdmin: React.FC<SequenceAdminProps> = ({ sequence, availableCategories, defaultCategory, onSave, onCancel }) => {
  const [title, setTitle] = useState(sequence?.title || '');
  const [category, setCategory] = useState(sequence?.category || defaultCategory || (availableCategories?.[0] || ''));
  const [pdfCourse, setPdfCourse] = useState(sequence?.pdfCourse || '');
  const [pdfExercises, setPdfExercises] = useState(sequence?.pdfExercises || '');
  const [pdfCorrection, setPdfCorrection] = useState(sequence?.pdfCorrection || '');
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>(sequence?.flashcards || []);

  // Flashcard Editing State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [tempQ, setTempQ] = useState('');
  const [tempA, setTempA] = useState('');
  const [tempDifficulty, setTempDifficulty] = useState<number>(1);

  const importInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSequence = () => {
    if (!title.trim()) return alert("Le titre de la séquence est obligatoire");
    if (availableCategories && availableCategories.length > 0 && !category) return alert("Une catégorie est obligatoire");
    
    onSave({
      id: sequence?.id || uuidv4(),
      title,
      category: category || undefined,
      pdfCourse: pdfCourse.trim() || undefined,
      pdfExercises: pdfExercises.trim() || undefined,
      pdfCorrection: pdfCorrection.trim() || undefined,
      flashcards
    });
  };

  const addFlashcard = () => {
    const newCard: Flashcard = { id: uuidv4(), question: '', answer: '', difficulty: 1 };
    setFlashcards([...flashcards, newCard]);
    setEditingCardId(newCard.id);
    setTempQ('');
    setTempA('');
    setTempDifficulty(1);
  };

  const deleteFlashcard = (id: string) => {
    if(confirm("Supprimer cette carte ?")) {
       setFlashcards(flashcards.filter(f => f.id !== id));
    }
  };

  const startEditCard = (card: Flashcard) => {
    setEditingCardId(card.id);
    setTempQ(card.question);
    setTempA(card.answer);
    setTempDifficulty(card.difficulty || 1);
  };

  const saveCard = () => {
    setFlashcards(flashcards.map(f => f.id === editingCardId ? { 
        ...f, 
        question: tempQ, 
        answer: tempA,
        difficulty: tempDifficulty
    } : f));
    setEditingCardId(null);
  };

  // --- IMPORT / EXPORT LOGIC ---

  const handleExportFlashcards = () => {
    if (flashcards.length === 0) return alert("Aucune flashcard à exporter.");
    
    // Clean data for export (remove internal IDs to avoid confusion if re-imported elsewhere manually)
    const exportData = flashcards.map(({ question, answer, difficulty }) => ({
      question,
      answer,
      difficulty
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // Filename based on sequence title
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `flashcards_${safeTitle || 'sequence'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
           // Validate and sanitize imported cards
           const newCards: Flashcard[] = json
             .filter((c: any) => c.question && c.answer) // Basic validation
             .map((c: any) => ({
               id: uuidv4(), // Generate NEW ID to avoid conflicts
               question: c.question,
               answer: c.answer,
               difficulty: typeof c.difficulty === 'number' ? c.difficulty : 1
             }));

           if (newCards.length === 0) {
             alert("Aucune carte valide trouvée dans le fichier.");
             return;
           }

           if (confirm(`Importer ${newCards.length} flashcards ?\nElles seront ajoutées à la suite des cartes existantes.`)) {
             setFlashcards(prev => [...prev, ...newCards]);
           }
        } else {
            alert("Format invalide : Le fichier doit contenir une liste (tableau) de cartes.");
        }
      } catch (err) {
        alert("Erreur lors de la lecture du fichier JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="fixed inset-0 z-[70] bg-space-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-space-900 w-full max-w-3xl rounded-xl border border-space-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-space-800 bg-space-900 sticky top-0 z-10 rounded-t-xl">
          <h2 className="text-xl font-bold text-slate-100">
            {sequence ? 'Modifier la Séquence' : 'Nouvelle Séquence'}
          </h2>
          <button onClick={onCancel} className="text-space-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* General Info */}
          <div className="space-y-4">
            
            {/* Category Selector if available */}
            {availableCategories && availableCategories.length > 0 && (
                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-space-400 uppercase mb-1">
                        <Tag size={14} /> Catégorie / Filière
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-space-950 border border-space-700 rounded-lg p-3 text-white focus:border-space-accent outline-none appearance-none"
                    >
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
              <label className="block text-xs font-bold text-space-400 uppercase mb-1">Titre de la séquence</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-space-950 border border-space-700 rounded-lg p-3 text-white focus:border-space-accent outline-none"
                placeholder="Ex: Chapitre 1 - Dérivation"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase mb-1">
                    <LinkIcon size={14}/> Cours (Lien Drive / PDF)
                  </label>
                  <input 
                    value={pdfCourse}
                    onChange={e => setPdfCourse(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded-lg p-2 text-sm text-slate-300 focus:border-blue-500 outline-none placeholder-space-700"
                    placeholder="https://drive.google.com/..."
                  />
               </div>
               <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase mb-1">
                    <LinkIcon size={14}/> Exercices (Lien Drive / PDF)
                  </label>
                  <input 
                    value={pdfExercises}
                    onChange={e => setPdfExercises(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded-lg p-2 text-sm text-slate-300 focus:border-orange-500 outline-none placeholder-space-700"
                    placeholder="https://drive.google.com/..."
                  />
               </div>
               <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-green-400 uppercase mb-1">
                    <LinkIcon size={14}/> Corrigé (Lien Drive / PDF)
                  </label>
                  <input 
                    value={pdfCorrection}
                    onChange={e => setPdfCorrection(e.target.value)}
                    className="w-full bg-space-950 border border-space-700 rounded-lg p-2 text-sm text-slate-300 focus:border-green-500 outline-none placeholder-space-700"
                    placeholder="https://drive.google.com/..."
                  />
               </div>
            </div>
          </div>

          <div className="border-t border-space-800 my-4"></div>

          {/* Flashcards Editor */}
          <div>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
               <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                 <HelpCircle className="text-purple-400" size={20}/> Flashcards
               </h3>
               
               <div className="flex items-center gap-2">
                   {/* Hidden File Input */}
                   <input 
                      type="file" 
                      ref={importInputRef} 
                      onChange={handleImportFileChange} 
                      accept=".json" 
                      className="hidden" 
                   />

                   <button 
                      onClick={handleImportClick}
                      className="p-2 bg-space-800 hover:bg-space-700 text-space-400 hover:text-white rounded-lg border border-space-700 transition-colors"
                      title="Importer des flashcards (JSON)"
                   >
                      <Upload size={18}/>
                   </button>
                   
                   <button 
                      onClick={handleExportFlashcards}
                      className="p-2 bg-space-800 hover:bg-space-700 text-space-400 hover:text-white rounded-lg border border-space-700 transition-colors"
                      title="Exporter les flashcards (JSON)"
                   >
                      <Download size={18}/>
                   </button>

                   <div className="w-px h-6 bg-space-700 mx-1"></div>

                   <button 
                      onClick={addFlashcard}
                      className="flex items-center gap-2 bg-space-800 hover:bg-space-700 text-sm px-3 py-2 rounded-lg border border-space-700 transition-colors text-slate-200"
                    >
                      <Plus size={16}/> Ajouter
                    </button>
               </div>
             </div>

             <div className="space-y-3">
                {flashcards.length === 0 && (
                  <p className="text-space-600 text-sm italic text-center py-4">Aucune flashcard créée.</p>
                )}

                {flashcards.map((card, index) => (
                   <div key={card.id} className="bg-space-950 border border-space-800 rounded-lg p-4 group">
                      {editingCardId === card.id ? (
                        <div className="space-y-4 animate-fade-in">
                           <div className="flex items-center gap-2 mb-2 text-space-400 text-xs uppercase font-bold tracking-widest border-b border-space-800 pb-2">
                              <Pencil size={12} /> Mode Édition
                           </div>

                           {/* Difficulty Selector */}
                           <div>
                              <label className="text-xs text-space-500 uppercase font-bold mb-2 block">Difficulté</label>
                              <div className="flex gap-4">
                                {[1, 2, 3].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setTempDifficulty(level)}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded border transition-all ${
                                            tempDifficulty === level 
                                            ? 'bg-space-800 border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
                                            : 'bg-space-900 border-space-700 text-space-500 hover:border-space-500'
                                        }`}
                                    >
                                        <div className="flex">
                                            {[...Array(level)].map((_, i) => (
                                                <Star key={i} size={14} className="fill-current" />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold ml-1">{level}</span>
                                    </button>
                                ))}
                              </div>
                           </div>
                           
                           {/* Question Edit */}
                           <div className="grid md:grid-cols-2 gap-4">
                               <div>
                                  <label className="text-xs text-space-500 uppercase font-bold mb-1 block">Question (LaTeX)</label>
                                  <textarea 
                                    value={tempQ}
                                    onChange={e => setTempQ(e.target.value)}
                                    className="w-full bg-space-900 border border-space-700 rounded p-3 text-sm font-mono text-slate-200 focus:border-purple-500 outline-none transition-colors"
                                    rows={3}
                                    placeholder="Ex: $$ f(x) = x^2 $$"
                                  />
                               </div>
                               <div>
                                  <label className="text-xs text-space-500 uppercase font-bold mb-1 flex items-center gap-1"><Eye size={12}/> Aperçu</label>
                                  <div className="w-full h-full min-h-[80px] bg-space-800/50 border border-space-700/50 rounded p-3 flex items-center justify-center text-center overflow-auto relative">
                                      {/* Star Preview in Edit Mode */}
                                      <div className="absolute top-2 right-2 flex gap-0.5">
                                          {[1, 2, 3].map((s) => (
                                              <Star key={s} size={10} className={s <= tempDifficulty ? "fill-yellow-500 text-yellow-500" : "text-space-700"} />
                                          ))}
                                      </div>
                                      <SmartText text={tempQ || '...'} className="text-sm" />
                                  </div>
                               </div>
                           </div>

                           {/* Answer Edit */}
                           <div className="grid md:grid-cols-2 gap-4">
                               <div>
                                  <label className="text-xs text-space-500 uppercase font-bold mb-1 block">Réponse</label>
                                  <textarea 
                                    value={tempA}
                                    onChange={e => setTempA(e.target.value)}
                                    className="w-full bg-space-900 border border-space-700 rounded p-3 text-sm font-mono text-slate-200 focus:border-green-500 outline-none transition-colors"
                                    rows={3}
                                    placeholder="La réponse ici..."
                                  />
                               </div>
                               <div>
                                  <label className="text-xs text-space-500 uppercase font-bold mb-1 flex items-center gap-1"><Eye size={12}/> Aperçu</label>
                                  <div className="w-full h-full min-h-[80px] bg-space-800/50 border border-space-700/50 rounded p-3 flex items-center justify-center text-center overflow-auto">
                                      <SmartText text={tempA || '...'} className="text-sm text-green-400" />
                                  </div>
                               </div>
                           </div>

                           <div className="flex justify-end gap-2 pt-2">
                             <button onClick={saveCard} className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transition-all">
                               <CheckCircle size={16}/> Valider
                             </button>
                           </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex-1 cursor-pointer" onClick={() => startEditCard(card)}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="bg-space-800 text-space-500 text-[10px] px-1.5 rounded font-mono">#{index+1}</span>
                                {card.difficulty && (
                                    <div className="flex gap-0.5" title={`Difficulté ${card.difficulty}`}>
                                        {[1, 2, 3].map((s) => (
                                            <Star key={s} size={10} className={s <= (card.difficulty || 1) ? "fill-yellow-500 text-yellow-500" : "text-space-800"} />
                                        ))}
                                    </div>
                                )}
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                      <p className="text-[10px] text-space-500 uppercase tracking-wider mb-1">Question</p>
                                      <p className="text-sm text-slate-300 font-medium line-clamp-2"><SmartText text={card.question} /></p>
                                  </div>
                                  <div className="hidden md:block">
                                      <p className="text-[10px] text-space-500 uppercase tracking-wider mb-1">Réponse</p>
                                      <p className="text-sm text-space-400 line-clamp-2"><SmartText text={card.answer} /></p>
                                  </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); startEditCard(card); }} 
                                className="text-space-400 hover:text-white hover:bg-space-800 p-2 rounded transition-colors"
                                title="Modifier"
                              >
                                <Pencil size={18}/>
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteFlashcard(card.id); }} 
                                className="text-space-400 hover:text-red-400 hover:bg-red-900/20 p-2 rounded transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={18}/>
                              </button>
                           </div>
                        </div>
                      )}
                   </div>
                ))}
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-space-800 bg-space-900 sticky bottom-0 z-10 rounded-b-xl flex justify-end gap-4">
           <button onClick={onCancel} className="px-5 py-2 text-space-400 hover:text-white transition-colors">
             Annuler
           </button>
           <button onClick={handleSaveSequence} className="px-6 py-2 bg-space-accent text-space-950 font-bold rounded-lg hover:bg-blue-400 transition-colors flex items-center gap-2 shadow-lg shadow-space-accent/20">
             <Save size={18}/> Enregistrer la séquence
           </button>
        </div>

      </div>
    </div>
  );
};
