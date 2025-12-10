
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuration Firebase pour le projet CQFD
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

// On utilise initializeFirestore avec ignoreUndefinedProperties pour éviter les erreurs
// si on tente de sauvegarder des champs optionnels (undefined)
export const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true
});

export const auth = getAuth(app);
