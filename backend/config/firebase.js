const admin = require('firebase-admin');

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // En producción (Render), la clave viene como string JSON en la variable de entorno
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  // En desarrollo local, usamos el archivo
  serviceAccount = require('../serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://inversiones-bonitoviento-sas-default-rtdb.firebaseio.com/'
});

const db = admin.database();
const auth = admin.auth();

module.exports = { db, auth };
