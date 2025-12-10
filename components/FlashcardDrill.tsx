
import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Star, Filter } from 'lucide-react';
import { Flashcard } from './Flashcard';
import { Flashcard as FlashcardType } from '../types';

interface FlashcardDrillProps {
  cards: FlashcardType[];
  onClose: () => void;
  title: string;
}

// Fisher-Yates Shuffle Algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const FlashcardDrill: React.FC<FlashcardDrillProps> = ({ cards, onClose, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDifficulties, setSelectedDifficulties] = useState<number[]>([1, 2, 3]);

  // Shuffle cards once when the component mounts or when 'cards' prop changes.
  // We do this before filtering so the random order persists even when toggling filters.
  const shuffledBaseCards = useMemo(() => {
    return shuffleArray(cards);
  }, [cards]);

  // Filter cards based on selection using the shuffled list
  const filteredCards = useMemo(() => {
    return shuffledBaseCards.filter(card => {
      const difficulty = card.difficulty || 1;
      return selectedDifficulties.includes(difficulty);
    });
  }, [shuffledBaseCards, selectedDifficulties]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);

  const toggleDifficulty = (level: number) => {
    setSelectedDifficulties(prev => {
      const newSelection = prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level];
      return newSelection;
    });
    // Reset index to avoid out of bounds
    setCurrentIndex(0);
  };

  if (cards.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-space-950 flex flex-col items-center justify-center p-4">
       <button 
         onClick={onClose}
         className="absolute top-4 right-4 p-2 text-space-500 hover:text-white bg-space-900 rounded-full hover:bg-space-800 transition-colors"
       >
         <X size={24} />
       </button>

       <div className="absolute top-6 left-6 flex flex-col gap-1">
          <div className="text-space-500 text-sm font-medium tracking-widest uppercase">
              Entraînement Flashcards
          </div>
          <div className="text-slate-200 font-bold truncate max-w-[200px] md:max-w-md">
              {title}
          </div>
       </div>

       {/* Difficulty Filter Controls */}
       <div className="mb-6 flex flex-col items-center gap-2">
          <span className="text-xs text-space-500 uppercase font-bold flex items-center gap-1">
            <Filter size={12}/> Filtrer par difficulté
          </span>
          <div className="flex gap-2 p-1 bg-space-900 rounded-lg border border-space-800">
            {[1, 2, 3].map((level) => {
               const isActive = selectedDifficulties.includes(level);
               return (
                 <button
                    key={level}
                    onClick={() => toggleDifficulty(level)}
                    className={`px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
                      isActive 
                        ? 'bg-space-800 text-yellow-500 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]' 
                        : 'text-space-600 hover:text-space-400 border border-transparent'
                    }`}
                    title={`Afficher difficulté ${level}`}
                 >
                    <div className="flex">
                       {[...Array(level)].map((_, i) => (
                          <Star key={i} size={12} className={isActive ? "fill-yellow-500" : "fill-none"} />
                       ))}
                    </div>
                 </button>
               );
            })}
          </div>
       </div>

       {/* Card Area */}
       <div className="w-full max-w-2xl aspect-[3/2] relative mb-8">
          {filteredCards.length > 0 ? (
             <Flashcard card={filteredCards[currentIndex]} />
          ) : (
             <div className="w-full h-full bg-space-900/50 border-2 border-dashed border-space-800 rounded-xl flex flex-col items-center justify-center text-space-500 p-8 text-center">
                <Filter size={48} className="mb-4 opacity-50"/>
                <p className="text-lg font-medium">Aucune carte ne correspond aux critères.</p>
                <p className="text-sm mt-2">Essayez de sélectionner plus de niveaux de difficulté.</p>
             </div>
          )}
       </div>

       {/* Navigation Controls */}
       {filteredCards.length > 0 && (
         <div className="flex items-center gap-8 animate-fade-in">
            <button onClick={prev} className="p-4 rounded-full bg-space-900 border border-space-800 text-slate-300 hover:text-white hover:border-space-600 transition-all shadow-lg">
               <ChevronLeft size={24} />
            </button>
            
            <span className="text-space-400 font-mono bg-space-900 px-4 py-1 rounded-full border border-space-800">
              {currentIndex + 1} / {filteredCards.length}
            </span>

            <button onClick={next} className="p-4 rounded-full bg-space-900 border border-space-800 text-slate-300 hover:text-white hover:border-space-600 transition-all shadow-lg">
               <ChevronRight size={24} />
            </button>
         </div>
       )}

       <div className="mt-8 text-xs text-space-600 flex items-center gap-2">
          <RotateCcw size={12}/> Astuce : Cliquez sur la carte pour voir la réponse
       </div>
    </div>
  );
};
