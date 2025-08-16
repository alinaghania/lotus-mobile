import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Configuration Firebase via variables d'environnement
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
};

// Vérifier que les variables d'environnement sont définies
if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
  console.error("🚨 ERREUR: Variables d'environnement Firebase manquantes!");
  console.error("📝 Créez un fichier .env avec:");
  console.error("EXPO_PUBLIC_FIREBASE_API_KEY=votre_api_key");
  console.error("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domain");
  console.error("EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id");
  console.error("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_bucket");
  console.error("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id");
  console.error("EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id");
  console.error("EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=votre_measurement_id");
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app; 