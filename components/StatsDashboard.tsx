import React from 'react';
import { SiteStats, Level } from '../types';
import { BarChart, Activity, Users, FileText, BrainCircuit, CheckCircle, Pencil } from 'lucide-react';

interface StatsDashboardProps {
  stats: SiteStats;
  levels: Level[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats, levels }) => {
  
  // Helpers to get names
  const getLevelName = (id: string) => levels.find(l => l.id === id)?.name || id;
  const getSequenceTitle = (id: string) => {
     for (const lvl of levels) {
         const seq = lvl.sequences.find(s => s.id === id);
         if (seq) return seq.title;
     }
     return id;
  };

  // Sort Levels by popularity
  const sortedLevels = Object.entries(stats.levelVisits)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([id, count]) => ({ name: getLevelName(id), count: count as number }));

  // Sort Sequences by popularity (Top 5)
  const sortedSequences = Object.entries(stats.sequenceVisits)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([id, count]) => ({ title: getSequenceTitle(id), count: count as number }));

  // Calculate percentages for tools
  const toolsValues = Object.values(stats.toolsUsage) as number[];
  const totalTools = toolsValues.reduce((a, b) => a + b, 0) || 1;

  const toolStats = [
      { label: 'Leçons', count: stats.toolsUsage.course, color: 'bg-blue-500', icon: FileText },
      { label: 'Exercices', count: stats.toolsUsage.exercises, color: 'bg-orange-500', icon: Pencil },
      { label: 'Flashcards', count: stats.toolsUsage.flashcards, color: 'bg-purple-500', icon: BrainCircuit },
      { label: 'Corrigés', count: stats.toolsUsage.correction, color: 'bg-green-500', icon: CheckCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in">
        <div className="flex items-center gap-3 mb-10 border-b border-space-800 pb-6">
            <div className="bg-space-800 p-3 rounded-lg text-space-accent">
                <Activity size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-100">Tableau de Bord</h1>
                <p className="text-space-400">Statistiques d'utilisation du site</p>
            </div>
        </div>

        {/* Global KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-space-900 border border-space-800 p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Users size={64} className="text-space-accent" />
                </div>
                <div className="text-space-400 text-sm font-bold uppercase tracking-wider mb-2">Visites Totales</div>
                <div className="text-4xl font-black text-white">{stats.totalVisits}</div>
            </div>
            
            <div className="bg-space-900 border border-space-800 p-6 rounded-xl shadow-lg">
                <div className="text-space-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <BrainCircuit size={16}/> Outils Favoris
                </div>
                <div className="space-y-3">
                    {/* Simple Bar Chart for Tools */}
                    {toolStats.sort((a,b) => b.count - a.count).map((item) => (
                        <div key={item.label} className="w-full">
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span className="flex items-center gap-1"><item.icon size={10}/> {item.label}</span>
                                <span className="font-bold">{item.count}</span>
                            </div>
                            <div className="w-full bg-space-950 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${item.color}`} 
                                    style={{ width: `${(item.count / totalTools) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular Levels */}
            <div className="bg-space-900 border border-space-800 p-6 rounded-xl shadow-lg lg:col-span-2">
                 <div className="text-space-400 text-sm font-bold uppercase tracking-wider mb-4">Niveaux les plus consultés</div>
                 <div className="grid grid-cols-2 gap-4">
                     {sortedLevels.length > 0 ? sortedLevels.map((lvl, idx) => (
                         <div key={idx} className="flex items-center justify-between bg-space-950 p-3 rounded-lg border border-space-800">
                             <span className="font-medium text-slate-300">{lvl.name}</span>
                             <span className="bg-space-800 text-space-accent px-2 py-0.5 rounded text-xs font-bold">{lvl.count}</span>
                         </div>
                     )) : (
                         <div className="col-span-2 text-center text-space-600 italic py-4">Aucune donnée</div>
                     )}
                 </div>
            </div>
        </div>

        {/* Top Sequences */}
        <div className="bg-space-900 border border-space-800 rounded-xl shadow-lg overflow-hidden">
             <div className="p-6 border-b border-space-800 bg-space-800/30">
                 <h3 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                     <BarChart size={20} className="text-space-accent" /> Top 5 Séquences
                 </h3>
             </div>
             <div className="divide-y divide-space-800">
                 {sortedSequences.length > 0 ? sortedSequences.map((seq, idx) => (
                     <div key={idx} className="p-4 flex items-center justify-between hover:bg-space-800/20 transition-colors">
                         <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-full bg-space-950 border border-space-700 flex items-center justify-center font-bold text-space-500 text-sm">
                                 {idx + 1}
                             </div>
                             <span className="text-slate-300 font-medium">{seq.title}</span>
                         </div>
                         <div className="text-white font-bold text-lg">{seq.count} <span className="text-xs text-space-500 font-normal">vues</span></div>
                     </div>
                 )) : (
                     <div className="p-8 text-center text-space-600 italic">Aucune donnée enregistrée pour le moment.</div>
                 )}
             </div>
        </div>
    </div>
  );
};