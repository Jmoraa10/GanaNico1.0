// filepath: c:\Proyecto\inversiones-bonito-viento-sas\src\services\firebase.ts
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { FirebaseApp } from 'firebase/app';
import { app } from '../firebaseConfig';

// Inicializar servicios de Firebase con manejo de errores
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  auth = getAuth(app as FirebaseApp);
  db = getFirestore(app as FirebaseApp);
  storage = getStorage(app as FirebaseApp);
  console.log('✅ Servicios de Firebase inicializados correctamente');
} catch (error) {
  console.error('❌ Error al inicializar servicios de Firebase:', error);
  throw new Error('Error al inicializar servicios de Firebase');
}

// Exportar servicios de Firebase
export { auth, db, storage };