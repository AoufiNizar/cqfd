export enum HomeworkStatus {
  FAIT = 'FAIT',
  NON_FAIT = 'NON_FAIT',
  INCOMPLET = 'INCOMPLET',
  ABSENT = 'ABSENT',
}

export interface Student {
  id: string;
  name: string;
  classId: string;
}

export interface ClassGroup {
  id: string;
  name: string;
}

export interface HomeworkSession {
  id: string;
  classId: string;
  date: string; // ISO string
  description: string;
}

export interface HomeworkRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: HomeworkStatus;
}

export interface SchoolPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export type ViewState = 
  | 'DASHBOARD' 
  | 'CLASS_DETAILS' 
  | 'NEW_SESSION' 
  | 'SESSION_HISTORY';