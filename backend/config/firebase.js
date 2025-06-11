const admin = require('firebase-admin');

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // En producción (Render), la clave viene como string JSON en la variable de entorno
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  // Arreglar el formato de la private_key si viene con \n
  if (serviceAccount.private_key && serviceAccount.private_key.includes('\\n')) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  if (serviceAccount.private_key && serviceAccount.private_key.includes('\n')) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\n/g, '\n');
  }
} else {
  // En desarrollo local, usamos el archivo
  serviceAccount = require('../serviceAccountKey.json');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://inversiones-bonitoviento-sas-default-rtdb.firebaseio.com/'
  });
}

const db = admin.database();
const auth = admin.auth();

module.exports = { db, auth };
