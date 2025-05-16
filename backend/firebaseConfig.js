const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Asegúrate de que la ruta sea correcta

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;