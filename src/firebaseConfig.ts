import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyAfIY1dPWI0zgOCiGsHbDl28_WGnM5SmXI",
  authDomain: "inversiones-bonitoviento-sas.firebaseapp.com",
  projectId: "inversiones-bonitoviento-sas",
  storageBucket: "inversiones-bonitoviento-sas.appspot.com",
  messagingSenderId: "689660987506",
  appId: "1:689660987506:web:0cbaf40c4c78bd01111aeb",
  databaseURL: "https://inversiones-bonitoviento-sas-default-rtdb.firebaseio.com",
  measurementId: "G-W0QBHHBHC1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

export default app;