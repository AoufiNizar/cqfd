
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  BrainCircuit,
  Layout,
  ChevronLeft,
  CloudUpload, 
  AlertTriangle,
  Library,
  FileText,
  Link as LinkIcon,
  Pencil,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Filter,
  X,
  Activity,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { INITIAL_DATA, INITIAL_BLOG_POSTS, INITIAL_RENTREE_TRACKS, INITIAL_STATS, INITIAL_ABOUT_DATA } from './constants';
import { Level, ViewState, Sequence, BlogPost, RentreeTrack, SiteStats, AboutPageData } from './types';
import { Navigation } from './components/Navigation';
import { LoadingScreen } from './components/LoadingScreen';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { SequenceAdmin } from './components/SequenceAdmin';
import { FlashcardDrill } from './components/FlashcardDrill';
import { BlogView } from './components/BlogView';
import { RentreeView } from './components/RentreeView';
import { AboutView } from './components/AboutView';
import { StatsDashboard } from './components/StatsDashboard';

// FIREBASE IMPORTS
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Helper to convert Drive view links to preview links for embedding
const getEmbedUrl = (url: string) => {
  if (!url) return '';
  // Handle Google Drive links
  if (url.includes('drive.google.com') && url.includes('/view')) {
    return url.replace('/view', '/preview');
  }
  return url;
};

// Extracted Component
interface LevelButtonProps {
  level: Level;
  onClick: () => void;
}

const LevelButton: React.FC<LevelButtonProps> = ({ level, onClick }) => (
  <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-space-900 border border-space-800 hover:border-space-700 hover:bg-space-800 transition-all group flex items-center justify-between"
  >
      <span className="text-slate-300 font-medium group-hover:text-white">{level.name}</span>
      <ChevronLeft className="rotate-180 text-space-700 group-hover:text-space-accent transition-colors" size={16} />
  </button>
);

