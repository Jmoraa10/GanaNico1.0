const admin = require('firebase-admin');

const db = admin.database();
const auth = admin.auth();

module.exports = { db, auth };
