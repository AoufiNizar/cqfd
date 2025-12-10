import { GoogleGenAI } from "@google/genai";
import { HomeworkRecord, HomeworkStatus, Student, HomeworkSession } from '../types';

export const GeminiService = {
  analyzePerformance: async (
    className: string,
    sessions: HomeworkSession[],
    students: Student[],
    records: HomeworkRecord[]
  ): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Erreur: Clé API manquante. Veuillez configurer l'API Key.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare data for the prompt
    let dataSummary = `Classe: ${className}\n`;
    dataSummary += `Nombre d'élèves: ${students.length}\n`;
    dataSummary += `Historique des contrôles de devoirs:\n`;

    sessions.forEach(session => {
        const sessionRecords = records.filter(r => r.sessionId === session.id);
        const fait = sessionRecords.filter(r => r.status === HomeworkStatus.FAIT).length;
        const nonFait = sessionRecords.filter(r => r.status === HomeworkStatus.NON_FAIT).length;
        const incomplet = sessionRecords.filter(r => r.status === HomeworkStatus.INCOMPLET).length;
        const absent = sessionRecords.filter(r => r.status === HomeworkStatus.ABSENT).length;
        
        dataSummary += `- Date: ${new Date(session.date).toLocaleDateString('fr-FR')} (${session.description})\n`;
        dataSummary += `  Résultats: Fait(${fait}), Non Fait(${nonFait}), Incomplet(${incomplet}), Absent(${absent})\n`;
    });

    // Identify struggling students
    dataSummary += `\nDétail par élève (Problèmes récurrents):\n`;
    students.forEach(student => {
        const studentRecords = records.filter(r => r.studentId === student.id);
        const missed = studentRecords.filter(r => r.status === HomeworkStatus.NON_FAIT).length;
        if (missed > 0) {
            dataSummary += `- ${student.name}: ${missed} fois "Non fait".\n`;
        }
    });

    const prompt = `
      Tu es un assistant pédagogique expert pour un enseignant.
      Analyse les données de suivi des devoirs ci-dessous pour la classe.
      
      ${dataSummary}

      Tâche:
      1. Rédige un court paragraphe de bilan global sur le sérieux de la classe.
      2. Liste les élèves qui nécessitent une attention particulière (trop de devoirs non faits).
      3. Suggère une action pédagogique simple si la tendance est négative.
      
      Réponds en français, sur un ton professionnel et constructif. Utilise un formatage Markdown clair.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Impossible de générer le rapport.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Une erreur est survenue lors de l'analyse avec l'IA.";
    }
  }
};