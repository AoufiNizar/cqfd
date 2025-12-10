
import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cqfd-cookie-consent');
    if (!consent) {
      // Show slightly delayed for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cqfd-cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[90] animate-fade-in-up">
      <div className="bg-space-900/95 backdrop-blur-md border border-space-700 p-4 rounded-xl shadow-2xl flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-space-800 rounded-lg text-space-accent shrink-0">
            <Cookie size={20} />
          </div>
          <div className="text-sm text-space-300">
            <p className="font-bold text-white mb-1">Cookies & Vie Privée</p>
            <p>
              Ce site utilise des cookies pour assurer son bon fonctionnement (authentification) et réaliser des statistiques de visites anonymes à des fins pédagogiques.
            </p>
          </div>
          <button 
            onClick={handleAccept} 
            className="text-space-500 hover:text-white shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleAccept}
            className="px-4 py-1.5 bg-space-accent text-space-950 text-sm font-bold rounded-lg hover:bg-blue-400 transition-colors"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};
