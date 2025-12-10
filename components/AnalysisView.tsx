import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, BarChart2, Loader2, TrendingUp, AlertTriangle, CheckCircle, Clock, Calendar, X, Settings, PieChart as PieIcon, FileDown, Trash2, List } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import { ClassGroup, HomeworkSession, HomeworkRecord, Student, HomeworkStatus, SchoolPeriod } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { PDFReportGenerator } from './PDFReportGenerator';
import { ConfirmationModal } from './ConfirmationModal';

interface Props {
  classGroup: ClassGroup;
}

const COLORS = {
  [HomeworkStatus.FAIT]: '#22c55e', // success
  [HomeworkStatus.NON_FAIT]: '#ef4444', // danger
  [HomeworkStatus.INCOMPLET]: '#f59e0b', // warning
  [HomeworkStatus.ABSENT]: '#94a3b8', // secondary
};

const STATUS_LABELS = {
  [HomeworkStatus.FAIT]: 'Fait',
  [HomeworkStatus.NON_FAIT]: 'Non Fait',
  [HomeworkStatus.INCOMPLET]: 'Incomplet',
  [HomeworkStatus.ABSENT]: 'Absent',
};

export const AnalysisView: React.FC<Props> = ({ classGroup }) => {
  const [activeTab, setActiveTab] = useState<'GLOBAL' | 'STUDENTS' | 'SESSIONS' | 'AI'>('GLOBAL');
  const [sessions, setSessions] = useState<HomeworkSession[]>([]);
  const [allRecords, setAllRecords] = useState<HomeworkRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [periods, setPeriods] = useState<SchoolPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('all');
  const [showPeriodConfig, setShowPeriodConfig] = useState(false);
  
  // AI State
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // PDF State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Student Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Delete Session State
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classGroup.id]);

  const loadData = () => {
    setStudents(StorageService.getStudents(classGroup.id));
    setPeriods(StorageService.getPeriods());
    
    // Load all data initially
    const allSessions = StorageService.getSessions(classGroup.id);
    const records: HomeworkRecord[] = [];
    allSessions.forEach(session => {
        records.push(...StorageService.getRecords(session.id));
    });

    setSessions(allSessions);
    setAllRecords(records);
  };

  const confirmDeleteSession = async () => {
    if (sessionToDelete) {
      StorageService.deleteSession(sessionToDelete);
      await StorageService.syncToCloud(); // Sync changes
      loadData(); // Reload UI
      setSessionToDelete(null);
    }
  };

  // --- Filtering based on Period ---

  const filteredData = useMemo(() => {
    let currentSessions = sessions;
    
    if (selectedPeriodId !== 'all') {
        const period = periods.find(p => p.id === selectedPeriodId);
        if (period) {
            const start = new Date(period.startDate).getTime();
            const end = new Date(period.endDate).getTime();
            currentSessions = sessions.filter(s => {
                const sDate = new Date(s.date).getTime();
                // Include ends
                return sDate >= start && sDate <= end;
            });
        }
    }

    const currentSessionIds = new Set(currentSessions.map(s => s.id));
    const currentRecords = allRecords.filter(r => currentSessionIds.has(r.sessionId));

    return { sessions: currentSessions, records: currentRecords };
  }, [sessions, allRecords, selectedPeriodId, periods]);


  // --- Statistics Calculation ---
  
  const globalStats = useMemo(() => {
    const counts = {
      [HomeworkStatus.FAIT]: 0,
      [HomeworkStatus.NON_FAIT]: 0,
      [HomeworkStatus.INCOMPLET]: 0,
      [HomeworkStatus.ABSENT]: 0,
    };
    filteredData.records.forEach(r => {
      if (counts[r.status] !== undefined) counts[r.status]++;
    });

    const total = filteredData.records.length;
    const data = Object.keys(counts).map(key => ({
      name: STATUS_LABELS[key as HomeworkStatus],
      value: counts[key as HomeworkStatus],
      key: key
    })).filter(d => d.value > 0);

    return { counts, total, data };
  }, [filteredData]);

  const studentStats = useMemo(() => {
    return students.map(student => {
      const studentRecords = filteredData.records.filter(r => r.studentId === student.id);
      const total = studentRecords.length;
      if (total === 0) return { student, score: 0, done: 0, missed: 0, incomplete: 0, absent: 0, total: 0 };

      const done = studentRecords.filter(r => r.status === HomeworkStatus.FAIT).length;
      const missed = studentRecords.filter(r => r.status === HomeworkStatus.NON_FAIT).length;
      const incomplete = studentRecords.filter(r => r.status === HomeworkStatus.INCOMPLET).length;
      const absent = studentRecords.filter(r => r.status === HomeworkStatus.ABSENT).length;

      // Score calculation
      const validAttempts = total - absent;
      const score = validAttempts > 0 
        ? Math.round(((done * 1) + (incomplete * 0.5)) / validAttempts * 100) 
        : 100;

      return { student, score, done, missed, incomplete, absent, total };
    }).sort((a, b) => a.score - b.score);
  }, [students, filteredData]);

  // Sort student stats alphabetically for the list view
  const studentStatsAlpha = useMemo(() => {
    return [...studentStats].sort((a, b) => a.student.name.localeCompare(b.student.name));
  }, [studentStats]);

  const generateReport = async () => {
    setLoading(true);
    setAiReport(null);
    const report = await GeminiService.analyzePerformance(
        classGroup.name, 
        filteredData.sessions, 
        students, 
        filteredData.records
    );
    setAiReport(report);
    setLoading(false);
  };

  const handleUpdatePeriods = (newPeriods: SchoolPeriod[]) => {
      StorageService.savePeriods(newPeriods);
      setPeriods(newPeriods);
      setShowPeriodConfig(false);
      StorageService.syncToCloud();
  };

  const getPeriodName = () => {
      if (selectedPeriodId === 'all') return 'Année Scolaire Complète';
      return periods.find(p => p.id === selectedPeriodId)?.name || 'Période';
  };

  // Only show periods that have started or are explicitly configured
  const visiblePeriods = periods.filter(p => {
      return new Date(p.startDate) <= new Date() || showPeriodConfig; // show all if config mode is theoretically accessed (though this is dropdown)
  });

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-slate-100 p-4 rounded-full mb-4">
          <BarChart2 className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Pas encore de données</h3>
        <p className="text-slate-500 max-w-sm mt-2">
          Commencez par "Noter les devoirs" pour voir apparaître des graphiques et des statistiques ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in relative pb-10">
      
      {/* Period Selector Bar & Actions */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
         <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar size={18} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">Période :</span>
            <select 
                value={selectedPeriodId} 
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 flex-1 sm:flex-none sm:min-w-[200px]"
            >
                <option value="all">Année complète (Tout)</option>
                {visiblePeriods.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
            <button 
                onClick={() => setShowPeriodConfig(true)}
                className="text-slate-400 hover:text-primary p-2 hover:bg-slate-50 rounded-full transition-colors"
                title="Configurer les périodes"
            >
                <Settings size={18} />
            </button>
         </div>

         {/* PDF Export Button */}
         {sessions.length > 0 && (
             <button
                onClick={() => setIsGeneratingPDF(true)}
                disabled={isGeneratingPDF}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-70 disabled:cursor-wait text-sm font-medium"
             >
                {isGeneratingPDF ? <Loader2 className="animate-spin" size={16} /> : <FileDown size={16} />}
                {isGeneratingPDF ? 'Génération PDF...' : 'Exporter Bilans PDF'}
             </button>
         )}
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1 space-x-1 bg-slate-100 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('GLOBAL')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium leading-5 rounded-lg transition-all whitespace-nowrap
            ${activeTab === 'GLOBAL' ? 'bg-white text-primary shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium leading-5 rounded-lg transition-all whitespace-nowrap
            ${activeTab === 'STUDENTS' ? 'bg-white text-primary shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
        >
          Par Élève
        </button>
        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium leading-5 rounded-lg transition-all whitespace-nowrap
            ${activeTab === 'SESSIONS' ? 'bg-white text-primary shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
        >
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('AI')}
          className={`flex-1 min-w-[120px] py-2.5 text-sm font-medium leading-5 rounded-lg transition-all whitespace-nowrap
            ${activeTab === 'AI' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}`}
        >
          IA Assistant
        </button>
      </div>

      {/* --- GLOBAL VIEW --- */}
      {activeTab === 'GLOBAL' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <StatCard title="Sessions" value={filteredData.sessions.length} icon={Clock} color="text-blue-600" bg="bg-blue-50" />
             <StatCard title="Faits" value={globalStats.counts.FAIT} icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
             <StatCard title="Non Faits" value={globalStats.counts.NON_FAIT} icon={AlertTriangle} color="text-red-600" bg="bg-red-50" />
             <StatCard title="Réussite" value={`${globalStats.total > 0 ? Math.round((globalStats.counts.FAIT / globalStats.total) * 100) : 0}%`} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[320px] flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Répartition Globale</h3>
              {globalStats.total > 0 ? (
                  <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={globalStats.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {globalStats.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.key as HomeworkStatus]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
              ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                      <PieIcon className="w-10 h-10 mb-2 opacity-20" />
                      <p>Pas de données pour cette période</p>
                  </div>
              )}
            </div>

            {/* Bar Chart (Struggling Students) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[320px] flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Élèves en difficulté (Top 5)</h3>
              {studentStats.some(s => s.missed > 0) ? (
                <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={studentStats.filter(s => s.missed > 0).slice(0, 5)}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis dataKey="student.name" type="category" width={100} tick={{fontSize: 12}} />
                        <Tooltip />
                        <Bar dataKey="missed" name="Devoirs Non Faits" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                    <CheckCircle className="w-10 h-10 mb-2 text-green-200" />
                    <p className="text-sm">Aucun devoir "Non Fait" sur cette période.</p>
                    <p className="text-xs">Bravo à la classe !</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- STUDENT VIEW --- */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Élève</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Fait</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Non Fait</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Incomplet</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-200">
                 {studentStatsAlpha.map((stat) => (
                   <tr 
                     key={stat.student.id} 
                     className="hover:bg-indigo-50 cursor-pointer transition-colors group"
                     onClick={() => setSelectedStudent(stat.student)}
                   >
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="font-medium text-slate-900">{stat.student.name}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${stat.score >= 80 ? 'bg-green-100 text-green-800' : 
                            stat.score >= 50 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {stat.score}%
                        </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500 hidden sm:table-cell">
                       {stat.done}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-red-500">
                       {stat.missed > 0 ? stat.missed : '-'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-yellow-600 hidden sm:table-cell">
                       {stat.incomplete > 0 ? stat.incomplete : '-'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button className="text-primary bg-indigo-50 hover:bg-primary hover:text-white px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 mx-auto">
                           <BarChart2 size={14} /> Bilan
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

      {/* --- SESSIONS VIEW --- */}
      {activeTab === 'SESSIONS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <List size={20} /> Historique des contrôles
                </h3>
                <p className="text-xs text-slate-500 mt-1">Liste des sessions enregistrées pour la période sélectionnée.</p>
            </div>
            {filteredData.sessions.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Aucune session trouvée sur cette période.</p>
                </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {filteredData.sessions.map((session) => (
                        <li key={session.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">
                                        {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                    <div className="text-sm text-slate-500">{session.description}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSessionToDelete(session.id)}
                                className="text-slate-300 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                title="Supprimer cette saisie"
                            >
                                <Trash2 size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
      )}

      {/* --- AI VIEW --- */}
      {activeTab === 'AI' && (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100 shadow-md animate-in slide-in-from-right-4 duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                  <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                      <Sparkles className="text-indigo-600" />
                      Analyse Intelligente
                  </h3>
                  <p className="text-sm text-indigo-700 mt-1">
                      Analyse basée sur : <strong>{getPeriodName()}</strong>
                  </p>
              </div>
              <button 
                  onClick={generateReport}
                  disabled={loading}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-all"
              >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {loading ? 'Analyse en cours...' : 'Générer le Rapport'}
              </button>
          </div>

          {aiReport ? (
              <div className="bg-white p-6 rounded-xl border border-indigo-50 shadow-sm prose prose-indigo max-w-none text-slate-800">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
              </div>
          ) : (
            <div className="text-center py-12 text-indigo-300 border-2 border-dashed border-indigo-100 rounded-xl">
              <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Cliquez sur "Générer" pour obtenir une analyse IA sur cette période.</p>
            </div>
          )}
        </div>
      )}

      {/* --- HIDDEN PDF GENERATOR --- */}
      {isGeneratingPDF && (
         <PDFReportGenerator
            classGroup={classGroup}
            students={students}
            sessions={filteredData.sessions}
            records={filteredData.records}
            periodName={getPeriodName()}
            onComplete={() => setIsGeneratingPDF(false)}
         />
      )}

      {/* --- MODALS --- */}
      
      {showPeriodConfig && (
          <PeriodConfigModal 
            periods={periods} 
            onSave={handleUpdatePeriods} 
            onClose={() => setShowPeriodConfig(false)} 
          />
      )}

      {selectedStudent && (
          <StudentDetailModal 
            student={selectedStudent}
            records={filteredData.records.filter(r => r.studentId === selectedStudent.id)}
            sessions={filteredData.sessions}
            periodName={getPeriodName()}
            onClose={() => setSelectedStudent(null)}
          />
      )}

      <ConfirmationModal 
        isOpen={!!sessionToDelete}
        title="Supprimer la session"
        message="Voulez-vous vraiment supprimer cette saisie de devoirs ? Toutes les notes associées à cette date seront perdues."
        onConfirm={confirmDeleteSession}
        onCancel={() => setSessionToDelete(null)}
        isDangerous={true}
      />
    </div>
  );
};

// --- Sub-Components ---

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
    <div className={`w-10 h-10 rounded-lg ${bg} ${color} flex items-center justify-center mb-3`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  </div>
);

// Student Detail Modal (Pie + Timeline)
const StudentDetailModal = ({ student, records, sessions, periodName, onClose }: { student: Student, records: HomeworkRecord[], sessions: HomeworkSession[], periodName: string, onClose: () => void }) => {
    // Delay chart rendering to allow modal to open and dimensions to settle
    const [isChartVisible, setIsChartVisible] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsChartVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    // Merge sessions and records to create timeline
    const timeline = sessions.map(session => {
        const record = records.find(r => r.sessionId === session.id);
        if (!record) return null; // Only show sessions relevant to the period (though filteredData should handle this)
        return {
            date: session.date,
            description: session.description,
            status: record.status
        };
    })
    .filter(item => item !== null) // Remove nulls
    .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime());

    // Pie Data
    const counts = {
      [HomeworkStatus.FAIT]: records.filter(r => r.status === HomeworkStatus.FAIT).length,
      [HomeworkStatus.NON_FAIT]: records.filter(r => r.status === HomeworkStatus.NON_FAIT).length,
      [HomeworkStatus.INCOMPLET]: records.filter(r => r.status === HomeworkStatus.INCOMPLET).length,
      [HomeworkStatus.ABSENT]: records.filter(r => r.status === HomeworkStatus.ABSENT).length,
    };
    const pieData = Object.keys(counts).map(key => ({
      name: STATUS_LABELS[key as HomeworkStatus],
      value: counts[key as HomeworkStatus],
      key: key
    })).filter(d => d.value > 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="font-bold text-xl text-slate-800">{student.name}</h3>
                        <p className="text-sm text-slate-500">{periodName}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-6 space-y-8">
                    {/* Charts Section */}
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                             <BarChart2 size={18} /> Bilan Graphique
                        </h4>
                        <div className="h-64 w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
                             {pieData.length > 0 ? (
                                isChartVisible ? (
                                    <PieChart width={300} height={250} className="mx-auto focus:outline-none">
                                        <Pie
                                        data={pieData}
                                        cx={150} // Explicit numbers to avoid calculation errors
                                        cy={125}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.key as HomeworkStatus]} />
                                        ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                ) : (
                                    <Loader2 className="animate-spin text-primary opacity-50" />
                                )
                             ) : (
                                 <div className="flex flex-col items-center text-slate-400">
                                     <PieIcon size={32} className="mb-2 opacity-30"/>
                                     <p>Aucune donnée graphique pour cette période</p>
                                 </div>
                             )}
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                             <Clock size={18} /> Frise Chronologique
                        </h4>
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                            {timeline.length > 0 ? timeline.map((item, idx) => (
                                <div key={idx} className="mb-6 ml-6 relative">
                                    <span className={`absolute -left-[31px] flex items-center justify-center w-8 h-8 rounded-full ring-4 ring-white ${
                                        item!.status === HomeworkStatus.FAIT ? 'bg-green-100 text-green-600' :
                                        item!.status === HomeworkStatus.NON_FAIT ? 'bg-red-100 text-red-600' :
                                        item!.status === HomeworkStatus.INCOMPLET ? 'bg-orange-100 text-orange-600' :
                                        'bg-slate-100 text-slate-400'
                                    }`}>
                                        {item!.status === HomeworkStatus.FAIT && <CheckCircle size={14} />}
                                        {item!.status === HomeworkStatus.NON_FAIT && <X size={14} />}
                                        {item!.status === HomeworkStatus.INCOMPLET && <AlertTriangle size={14} />}
                                        {item!.status === HomeworkStatus.ABSENT && <Clock size={14} />}
                                    </span>
                                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm font-semibold text-slate-800">
                                                {new Date(item!.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                item!.status === HomeworkStatus.FAIT ? 'bg-green-100 text-green-700' :
                                                item!.status === HomeworkStatus.NON_FAIT ? 'bg-red-100 text-red-700' :
                                                item!.status === HomeworkStatus.INCOMPLET ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                                {STATUS_LABELS[item!.status]}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm mt-1">{item!.description}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-400 italic ml-6">Aucun historique pour cette période.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Simple Modal to add/edit periods
const PeriodConfigModal = ({ periods, onSave, onClose }: { periods: SchoolPeriod[], onSave: (p: SchoolPeriod[]) => void, onClose: () => void }) => {
    const [localPeriods, setLocalPeriods] = useState<SchoolPeriod[]>(periods);

    const handleChange = (id: string, field: keyof SchoolPeriod, value: string) => {
        setLocalPeriods(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleAdd = () => {
        setLocalPeriods([...localPeriods, {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Nouvelle Période',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        }]);
    };

    const handleDelete = (id: string) => {
        setLocalPeriods(prev => prev.filter(p => p.id !== id));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-lg">Configuration des Périodes</h3>
                </div>
                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {localPeriods.map(p => (
                        <div key={p.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                             <div className="flex justify-between items-center gap-2">
                                 <input 
                                    type="text" 
                                    value={p.name} 
                                    onChange={(e) => handleChange(p.id, 'name', e.target.value)}
                                    className="font-semibold bg-transparent border-none focus:ring-0 p-0 text-slate-800 w-full"
                                 />
                                 <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600"><X size={18} /></button>
                             </div>
                             <div className="flex gap-2">
                                 <input 
                                    type="date" 
                                    value={p.startDate} 
                                    onChange={(e) => handleChange(p.id, 'startDate', e.target.value)}
                                    className="text-xs border rounded px-2 py-1"
                                 />
                                 <span className="text-slate-400">-</span>
                                 <input 
                                    type="date" 
                                    value={p.endDate} 
                                    onChange={(e) => handleChange(p.id, 'endDate', e.target.value)}
                                    className="text-xs border rounded px-2 py-1"
                                 />
                             </div>
                        </div>
                    ))}
                    <button onClick={handleAdd} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-primary hover:text-primary transition-colors text-sm font-medium">
                        + Ajouter une période
                    </button>
                </div>
                <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium">Annuler</button>
                    <button onClick={() => onSave(localPeriods)} className="px-4 py-2 bg-primary text-white rounded-lg font-medium">Enregistrer</button>
                </div>
            </div>
        </div>
    );
};