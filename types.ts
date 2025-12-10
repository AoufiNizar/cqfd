
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty?: number; // 1 (Easy) to 3 (Hard)
}

export interface Sequence {
  id: string;
  title: string;
  category?: string;       // New field for sub-category (e.g., "G. Spécialité")
  pdfCourse?: string;      // URL Google Drive / PDF
  pdfExercises?: string;   // URL Google Drive / PDF
  pdfCorrection?: string;  // URL Google Drive / PDF
  flashcards: Flashcard[];
}

export interface Level {
  id: string;
  name: string; // e.g., "Troisième", "Seconde"
  group: 'COLLEGE' | 'LYCEE';
  categories?: string[]; // List of available sub-categories for this level
  sequences: Sequence[];
}

export interface BlogPost {
  id: string;
  title: string;
  content: string; // Supports Markdown/Latex
  imageUrl?: string;
  date: string;
  author: string;
  tags?: string[];
}

export interface RentreeDay {
  day: number; // 1 to 14
  title: string;
  description: string;
  link?: string; // Link to PDF resource
  externalLink?: string; // Link to Exercise platform (CoopMaths)
  calculator?: boolean; // true = Allowed, false = Forbidden
}

export interface RentreeTrack {
  id: string;
  name: string; // e.g., "Vers la Seconde", "Vers la Terminale Spé Math"
  days: RentreeDay[];
}

export interface SiteStats {
  totalVisits: number;
  toolsUsage: {
    course: number;
    exercises: number;
    correction: number;
    flashcards: number;
  };
  levelVisits: Record<string, number>; // levelId -> count
  sequenceVisits: Record<string, number>; // sequenceId -> count
}

export interface AboutPageData {
  title: string;
  subtitle: string;
  authorName: string;
  authorRole: string;
  authorPhotoUrl?: string; // if empty, shows initials
  bioContent: string; // Rich text with markdown/latex
}

export type ViewState = 
  | { type: 'HOME' }
  | { type: 'LEVEL'; levelId: string }
  | { type: 'RENTREE' }
  | { type: 'BLOG' }
  | { type: 'ABOUT' }
  | { type: 'STATS' };
