
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SmartText } from './Latex';
import { Flashcard as FlashcardType } from '../types';
import { RotateCw, Star } from 'lucide-react';

interface FlashcardProps {
  card: FlashcardType;
}

export const Flashcard: React.FC<FlashcardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes (useful for Drill mode)
  useEffect(() => {
    setIsFlipped(false);
  }, [card.id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const renderStars = (difficulty: number = 1) => {
    return (
      <div className="flex gap-0.5" title={`Difficulté : ${difficulty}/3`}>
        {[1, 2, 3].map((star) => (
          <Star 
            key={star} 
            size={14} 
            className={`${star <= difficulty ? 'fill-yellow-500 text-yellow-500' : 'text-space-700'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div 
      className="w-full h-64 cursor-pointer group" 
      onClick={handleFlip}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="w-full h-full relative"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute w-full h-full bg-space-800 border-2 border-space-700 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg hover:border-space-accent transition-colors"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="w-full flex justify-between items-start absolute top-4 px-4">
             <div className="text-space-accent uppercase text-xs font-bold tracking-wider">Question</div>
             {card.difficulty && renderStars(card.difficulty)}
          </div>
          
          <div className="flex-grow flex items-center justify-center overflow-auto w-full mt-6">
             <SmartText text={card.question} className="text-lg font-medium" />
          </div>
          <div className="mt-4 text-space-700 group-hover:text-space-accent transition-colors">
            <RotateCw size={20} />
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute w-full h-full bg-space-900 border-2 border-space-accent rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg"
          style={{ 
            transform: 'rotateY(180deg)', 
            backfaceVisibility: 'hidden', 
            WebkitBackfaceVisibility: 'hidden' 
          }}
        >
          <div className="text-green-400 uppercase text-xs font-bold tracking-wider mb-2">Réponse</div>
          <div className="flex-grow flex items-center justify-center overflow-auto w-full">
            <SmartText text={card.answer} className="text-lg" />
          </div>
           <div className="mt-4 text-space-700">
            <span className="text-xs">Cliquez pour retourner</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
