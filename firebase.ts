
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- IMPORTANT : REMPLACEZ CECI PAR VOTRE CONFIGURATION FIREBASE ---
// Vous trouvez ces infos dans la console Firebase > Paramètres du projet > Général
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
