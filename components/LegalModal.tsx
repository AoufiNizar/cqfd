
import React from 'react';
import { X, Shield, Server, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-space-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-space-900 w-full max-w-2xl rounded-2xl border border-space-700 shadow-2xl overflow-hidden animate-fade-in-up max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-space-800 bg-space-800/50">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="text-space-accent" size={24} /> Mentions Légales
          </h2>
          <button onClick={onClose} className="text-space-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto text-space-300 space-y-6 text-sm leading-relaxed">
          
          <section>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Shield size={18} className="text-blue-400" /> 1. Éditeur du site
            </h3>
            <p>
              Le site <strong>CQFD</strong> est édité à titre personnel par <strong>M. AOUFI Nizar</strong>, professeur de mathématiques, dans le cadre d'un usage pédagogique à destination de ses élèves et de tout public intéressé.
            </p>
            <p className="mt-2">Contact : <em>(Vous pouvez ajouter une adresse mail pro ici si vous le souhaitez)</em></p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Server size={18} className="text-orange-400" /> 2. Hébergement
            </h3>
            <p>
              Ce site est hébergé par la société <strong>Google LLC</strong> via sa plateforme Firebase.<br/>
              Adresse : 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.<br/>
              Le stockage des données est assuré sur des serveurs sécurisés.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-2">3. Propriété Intellectuelle</h3>
            <p>
              L'ensemble du contenu de ce site (cours, exercices, corrections, structure) est la propriété exclusive de l'éditeur, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-2">4. Données Personnelles et Cookies</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Cookies techniques :</strong> Ce site utilise des cookies strictement nécessaires au fonctionnement (notamment pour l'authentification de l'administrateur via Firebase Auth).
              </li>
              <li>
                <strong>Statistiques :</strong> Nous utilisons un système de comptage interne anonyme (nombre de vues par chapitre) qui ne collecte aucune donnée personnelle (pas d'adresse IP, pas d'identifiant publicitaire). Ces données servent uniquement à améliorer le contenu pédagogique.
              </li>
              <li>
                <strong>Absence de collecte :</strong> Aucune donnée personnelle d'élève (nom, prénom, email) n'est collectée ou stockée par ce site pour la partie publique.
              </li>
            </ul>
          </section>

        </div>

        <div className="p-4 border-t border-space-800 bg-space-900 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-space-800 hover:bg-space-700 text-white rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