const App: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data State
  const [data, setData] = useState<Level[]>(INITIAL_DATA);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [rentreeTracks, setRentreeTracks] = useState<RentreeTrack[]>(INITIAL_RENTREE_TRACKS);
  const [stats, setStats] = useState<SiteStats>(INITIAL_STATS);
  const [aboutData, setAboutData] = useState<AboutPageData>(INITIAL_ABOUT_DATA);
  
  const [view, setView] = useState<ViewState>({ type: 'HOME' });
  
  // Category Filtering State
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Admin Editing State
  const [showSequenceAdmin, setShowSequenceAdmin] = useState(false);
  const [editingSequenceId, setEditingSequenceId] = useState<string | null>(null);

  // Player State
  const [drillSequenceId, setDrillSequenceId] = useState<string | null>(null);

  // Inline PDF Viewer State
  const [expandedResource, setExpandedResource] = useState<{
    sequenceId: string;
    type: 'course' | 'exercises' | 'correction';
    url: string;
  } | null>(null);

  // --- DYNAMIC TITLE MANAGEMENT ---
  useEffect(() => {
    let title = "CQFD - Mathématiques";
    if (view.type === 'LEVEL' && view.levelId) {
      const lvl = data.find(l => l.id === view.levelId);
      if (lvl) title = `${lvl.name} - CQFD`;
    } else if (view.type === 'BLOG') {
      title = "Blog - CQFD";
    } else if (view.type === 'RENTREE') {
      title = "Objectif Rentrée - CQFD";
    } else if (view.type === 'ABOUT') {
      title = "À Propos - CQFD";
    }
    document.title = title;
  }, [view, data]);

  // --- AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsTeacherMode(!!user);
      if (user) {
        setShowLoginModal(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- FIREBASE DATA LOADING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "content", "site_data");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetched = docSnap.data();
          if (fetched.data) setData(fetched.data);
          if (fetched.blogPosts) setBlogPosts(fetched.blogPosts);
          if (fetched.rentreeTracks) setRentreeTracks(fetched.rentreeTracks);
          if (fetched.stats) setStats(fetched.stats);
          if (fetched.aboutData) setAboutData(fetched.aboutData);
        } else {
          // First time launch: Initialize DB with constants
        }
      } catch (error) {
        console.error("Error connecting to Firebase:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchData();
  }, []);

  // --- ANALYTICS TRACKING ---
  const saveStatsToFirebase = async (newStats: SiteStats) => {
    try {
        const docRef = doc(db, "content", "site_data");
        // Update only the stats field
        await updateDoc(docRef, { stats: newStats });
    } catch (e) {
        // Silently fail if permissions denied (e.g. strict rules)
        // console.error("Failed to save stats", e);
    }
  };

  const trackVisit = () => {
     setStats(prev => {
         const next = { ...prev, totalVisits: prev.totalVisits + 1 };
         saveStatsToFirebase(next);
         return next;
     });
  };

  const trackLevel = (levelId: string) => {
     setStats(prev => {
        const next = {
            ...prev,
            levelVisits: {
                ...prev.levelVisits,
                [levelId]: (prev.levelVisits[levelId] || 0) + 1
            }
        };
        saveStatsToFirebase(next);
        return next;
     });
  };

  const trackSequence = (sequenceId: string) => {
      setStats(prev => {
         const next = {
             ...prev,
             sequenceVisits: {
                 ...prev.sequenceVisits,
                 [sequenceId]: (prev.sequenceVisits[sequenceId] || 0) + 1
             }
         };
         saveStatsToFirebase(next);
         return next;
      });
  };

  const trackTool = (tool: 'course' | 'exercises' | 'correction' | 'flashcards') => {
      setStats(prev => {
          const next = {
              ...prev,
              toolsUsage: {
                  ...prev.toolsUsage,
                  [tool]: prev.toolsUsage[tool] + 1
              }
          };
          saveStatsToFirebase(next);
          return next;
      });
  };

  // Run once on mount (Total Visit)
  useEffect(() => {
     if(!isTeacherMode && !loading) trackVisit();
  }, [loading]); // Wait for loading to finish so we don't double count or count teacher

  // Derived State
  const currentLevel = view.type === 'LEVEL' 
    ? data.find(l => l.id === view.levelId) 
    : undefined;

  const editingSequence = (currentLevel && editingSequenceId) 
    ? currentLevel.sequences.find(s => s.id === editingSequenceId) 
    : undefined;

  const drillSequence = (currentLevel && drillSequenceId)
    ? currentLevel.sequences.find(s => s.id === drillSequenceId)
    : undefined;

  // Reset category when changing levels
  useEffect(() => {
    if (currentLevel?.categories && currentLevel.categories.length > 0) {
        setActiveCategory(currentLevel.categories[0]);
    } else {
        setActiveCategory(null);
    }
  }, [currentLevel?.id]);


  // --- ACTIONS ---

  const handleNavigateToLevel = (levelName: string) => {
    const existingLevel = data.find(l => l.name === levelName);
    if (existingLevel) {
        trackLevel(existingLevel.id);
        setView({ type: 'LEVEL', levelId: existingLevel.id });
    } else {
        alert(`Le niveau ${levelName} n'est pas encore ouvert.`);
    }
  };

  const toggleResource = (sequenceId: string, type: 'course' | 'exercises' | 'correction', url?: string) => {
    if (!url) return;
    
    if (expandedResource?.sequenceId === sequenceId && expandedResource?.type === type) {
        setExpandedResource(null);
    } else {
        setExpandedResource({ sequenceId, type, url });
        trackSequence(sequenceId);
        trackTool(type);
    }
  };

  const handleStartDrill = (seqId: string) => {
      setDrillSequenceId(seqId);
      trackSequence(seqId);
      trackTool('flashcards');
  };

  const handleLogout = async () => {
      try {
          await signOut(auth);
          setView({ type: 'HOME' });
      } catch (error) {
          console.error("Error signing out", error);
      }
  };

  // --- FIREBASE SAVING (MANUAL TRIGGER) ---
  const handlePublishChanges = async () => {
    if(!confirm("Êtes-vous sûr de vouloir publier ces modifications en ligne pour tous les élèves ?")) return;
    
    setIsSaving(true);
    try {
        const docRef = doc(db, "content", "site_data");
        await setDoc(docRef, {
            data,
            blogPosts,
            rentreeTracks,
            aboutData,
            stats
        }, { merge: true });
        
        alert("Succès ! Le site est à jour pour tout le monde.");
    } catch (e) {
        console.error(e);
        alert("Erreur lors de la sauvegarde. Vérifiez votre connexion.");
    } finally {
        setIsSaving(false);
    }
  };

  // Sequence CRUD
  const handleOpenCreateSequence = () => {
    setEditingSequenceId(null);
    setShowSequenceAdmin(true);
  };

  const handleOpenEditSequence = (seqId: string) => {
    setEditingSequenceId(seqId);
    setShowSequenceAdmin(true);
  };

  const handleDeleteSequence = (seqId: string) => {
    if(!confirm("Êtes-vous sûr de vouloir supprimer cette séquence et tout son contenu ?")) return;
    if(currentLevel) {
        setData(data.map(l => {
            if(l.id === currentLevel.id) {
                return { ...l, sequences: l.sequences.filter(s => s.id !== seqId) };
            }
            return l;
        }));
    }
  };

  const handleSaveSequence = (seq: Sequence) => {
     if(currentLevel) {
         setData(data.map(l => {
             if(l.id === currentLevel.id) {
                 const exists = l.sequences.find(s => s.id === seq.id);
                 let newSequences;
                 if(exists) {
                     newSequences = l.sequences.map(s => s.id === seq.id ? seq : s);
                 } else {
                     newSequences = [...l.sequences, seq];
                 }
                 return { ...l, sequences: newSequences };
             }
             return l;
         }));
     }
     setShowSequenceAdmin(false);
     setEditingSequenceId(null);
  };

  // --- RENDERERS ---

  const renderTeacherBanner = () => {
    if (!isTeacherMode) return null;
    return (
        <div className="bg-amber-900/30 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3 text-xs text-amber-200 sticky top-16 z-40 backdrop-blur-sm shadow-md flex-wrap animate-fade-in-down">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="font-semibold tracking-wide uppercase">Mode Enseignant</span>
            
            <div className="flex gap-4 ml-4 pl-4 border-l border-amber-500/30">
                 <button onClick={() => setView({type: 'STATS'})} className="hover:text-white flex items-center gap-1 transition-colors font-bold text-space-accent"><Activity size={12}/> Stats</button>
                 
                 {/* PUBLISH BUTTON */}
                 <button 
                    onClick={handlePublishChanges} 
                    disabled={isSaving}
                    className={`flex items-center gap-1 px-3 py-1 rounded transition-colors font-bold ${isSaving ? 'bg-green-600/50 cursor-wait' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'}`}
                 >
                    {isSaving ? <RefreshCw size={12} className="animate-spin"/> : <CloudUpload size={12}/>}
                    {isSaving ? 'Publication...' : 'Publier les modifications'}
                 </button>

                 <button onClick={handleLogout} className="hover:text-white ml-2 font-bold flex items-center gap-1 bg-space-800/50 hover:bg-space-800 px-2 py-0.5 rounded transition-colors">
                    <LogOut size={12}/> Quitter
                 </button>
            </div>
        </div>
    )
  }

  const renderHome = () => {
    const collegeLevels = data.filter(l => l.group === 'COLLEGE');
    const lyceeLevels = data.filter(l => l.group === 'LYCEE');

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-16">
                <h1 className="text-3xl md:text-5xl font-black text-slate-100 mb-6 tracking-tight font-mono uppercase">
                    Ce qu'il fallait démontrer
                </h1>
                <p className="text-lg text-space-400 max-w-lg mx-auto">
                    Ressources mathématiques pour le collège et le lycée.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <div className="flex items-center gap-3 mb-6 border-b border-space-800 pb-2">
                        <BookOpen className="text-space-accent" size={20} />
                        <h2 className="text-xl font-semibold text-slate-200">Collège</h2>
                    </div>
                    <div className="space-y-3">
                        {collegeLevels.map(l => (
                            <LevelButton 
                                key={l.id} 
                                level={l} 
                                onClick={() => handleNavigateToLevel(l.name)}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-6 border-b border-space-800 pb-2">
                        <Library className="text-space-accent" size={20} />
                        <h2 className="text-xl font-semibold text-slate-200">Lycée</h2>
                    </div>
                    <div className="space-y-3">
                        {lyceeLevels.map(l => (
                            <LevelButton 
                                key={l.id} 
                                level={l} 
                                onClick={() => handleNavigateToLevel(l.name)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderLevelView = () => {
    if (!currentLevel || view.type !== 'LEVEL') return null;

    // Filtering logic
    const hasCategories = currentLevel.categories && currentLevel.categories.length > 0;
    
    const displayedSequences = currentLevel.sequences.filter(seq => {
        if (!hasCategories) return true; // Show all if no categories defined (Collège)
        return seq.category === activeCategory;
    });

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:justify-between md:items-end">
            <div>
                <span className="text-space-400 text-sm font-medium tracking-widest uppercase">Niveau</span>
                <h1 className="text-4xl font-bold text-white mt-1">{currentLevel.name}</h1>
            </div>
            {isTeacherMode && (
                <button 
                    onClick={handleOpenCreateSequence}
                    className="bg-space-accent text-space-950 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-400 transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={20} /> Nouvelle Séquence
                </button>
            )}
        </div>

        {/* Category Tabs (if applicable) */}
        {hasCategories && currentLevel.categories && (
            <div className="mb-8 overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                    {currentLevel.categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeCategory === cat 
                                ? 'bg-space-accent text-space-950 font-bold shadow-lg shadow-space-accent/20' 
                                : 'bg-space-900 text-space-400 border border-space-800 hover:border-space-600 hover:text-white'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Sequences List */}
        <div className="space-y-6">
            {displayedSequences.length === 0 ? (
                <div className="text-center py-20 bg-space-900/20 rounded-xl border border-space-800/50 border-dashed">
                    <p className="text-space-600 mb-4">
                        {hasCategories 
                            ? `Aucune séquence disponible dans ${activeCategory}.` 
                            : "Aucune séquence disponible pour le moment."}
                    </p>
                    {isTeacherMode && (
                        <button onClick={handleOpenCreateSequence} className="text-space-accent hover:underline">
                            Créer une séquence ici
                        </button>
                    )}
                </div>
            ) : (
                displayedSequences.map(sequence => (
                    <div 
                        key={sequence.id}
                        className="bg-space-900 rounded-xl border border-space-800 overflow-hidden hover:border-space-600 transition-colors group relative animate-fade-in"
                    >
                        {/* Sequence Header */}
                        <div className="p-6 border-b border-space-800/50 bg-space-800/20 flex justify-between items-start">
                             <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-1">{sequence.title}</h3>
                                <div className="text-xs text-space-500 flex gap-4 items-center">
                                    {sequence.category && (
                                        <span className="bg-space-950 border border-space-700 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                                            {sequence.category}
                                        </span>
                                    )}
                                    {sequence.flashcards.length > 0 && (
                                        <span className="flex items-center gap-1"><BrainCircuit size={12}/> {sequence.flashcards.length} flashcards</span>
                                    )}
                                </div>
                             </div>
                             {isTeacherMode && (
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => handleOpenEditSequence(sequence.id)}
                                        className="p-2 bg-space-800 text-space-400 hover:text-white rounded hover:bg-space-700 transition-colors"
                                        title="Modifier"
                                     >
                                         <Pencil size={16} />
                                     </button>
                                     <button 
                                        onClick={() => handleDeleteSequence(sequence.id)}
                                        className="p-2 bg-space-800 text-space-400 hover:text-red-400 rounded hover:bg-red-900/20 transition-colors"
                                        title="Supprimer"
                                     >
                                         <Trash2 size={16} />
                                     </button>
                                 </div>
                             )}
                        </div>

                        {/* Resources Grid */}
                        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Cours */}
                            {sequence.pdfCourse ? (
                                <button
                                    onClick={() => toggleResource(sequence.id, 'course', sequence.pdfCourse)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all gap-2 text-center group/btn relative ${
                                        expandedResource?.sequenceId === sequence.id && expandedResource?.type === 'course'
                                        ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/10' 
                                        : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40'
                                    }`}
                                >
                                    <div className={`p-2 rounded-full transition-transform ${
                                        expandedResource?.sequenceId === sequence.id && expandedResource?.type === 'course' 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-blue-500/10 text-blue-400 group-hover/btn:scale-110'
                                    }`}>
                                        <FileText size={20} />
                                    </div>
                                    <span className={`text-sm font-medium ${
                                        expandedResource?.sequenceId === sequence.id && expandedResource?.type === 'course' 
                                        ? 'text-white' 
                                        : 'text-slate-300 group-hover/btn:text-white'
                                    }`}>Leçon</span>
                                </button>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-space-950/50 border border-space-800/50 opacity-50 cursor-not-allowed gap-2 text-center">
                                    <FileText size={20} className="text-space-600" />
                                    <span className="text-sm font-medium text-space-600">Leçon</span>
                                </div>
                            )}

                            {/* Exercices */}
                            {sequence.pdfExercises ? (
                                <button 
                                    onClick={() => toggleResource(sequence.id, 'exercises', sequence.pdfExercises)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all gap-2 text-center group/btn relative ${
                                        expandedResource?.sequenceId === sequence.id && expandedResource?.type === 'exercises'
                                        ? 'bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/10' 
                                        : 'bg-orange-500/5 border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/40'
                                    }`}
                                >
                                    <div className={`p-2 rounded-full transition-transform ${
                                        expandedResource?.sequenceId === sequence.id && expandedResource?.type === 'exercises'
                                        ? 'bg-orange-500 text-white' 
                                        : 'bg-orange-500/10 text-orange-400 group-hover/btn:scale-110'
                                    }`}>
                                        <Pencil size={20} />
                                    </div>
                                    <span className={`text-sm font-medium ${
                                        expandedResource?.sequenceId === sequence.id && expandedResource?.type === 'exercises'
                                        ? 'text-white' 
                                        : 'text-slate-300 group-hover/btn:text-white'
                                    }`}>Exercices</span>
                                </button>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-space-950/50 border border-space-800/50 opacity-50 cursor-not-allowed gap-2 text-center">
                                    <Pencil size={20} className="text-space-600" />
                                    <span className="text-sm font-medium text-space-600">Exercices</span>
                                </div>
                            )}

                             {/* Correction */}
                             {sequence.pdfCorrection ? (
                                <button 
                                    onClick={() => toggleResource(sequence.id, 'correction', sequence.pdfCorrection)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all gap-2 text-center group/btn relative ${
                                        expandedResource?.sequenceId === sequence.id && expandedResource?.type === 'correction'
                                        ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/10' 
                                        : 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10 hover:border-green-500/40'
                                    }`}
                                >
                                    <div className={`p-2 rounded-full transition-transform ${
                                        expandedResource?.sequenceId === sequence.id && expandedResource?.type === 'correction'
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-green-500/10 text-green-400 group-hover/btn:scale-110'
                                    }`}>
                                        <CheckCircle size={20} />
                                    </div>
                                    <span className={`text-sm font-medium ${
                                        expandedResource?.sequenceId === sequence.id && expandedResource?.type === 'correction'
                                        ? 'text-white' 
                                        : 'text-slate-300 group-hover/btn:text-white'
                                    }`}>Corrigé</span>
                                </button>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-space-950/50 border border-space-800/50 opacity-50 cursor-not-allowed gap-2 text-center">
                                    <CheckCircle size={20} className="text-space-600" />
                                    <span className="text-sm font-medium text-space-600">Corrigé</span>
                                </div>
                            )}

                             {/* Flashcards */}
                             {sequence.flashcards.length > 0 ? (
                                <button 
                                    onClick={() => handleStartDrill(sequence.id)}
                                    className="flex flex-col items-center justify-center p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all gap-2 text-center group/btn"
                                >
                                    <div className="p-2 bg-purple-500/10 rounded-full text-purple-400 group-hover/btn:scale-110 transition-transform">
                                        <BrainCircuit size={20} />
                                    </div>
                                    <span className="text-sm font-medium text-slate-300 group-hover/btn:text-white">Flashcards</span>
                                </button>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-space-950/50 border border-space-800/50 opacity-50 cursor-not-allowed gap-2 text-center">
                                    <BrainCircuit size={20} className="text-space-600" />
                                    <span className="text-sm font-medium text-space-600">Flashcards</span>
                                </div>
                            )}

                        </div>

                        {/* Inline PDF Viewer */}
                        {expandedResource?.sequenceId === sequence.id && (
                            <div className="border-t border-space-800 bg-space-950/50 p-4 animate-fade-in">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <h4 className="text-sm font-bold text-space-400 uppercase tracking-wider flex items-center gap-2">
                                        {expandedResource.type === 'course' && <><FileText size={16} className="text-blue-500"/> Leçon</>}
                                        {expandedResource.type === 'exercises' && <><Pencil size={16} className="text-orange-500"/> Exercices</>}
                                        {expandedResource.type === 'correction' && <><CheckCircle size={16} className="text-green-500"/> Corrigé</>}
                                    </h4>
                                    <button 
                                        onClick={() => setExpandedResource(null)}
                                        className="text-space-500 hover:text-white p-1 rounded hover:bg-space-800 transition-colors"
                                        title="Fermer"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="w-full h-[600px] md:h-[800px] bg-space-900 rounded-lg border border-space-800 overflow-hidden shadow-inner">
                                    <iframe 
                                        src={getEmbedUrl(expandedResource.url)} 
                                        className="w-full h-full"
                                        title="PDF Viewer"
                                        allow="autoplay"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-space-950 text-slate-200 font-sans selection:bg-space-accent selection:text-space-950 flex flex-col">
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
      />

      {/* Admin Sequence Editor Modal */}
      {showSequenceAdmin && (
          <SequenceAdmin 
             sequence={editingSequence}
             availableCategories={currentLevel?.categories}
             defaultCategory={activeCategory || undefined}
             onSave={handleSaveSequence} 
             onCancel={() => setShowSequenceAdmin(false)}
          />
      )}

      {/* Drill Player Modal */}
      {drillSequence && (
          <FlashcardDrill 
             cards={drillSequence.flashcards}
             title={drillSequence.title}
             onClose={() => setDrillSequenceId(null)}
          />
      )}

      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
      
      {!loading && (
        <>
          <Navigation 
            title={
                (view.type === 'LEVEL' && currentLevel) ? currentLevel.name : 
                view.type === 'BLOG' ? 'Blog' :
                view.type === 'RENTREE' ? 'Rentrée' :
                view.type === 'ABOUT' ? 'À propos' :
                view.type === 'STATS' ? 'Statistiques' :
                undefined
            }
            onBack={
                view.type !== 'HOME' ? () => setView({ type: 'HOME' }) :
                undefined
            }
            onNavigateToLevel={handleNavigateToLevel}
            onNavigateToView={(v) => setView({ type: v })}
          />

          {renderTeacherBanner()}

          <main className="flex-grow pb-20">
            {view.type === 'HOME' && renderHome()}
            {view.type === 'LEVEL' && renderLevelView()}
            {view.type === 'BLOG' && <BlogView posts={blogPosts} isTeacherMode={isTeacherMode} onUpdatePosts={setBlogPosts} />}
            {view.type === 'RENTREE' && <RentreeView tracks={rentreeTracks} isTeacherMode={isTeacherMode} onUpdateTracks={setRentreeTracks} />}
            {view.type === 'ABOUT' && <AboutView data={aboutData} isTeacherMode={isTeacherMode} onUpdate={setAboutData} />}
            {view.type === 'STATS' && <StatsDashboard stats={stats} levels={data} />}
          </main>

          <Footer 
              onAdminClick={() => isTeacherMode ? setIsTeacherMode(false) : setShowLoginModal(true)} 
              onAboutClick={() => setView({ type: 'ABOUT' })}
          />
        </>
      )}
    </div>
  );
};

export default App;
