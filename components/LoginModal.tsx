
import React, { useState } from 'react';
import { Lock, X, ArrowRight, Mail, KeyRound, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Success is handled by the onAuthStateChanged listener in App.tsx
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError("Identifiants incorrects.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Trop de tentatives. Réessayez plus tard.");
      } else {
        setError("Erreur de connexion. Vérifiez votre configuration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-space-950/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-space-900 border border-space-700 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-space-700 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-space-800 p-4 rounded-full mb-4 text-space-accent shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Espace Professeur</h2>
            <p className="text-space-500 text-sm mt-2 text-center">
              Authentification sécurisée requise.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-space-500">
                        <Mail size={18} />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-space-950 border border-space-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-space-700 outline-none focus:border-space-accent focus:ring-1 focus:ring-space-accent transition-all"
                        placeholder="Adresse email"
                        autoFocus
                        required
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-space-500">
                        <KeyRound size={18} />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-space-950 border border-space-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 placeholder-space-700 outline-none focus:border-space-accent focus:ring-1 focus:ring-space-accent transition-all"
                        placeholder="Mot de passe"
                        required
                    />
                </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/10 p-3 rounded-lg border border-red-900/20 animate-pulse">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? (
                  <span>Connexion...</span>
              ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
