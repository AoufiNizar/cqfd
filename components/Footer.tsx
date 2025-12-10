
import React from 'react';
import { Lock, Info, Scale } from 'lucide-react';

interface FooterProps {
  onAdminClick: () => void;
  onAboutClick: () => void;
  onLegalClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick, onAboutClick, onLegalClick }) => (
  <footer className="bg-space-950 text-space-800 py-8 border-t border-space-900 mt-auto transition-colors hover:text-space-700">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs gap-4">
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
        <span>© {new Date().getFullYear()} CQFD.</span>
        <span className="hidden md:inline text-space-900">|</span>
        <span className="hidden md:inline">L'excellence par la pratique.</span>
        <span className="hidden md:inline text-space-900">|</span>
        <span className="font-mono opacity-50 text-space-600">v1.1</span>
        
        <div className="flex gap-4 mt-2 md:mt-0">
            <button 
            onClick={onAboutClick}
            className="text-space-600 hover:text-space-accent transition-colors flex items-center gap-1"
            >
                <Info size={12} /> À propos
            </button>
            <button 
            onClick={onLegalClick}
            className="text-space-600 hover:text-space-accent transition-colors flex items-center gap-1"
            >
                <Scale size={12} /> Mentions Légales
            </button>
        </div>
      </div>
      
      <button 
        onClick={onAdminClick} 
        className="opacity-30 hover:opacity-100 transition-all duration-300 flex items-center gap-2 p-2 rounded-lg hover:bg-space-900 cursor-default hover:cursor-pointer"
        aria-label="Administration"
        title="Accès Enseignant"
      >
        <Lock size={12} />
        <span>Accès Restreint</span>
      </button>
    </div>
  </footer>
);
