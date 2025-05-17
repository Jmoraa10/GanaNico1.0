// filepath: c:\Proyecto\inversiones-bonito-viento-sas\src\services\firebase.ts
import { getAuth } from 'firebase/auth';
import app from '../firebaseConfig';

// Exportar servicios de Firebase
export const auth = getAuth(app);
export default app;