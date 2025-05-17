import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAfIY1dPWI0zgOCiGsHbDl28_WGnM5SmXI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "inversiones-bonitoviento-sas.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "inversiones-bonitoviento-sas",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "inversiones-bonitoviento-sas.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "689660987506",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:689660987506:web:0cbaf40c4c78bd01111aeb",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://inversiones-bonitoviento-sas-default-rtdb.firebaseio.com",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-W0QBHHBHC1",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

export default app;