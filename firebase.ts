
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- IMPORTANT : REMPLACEZ CECI PAR VOTRE CONFIGURATION FIREBASE ---
// Vous trouvez ces infos dans la console Firebase > Paramètres du projet > Général
const firebaseConfig = {
  apiKey: "AIzaSyAEWkP8fbuOw8JPGztzJBypG9UuyqgRspg",
  authDomain: "cqfd-1b117.firebaseapp.com",
  projectId: "cqfd-1b117",
  storageBucket: "cqfd-1b117.firebasestorage.app",
  messagingSenderId: "434291769806",
  appId: "1:434291769806:web:e9ab3c84626265baa06b9f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
