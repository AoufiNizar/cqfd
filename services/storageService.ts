import { ClassGroup, Student, HomeworkSession, HomeworkRecord, SchoolPeriod } from '../types';
import { supabase } from './supabaseClient';

const KEYS = {
  CLASSES: 'cda_classes',
  STUDENTS: 'cda_students',
  SESSIONS: 'cda_sessions',
  RECORDS: 'cda_records',
  PERIODS: 'cda_periods',
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const StorageService = {
  // Classes
  getClasses: (): ClassGroup[] => {
    const data = localStorage.getItem(KEYS.CLASSES);
    return data ? JSON.parse(data) : [];
  },
  addClass: (name: string): ClassGroup => {
    const classes = StorageService.getClasses();
    const newClass: ClassGroup = { id: generateId(), name };
    localStorage.setItem(KEYS.CLASSES, JSON.stringify([...classes, newClass]));
    return newClass;
  },
  deleteClass: (id: string) => {
    const classes = StorageService.getClasses().filter(c => c.id !== id);
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
    // Also delete associated students
    const students = StorageService.getStudentsRaw().filter(s => s.classId !== id);
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
    // Also delete associated sessions
    const sessions = StorageService.getSessions().filter(s => s.classId !== id);
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
    // Clean records for deleted sessions
    const sessionIds = new Set(sessions.map(s => s.id)); // These are remaining sessions
    const records = StorageService.getAllRecords().filter(r => sessionIds.has(r.sessionId));
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
  },

  // Students
  getStudents: (classId?: string): Student[] => {
    const data = localStorage.getItem(KEYS.STUDENTS);
    const allStudents: Student[] = data ? JSON.parse(data) : [];
    let result = allStudents;
    
    if (classId) {
      result = allStudents.filter(s => s.classId === classId);
    }
    // Always sort alphabetically by name
    return result.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
  },
  getStudentsRaw: (): Student[] => {
    const data = localStorage.getItem(KEYS.STUDENTS);
    return data ? JSON.parse(data) : [];
  },
  addStudent: (name: string, classId: string): Student => {
    const allStudents = StorageService.getStudentsRaw();
    const newStudent: Student = { id: generateId(), name, classId };
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify([...allStudents, newStudent]));
    return newStudent;
  },
  deleteStudent: (id: string) => {
    const allStudents = StorageService.getStudentsRaw();
    const filtered = allStudents.filter(s => s.id !== id);
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(filtered));
    
    // Clean records for this student
    const allRecords = StorageService.getAllRecords();
    const cleanRecords = allRecords.filter(r => r.studentId !== id);
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(cleanRecords));
  },

  // Sessions
  getSessions: (classId?: string): HomeworkSession[] => {
    const data = localStorage.getItem(KEYS.SESSIONS);
    const allSessions: HomeworkSession[] = data ? JSON.parse(data) : [];
    const sorted = allSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (classId) {
      return sorted.filter(s => s.classId === classId);
    }
    return sorted;
  },
  createSession: (classId: string, date: string, description: string): HomeworkSession => {
    const sessions = StorageService.getSessions();
    const newSession: HomeworkSession = { id: generateId(), classId, date, description };
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify([...sessions, newSession]));
    return newSession;
  },
  deleteSession: (sessionId: string) => {
    // 1. Remove the session object
    const allSessions = StorageService.getSessions(); // actually gets all, not filtered if no arg, wait.. getSessions logic sorts and parses.
    // To be safe let's get raw or use the method without filter logic if possible, 
    // but getSessions() without arg returns ALL sorted. That works.
    const remainingSessions = allSessions.filter(s => s.id !== sessionId);
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(remainingSessions));

    // 2. Remove all records associated with this session
    const allRecords = StorageService.getAllRecords();
    const remainingRecords = allRecords.filter(r => r.sessionId !== sessionId);
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(remainingRecords));
  },

  // Records
  getAllRecords: (): HomeworkRecord[] => {
     const data = localStorage.getItem(KEYS.RECORDS);
     return data ? JSON.parse(data) : [];
  },
  getRecords: (sessionId: string): HomeworkRecord[] => {
    return StorageService.getAllRecords().filter(r => r.sessionId === sessionId);
  },
  saveRecords: (records: HomeworkRecord[]) => {
    let allRecords = StorageService.getAllRecords();
    const recordIds = new Set(records.map(r => r.id));
    allRecords = allRecords.filter(r => !recordIds.has(r.id));
    localStorage.setItem(KEYS.RECORDS, JSON.stringify([...allRecords, ...records]));
  },

  // Periods
  getPeriods: (): SchoolPeriod[] => {
    const data = localStorage.getItem(KEYS.PERIODS);
    if (!data) {
        const year = new Date().getFullYear();
        const startYear = new Date().getMonth() > 7 ? year : year - 1;
        const defaults = [
            { id: 'p1', name: 'Trimestre 1', startDate: `${startYear}-09-01`, endDate: `${startYear}-12-31` },
            { id: 'p2', name: 'Trimestre 2', startDate: `${startYear+1}-01-01`, endDate: `${startYear+1}-03-31` },
            { id: 'p3', name: 'Trimestre 3', startDate: `${startYear+1}-04-01`, endDate: `${startYear+1}-07-07` },
        ];
        localStorage.setItem(KEYS.PERIODS, JSON.stringify(defaults));
        return defaults;
    }
    return JSON.parse(data);
  },
  savePeriods: (periods: SchoolPeriod[]) => {
      localStorage.setItem(KEYS.PERIODS, JSON.stringify(periods));
  },

  // --- LOCAL JSON EXPORT/IMPORT ---

  exportAllData: (): string => {
    const data = {
      classes: JSON.parse(localStorage.getItem(KEYS.CLASSES) || '[]'),
      students: JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]'),
      sessions: JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]'),
      records: JSON.parse(localStorage.getItem(KEYS.RECORDS) || '[]'),
      periods: JSON.parse(localStorage.getItem(KEYS.PERIODS) || '[]'),
      timestamp: new Date().toISOString(),
      version: 1
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data.classes) || !Array.isArray(data.students)) {
        throw new Error("Format invalide");
      }
      localStorage.setItem(KEYS.CLASSES, JSON.stringify(data.classes));
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(data.students));
      localStorage.setItem(KEYS.SESSIONS, JSON.stringify(data.sessions || []));
      localStorage.setItem(KEYS.RECORDS, JSON.stringify(data.records || []));
      if (data.periods) localStorage.setItem(KEYS.PERIODS, JSON.stringify(data.periods));
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  },

  clearAllData: () => {
    localStorage.removeItem(KEYS.CLASSES);
    localStorage.removeItem(KEYS.STUDENTS);
    localStorage.removeItem(KEYS.SESSIONS);
    localStorage.removeItem(KEYS.RECORDS);
    localStorage.removeItem(KEYS.PERIODS);
  },

  // --- SUPABASE CLOUD SYNC ---

  syncToCloud: async () => {
      if (!supabase) return { error: "Supabase non configuré" };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: "Non connecté" };

      const content = {
          classes: JSON.parse(localStorage.getItem(KEYS.CLASSES) || '[]'),
          students: JSON.parse(localStorage.getItem(KEYS.STUDENTS) || '[]'),
          sessions: JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]'),
          records: JSON.parse(localStorage.getItem(KEYS.RECORDS) || '[]'),
          periods: JSON.parse(localStorage.getItem(KEYS.PERIODS) || '[]'),
          last_updated: new Date().toISOString()
      };

      const { error } = await supabase
          .from('user_data')
          .upsert({ 
              user_id: user.id, 
              content: content 
          });

      return { error };
  },

  syncFromCloud: async () => {
      if (!supabase) return { error: "Supabase non configuré" };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: "Non connecté" };

      const { data, error } = await supabase
          .from('user_data')
          .select('content')
          .eq('user_id', user.id)
          .single();

      if (error) return { error };
      if (!data) return { error: "Aucune donnée trouvée" };

      const cloudData = data.content;
      if (cloudData) {
          localStorage.setItem(KEYS.CLASSES, JSON.stringify(cloudData.classes || []));
          localStorage.setItem(KEYS.STUDENTS, JSON.stringify(cloudData.students || []));
          localStorage.setItem(KEYS.SESSIONS, JSON.stringify(cloudData.sessions || []));
          localStorage.setItem(KEYS.RECORDS, JSON.stringify(cloudData.records || []));
          localStorage.setItem(KEYS.PERIODS, JSON.stringify(cloudData.periods || []));
      }
      
      return { success: true };
  }
};