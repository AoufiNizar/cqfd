import React, { useEffect, useRef, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ClassGroup, Student, HomeworkSession, HomeworkRecord, HomeworkStatus } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, X, Clock } from 'lucide-react';

interface Props {
  classGroup: ClassGroup;
  students: Student[];
  sessions: HomeworkSession[];
  records: HomeworkRecord[];
  periodName: string;
  onComplete: () => void;
}

const COLORS = {
  [HomeworkStatus.FAIT]: '#22c55e',
  [HomeworkStatus.NON_FAIT]: '#ef4444',
  [HomeworkStatus.INCOMPLET]: '#f59e0b',
  [HomeworkStatus.ABSENT]: '#94a3b8',
};

const STATUS_LABELS = {
  [HomeworkStatus.FAIT]: 'Fait',
  [HomeworkStatus.NON_FAIT]: 'Non Fait',
  [HomeworkStatus.INCOMPLET]: 'Incomplet',
  [HomeworkStatus.ABSENT]: 'Absent',
};

export const PDFReportGenerator: React.FC<Props> = ({ classGroup, students, sessions, records, periodName, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate stats for all students
  const studentsWithStats = useMemo(() => {
    // Class average calculation
    let totalClassScore = 0;
    let studentCount = 0;

    const stats = students.map(student => {
      const studentRecords = records.filter(r => r.studentId === student.id);
      const total = studentRecords.length;
      
      const done = studentRecords.filter(r => r.status === HomeworkStatus.FAIT).length;
      const missed = studentRecords.filter(r => r.status === HomeworkStatus.NON_FAIT).length;
      const incomplete = studentRecords.filter(r => r.status === HomeworkStatus.INCOMPLET).length;
      const absent = studentRecords.filter(r => r.status === HomeworkStatus.ABSENT).length;

      const validAttempts = total - absent;
      const score = validAttempts > 0 
        ? Math.round(((done * 1) + (incomplete * 0.5)) / validAttempts * 100) 
        : 100;

      if (total > 0) {
        totalClassScore += score;
        studentCount++;
      }

      // Timeline data (last 10 items)
      const timeline = sessions.map(session => {
        const record = records.find(r => r.sessionId === session.id && r.studentId === student.id);
        if (!record) return null;
        return {
            date: session.date,
            description: session.description,
            status: record.status
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime())
      // .slice(0, 15); // Limit for PDF space

      return { 
        student, 
        score, 
        done, 
        missed, 
        incomplete, 
        absent, 
        total,
        timeline,
        pieData: [
           { name: 'Fait', value: done, fill: COLORS[HomeworkStatus.FAIT] },
           { name: 'Non Fait', value: missed, fill: COLORS[HomeworkStatus.NON_FAIT] },
           { name: 'Incomplet', value: incomplete, fill: COLORS[HomeworkStatus.INCOMPLET] },
           { name: 'Absent', value: absent, fill: COLORS[HomeworkStatus.ABSENT] },
        ].filter(d => d.value > 0)
      };
    });

    const classAverage = studentCount > 0 ? Math.round(totalClassScore / studentCount) : 100;

    return stats.map(s => ({...s, classAverage})).sort((a, b) => a.student.name.localeCompare(b.student.name));
  }, [students, sessions, records]);

  useEffect(() => {
    const generate = async () => {
      if (!containerRef.current) return;

      // Wait a moment for chart animations (even if disabled, safer)
      await new Promise(resolve => setTimeout(resolve, 1500));

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pages = containerRef.current.querySelectorAll('.student-page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        // Use html2canvas
        const canvas = await html2canvas(page, {
          scale: 2, // Higher quality
          logging: false,
          useCORS: true
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (i > 0) doc.addPage();
        doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      const cleanName = classGroup.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      doc.save(`Bilan_${cleanName}_${periodName}.pdf`);
      
      onComplete();
    };

    generate();
  }, [classGroup.name, periodName, onComplete]);

  return (
    <div className="fixed top-0 left-0 w-full h-0 overflow-hidden z-[-50]">
      <div ref={containerRef}>
        {studentsWithStats.map((stat, idx) => (
          <div 
            key={stat.student.id} 
            className="student-page w-[297mm] h-[210mm] bg-white p-8 flex flex-col box-border relative"
            style={{ width: '1122px', height: '793px' }} // Approx pixels for A4 landscape 96dpi
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-indigo-500 pb-4 mb-6">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900">{stat.student.name}</h1>
                  <p className="text-lg text-slate-500">{classGroup.name} - {periodName}</p>
               </div>
               <div className="text-right">
                  <div className="text-sm text-slate-400">Généré le {new Date().toLocaleDateString('fr-FR')}</div>
                  <div className="text-3xl font-bold text-indigo-600">{stat.score}/100</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Score de sérieux</div>
               </div>
            </div>

            <div className="flex gap-8 h-full">
               {/* Left Column: Charts (60%) */}
               <div className="w-[60%] grid grid-cols-2 grid-rows-2 gap-6 h-[580px]">
                  
                  {/* Chart 1: Pie Distribution */}
                  <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-200">
                     <h3 className="font-semibold text-slate-700 mb-2 w-full text-center">Répartition des devoirs</h3>
                     {stat.pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={stat.pieData}
                                 cx="50%"
                                 cy="50%"
                                 outerRadius={80}
                                 dataKey="value"
                                 label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}
                                 isAnimationActive={false}
                              >
                                 {stat.pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                 ))}
                              </Pie>
                           </PieChart>
                        </ResponsiveContainer>
                     ) : <p className="text-slate-400 italic">Aucune donnée</p>}
                  </div>

                   {/* Chart 2: Counts Bar */}
                   <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-200">
                     <h3 className="font-semibold text-slate-700 mb-2 w-full text-center">Quantités par statut</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                           { name: 'Fait', value: stat.done, fill: COLORS[HomeworkStatus.FAIT] },
                           { name: 'Non Fait', value: stat.missed, fill: COLORS[HomeworkStatus.NON_FAIT] },
                           { name: 'Incomplet', value: stat.incomplete, fill: COLORS[HomeworkStatus.INCOMPLET] },
                           { name: 'Absent', value: stat.absent, fill: COLORS[HomeworkStatus.ABSENT] },
                        ]}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="name" tick={{fontSize: 10}} />
                           <YAxis allowDecimals={false} />
                           <Bar dataKey="value" isAnimationActive={false}>
                              {
                                 [COLORS[HomeworkStatus.FAIT], COLORS[HomeworkStatus.NON_FAIT], COLORS[HomeworkStatus.INCOMPLET], COLORS[HomeworkStatus.ABSENT]].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry} />
                                 ))
                              }
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>

                  {/* Chart 3: Score Gauge representation (using simple bar for now) */}
                  <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-200">
                     <h3 className="font-semibold text-slate-700 mb-2 w-full text-center">Taux de Devoirs Rendus</h3>
                     <div className="w-full h-full flex items-center justify-center">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                           <svg className="w-full h-full" viewBox="0 0 36 36">
                              <path
                                 className="text-slate-200"
                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                 fill="none"
                                 stroke="currentColor"
                                 strokeWidth="4"
                              />
                              <path
                                 className={stat.score >= 80 ? "text-green-500" : stat.score >= 50 ? "text-yellow-500" : "text-red-500"}
                                 strokeDasharray={`${stat.score}, 100`}
                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                 fill="none"
                                 stroke="currentColor"
                                 strokeWidth="4"
                              />
                           </svg>
                           <div className="absolute flex flex-col items-center">
                              <span className="text-3xl font-bold text-slate-800">{stat.score}%</span>
                              <span className="text-xs text-slate-500">Sérieux</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Chart 4: Comparison vs Class */}
                  <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-200">
                     <h3 className="font-semibold text-slate-700 mb-2 w-full text-center">Comparaison Moyenne Classe</h3>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                           { name: 'Élève', value: stat.score, fill: '#4f46e5' },
                           { name: 'Classe', value: stat.classAverage, fill: '#94a3b8' },
                        ]}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="name" />
                           <YAxis domain={[0, 100]} />
                           <Bar dataKey="value" barSize={40} isAnimationActive={false}>
                              <Cell fill="#4f46e5" />
                              <Cell fill="#94a3b8" />
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Right Column: Timeline (40%) */}
               <div className="w-[40%] bg-slate-50 rounded-xl p-6 border border-slate-200 h-[580px] overflow-hidden relative">
                  <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">
                     <Clock size={20} /> Historique ({periodName})
                  </h3>
                  <div className="space-y-4">
                     {stat.timeline.slice(0, 11).map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                           <div className={`mt-1 min-w-[12px] h-[12px] rounded-full ${
                              item!.status === HomeworkStatus.FAIT ? 'bg-green-500' :
                              item!.status === HomeworkStatus.NON_FAIT ? 'bg-red-500' :
                              item!.status === HomeworkStatus.INCOMPLET ? 'bg-orange-500' : 'bg-slate-300'
                           }`} />
                           <div>
                              <div className="text-sm font-bold text-slate-800">
                                 {new Date(item!.date).toLocaleDateString('fr-FR')}
                              </div>
                              <div className="text-xs text-slate-500 truncate w-[220px]">
                                 {item!.description}
                              </div>
                           </div>
                           <div className={`ml-auto text-xs font-bold px-2 py-0.5 rounded ${
                               item!.status === HomeworkStatus.FAIT ? 'bg-green-100 text-green-700' :
                               item!.status === HomeworkStatus.NON_FAIT ? 'bg-red-100 text-red-700' :
                               item!.status === HomeworkStatus.INCOMPLET ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                           }`}>
                              {STATUS_LABELS[item!.status].toUpperCase()}
                           </div>
                        </div>
                     ))}
                     {stat.timeline.length > 11 && (
                        <p className="text-center text-xs text-slate-400 italic mt-4">... et {stat.timeline.length - 11} autres entrées ...</p>
                     )}
                     {stat.timeline.length === 0 && (
                        <p className="text-slate-400 italic">Aucun enregistrement sur cette période.</p>
                     )}
                  </div>
               </div>
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-6 left-8 right-8 text-center text-slate-400 text-xs border-t pt-2">
               Généré par FINA - Application de suivi pédagogique
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
