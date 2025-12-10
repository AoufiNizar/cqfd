
import React, { useState } from 'react';
import { Sigma, ChevronLeft, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationProps {
  onBack?: () => void;
  title?: string;
  onNavigateToLevel: (levelName: string) => void;
  onNavigateToView: (view: 'RENTREE' | 'BLOG') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onBack, title, onNavigateToLevel, onNavigateToView }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menus = {
    college: {
      label: 'Collège',
      items: ['Sixième', 'Cinquième', 'Quatrième', 'Troisième']
    },
    lycee: {
      label: 'Lycée',
      items: ['Seconde', 'Première', 'Terminale']
    }
  };

  const simpleLinks = [
    { label: 'Rentrée 🎯', action: () => onNavigateToView('RENTREE') },
    { label: 'Blog', action: () => onNavigateToView('BLOG') },
  ];

  const handleMenuClick = (menuKey: string) => {
    setActiveMenu(activeMenu === menuKey ? null : menuKey);
  };

  const handleItemClick = (item: string) => {
    onNavigateToLevel(item);
    setActiveMenu(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-space-950/95 backdrop-blur-md border-b border-space-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          
          {/* Zone Gauche : Logo et Retour */}
          <div className="flex items-center gap-4 z-10">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-full hover:bg-space-800 text-space-accent transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div 
                className="flex items-center gap-3 select-none" 
                onClick={onBack} 
                style={{cursor: onBack ? 'pointer' : 'default'}}
            >
              <div className="bg-space-800 p-1.5 rounded border border-space-700 shadow-inner">
                <Sigma className="text-space-accent" size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl font-black text-slate-100 tracking-tighter leading-none font-mono">
                  CQFD
                </span>
                {title && (
                   <span className="text-xs text-space-400 font-medium hidden sm:block animate-fade-in border-l border-space-700 pl-2 ml-1 mt-0.5">
                     {title}
                   </span>
                )}
              </div>
            </div>
          </div>

          {/* Zone Centrale : Menu Principal */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-6">
            
            {/* Menus Déroulants */}
            {(Object.keys(menus) as Array<keyof typeof menus>).map((key) => (
              <div key={key} className="relative">
                <button
                  onClick={() => handleMenuClick(key)}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors py-2 px-3 rounded-md ${
                    activeMenu === key ? 'text-space-accent bg-space-900' : 'text-space-400 hover:text-slate-200 hover:bg-space-900/50'
                  }`}
                >
                  {menus[key].label}
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-300 ${activeMenu === key ? 'rotate-180' : ''}`} 
                  />
                </button>
              </div>
            ))}

            {/* Liens Simples */}
            {simpleLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                   link.action();
                   setActiveMenu(null);
                }}
                className="text-sm font-medium text-space-400 hover:text-slate-200 transition-colors py-2 px-3 rounded-md hover:bg-space-900/50"
              >
                {link.label}
              </button>
            ))}
          </div>
          
          {/* Zone Droite */}
          <div className="flex items-center gap-4 z-10">
             {/* Espace réservé pour futurs outils */}
          </div>
        </div>
      </div>

      {/* BANDEAU DÉROULANT */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 w-full bg-space-950 border-b border-space-800 overflow-hidden shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex justify-center gap-2">
                  {menus[activeMenu as keyof typeof menus].items.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleItemClick(item)}
                      className="px-6 py-3 rounded-lg bg-space-900 border border-space-800 hover:border-space-accent/50 hover:bg-space-800 transition-all duration-200 text-slate-300 hover:text-white min-w-[120px] text-center"
                    >
                      <span className="font-medium">
                        {item}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
