import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Lock, Loader2, LogIn, AlertCircle, Database, Save, Check } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Manual Config State
  const [manualUrl, setManualUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [configSaved]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setAuthLoading(true);
    setError(null);

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            if (error.message.includes("Invalid login")) {
                throw new Error("Email ou mot de passe incorrect.");
            }
            throw error;
        }
    } catch (err: any) {
        setError(err.message || "Une erreur est survenue");
    } finally {
        setAuthLoading(false);
    }
  };

  const saveManualConfig = () => {
      if (!manualUrl || !manualKey) {
          alert("Veuillez remplir les deux champs.");
          return;
      }
      try {
        const config = { url: manualUrl.trim(), key: manualKey.trim() };
        localStorage.setItem('sb-config', JSON.stringify(config));
        setConfigSaved(true);
        window.location.reload(); // Reload to re-init supabase client
      } catch (e) {
          alert("Erreur lors de la sauvegarde.");
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // --- CONFIGURATION SCREEN (If Env vars missing) ---
  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full space-y-6">
          <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mb-4">
                  <Database size={32} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Configuration Requise</h1>
              <p className="text-slate-600 mt-2">
                Connectez votre base de données <strong>Supabase</strong>.
              </p>
          </div>
          
          <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                  <p className="font-semibold mb-1">Option 1 (Recommandée) : Fichier .env</p>
                  <p>Ajoutez vos clés dans un fichier <code>.env</code> à la racine (voir README).</p>
              </div>

              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-sm">OU</span>
                  <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div>
                  <p className="font-semibold text-slate-700 mb-2">Option 2 : Saisie Directe</p>
                  <div className="space-y-3">
                      <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Project URL</label>
                          <input 
                            type="text" 
                            value={manualUrl}
                            onChange={(e) => setManualUrl(e.target.value)}
                            placeholder="https://xyz...supabase.co"
                            className="w-full text-sm px-3 py-2 border rounded-md"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">Anon API Key</label>
                          <input 
                            type="password" 
                            value={manualKey}
                            onChange={(e) => setManualKey(e.target.value)}
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                            className="w-full text-sm px-3 py-2 border rounded-md"
                          />
                      </div>
                      <button 
                        onClick={saveManualConfig}
                        className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-900 flex justify-center items-center gap-2"
                      >
                          <Save size={16} /> Sauvegarder et Démarrer
                      </button>
                  </div>
              </div>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTH SCREEN (Login Only) ---
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-primary mb-4">
                <Lock size={32} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">FINA</h1>
            <p className="text-slate-500 mt-2">Accès Enseignant Sécurisé</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                    <AlertCircle size={16} className="shrink-0" />
                    {error}
                </div>
            )}
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="votre@email.com"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {authLoading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                Se connecter
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100">
             <p className="text-xs text-slate-400">
                Application privée. Inscription désactivée.
             </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
