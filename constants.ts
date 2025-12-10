
import { Level, BlogPost, RentreeTrack, SiteStats, AboutPageData } from './types';
import { v4 as uuidv4 } from 'uuid';

export const INITIAL_DATA: Level[] = [
  {
    id: 'lvl-6eme',
    name: 'Sixième',
    group: 'COLLEGE',
    sequences: []
  },
  {
    id: 'lvl-5eme',
    name: 'Cinquième',
    group: 'COLLEGE',
    sequences: []
  },
  {
    id: 'lvl-4eme',
    name: 'Quatrième',
    group: 'COLLEGE',
    sequences: []
  },
  {
    id: 'lvl-3eme',
    name: 'Troisième',
    group: 'COLLEGE',
    sequences: [
      {
        id: 'seq-pythagore',
        title: 'Séquence 1 : Théorème de Pythagore',
        pdfCourse: 'https://example.com/cours-pythagore.pdf',
        pdfExercises: 'https://example.com/exos-pythagore.pdf',
        flashcards: [
          {
            id: 'f-1',
            question: "Formule du théorème pour un triangle ABC rectangle en A",
            answer: "$$ BC^2 = AB^2 + AC^2 $$",
            difficulty: 1
          },
          {
            id: 'f-2',
            question: "Calculer l'hypoténuse si les côtés font 3 et 4",
            answer: "5",
            difficulty: 2
          }
        ]
      }
    ]
  },
  {
    id: 'lvl-2nde',
    name: 'Seconde',
    group: 'LYCEE',
    sequences: [
      {
        id: 'seq-vecteurs',
        title: 'Séquence 1 : Les Vecteurs',
        pdfCourse: '#',
        flashcards: [
          {
            id: 'f-vec-1',
            question: "Relation de Chasles",
            answer: "$$ \\vec{AB} + \\vec{BC} = \\vec{AC} $$",
            difficulty: 1
          }
        ]
      }
    ]
  },
  {
    id: 'lvl-1ere',
    name: 'Première',
    group: 'LYCEE',
    categories: ['G. Spécialité', 'G. Tronc commun', 'STMG', 'ST2S'],
    sequences: []
  },
  {
    id: 'lvl-term',
    name: 'Terminale',
    group: 'LYCEE',
    categories: ['G. Spécialité', 'Maths complémentaires', 'Maths expertes', 'STMG', 'ST2S'],
    sequences: []
  }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'post-welcome',
    title: 'Bienvenue sur CQFD !',
    date: new Date().toISOString(),
    author: 'AOUFI Nizar',
    content: "Bonjour à tous !\n\nJe suis ravi de vous accueillir sur **CQFD**, votre nouvel espace dédié aux mathématiques.\n\nIci, vous trouverez :\n- Vos cours et exercices\n- Des flashcards pour vous entraîner\n- Des conseils pour réussir\n\nN'hésitez pas à explorer les différentes sections. Bonne rentrée à tous !",
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop',
    tags: ['Annonce', 'Vie de classe']
  }
];

// Helper to generate a generic 14-day schedule
const generateGenericDays = () => Array.from({ length: 14 }, (_, i) => ({
  day: i + 1,
  title: `Jour ${i + 1} : Remise en route`,
  description: "Révision des bases et calcul mental. 15 minutes d'exercices.",
  calculator: i % 2 === 0 // Alternating calculator allowance for demo
}));

export const INITIAL_RENTREE_TRACKS: RentreeTrack[] = [
  { id: 'track-6eme', name: 'Vers la Sixième', days: generateGenericDays() },
  { id: 'track-5eme', name: 'Vers la Cinquième', days: generateGenericDays() },
  { id: 'track-4eme', name: 'Vers la Quatrième', days: generateGenericDays() },
  { id: 'track-3eme', name: 'Vers la Troisième', days: generateGenericDays() },
  { id: 'track-2nde', name: 'Vers la Seconde', days: generateGenericDays() },
  { id: 'track-1ere-spe', name: 'Vers la 1ère Générale (Spé Maths)', days: generateGenericDays() },
  { id: 'track-term-spe', name: 'Vers la Terminale (Spé Maths)', days: generateGenericDays() },
  { id: 'track-techno', name: 'Vers la 1ère/Term Techno', days: generateGenericDays() },
];

export const INITIAL_STATS: SiteStats = {
  totalVisits: 0,
  toolsUsage: {
    course: 0,
    exercises: 0,
    correction: 0,
    flashcards: 0
  },
  levelVisits: {},
  sequenceVisits: {}
};

export const INITIAL_ABOUT_DATA: AboutPageData = {
  title: "À Propos de CQFD",
  subtitle: "\"Ce Qu'il Fallait Démontrer\"",
  authorName: "AOUFI Nizar",
  authorRole: "Professeur de Mathématiques",
  authorPhotoUrl: "",
  bioContent: "Bienvenue sur mon espace numérique. En tant qu'enseignant, mon objectif est de rendre les mathématiques accessibles, rigoureuses et vivantes.\n\nCe site a été conçu pour centraliser toutes les ressources nécessaires à votre réussite scolaire, du collège au lycée.\n\n### Ma méthode\nJe crois fermement que chaque élève peut progresser avec les bons outils et une méthode de travail régulière. **CQFD** est là pour vous accompagner dans cette démarche.",
};
