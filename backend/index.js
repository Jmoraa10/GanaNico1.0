require('dotenv').config(); // Carga variables de entorno al inicio

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const authRoutes = require('./routes/auth');
const fincaRoutes = require('./routes/fincas');
const movimientoRoutes = require('./routes/movimientos');
const dashboardRoutes = require('./routes/dashboard');
const ventaRoutes = require('./routes/ventaRoutes');
const { authenticate } = require('./middleware/auth');

// Verificación de variables de entorno requeridas
const requiredVars = {
  // Firebase Admin SDK
  FIREBASE_TYPE: 'service_account',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  // Firebase Client SDK
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI
};

// Verifica que todas las variables estén presentes
const missingVars = Object.entries(requiredVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Variables de entorno faltantes:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

// Configuración Firebase Admin
const serviceAccount = {
  type: requiredVars.FIREBASE_TYPE,
  project_id: requiredVars.FIREBASE_PROJECT_ID,
  private_key: requiredVars.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: requiredVars.FIREBASE_CLIENT_EMAIL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${requiredVars.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const firebaseConfig = {
  apiKey: requiredVars.FIREBASE_API_KEY,
  authDomain: requiredVars.FIREBASE_AUTH_DOMAIN,
  projectId: requiredVars.FIREBASE_PROJECT_ID,
  storageBucket: requiredVars.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredVars.FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredVars.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);

const app = express();

// Conexión a MongoDB Atlas
// Usa la variable de entorno MONGODB_URI definida en .env
mongoose.connect(requiredVars.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas conectado'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB Atlas:', err.message);
    // No mostrar la URI ni el password en logs de error
  });

// Configuración CORS
const allowedDomains = [
  'http://localhost',
  'https://inversiones-bonitoviento-sas.firebaseapp.com',
  'https://inversiones-bonitoviento-sas.web.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedDomains.some(domain => 
      origin.startsWith(domain) || 
      origin.includes('localhost:') || 
      origin.includes('127.0.0.1:')
    );
    isAllowed ? callback(null, true) : callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Firebase-Token'],
  credentials: true
}));

app.use(express.json());

// Ruta de verificación de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ Saludable',
    database: 'MongoDB Atlas (GanaNico1)',
    firebase: 'Conectado',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/fincas', authenticate, fincaRoutes);
app.use('/api/movimientos', authenticate, movimientoRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/ventas', authenticate, ventaRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(`💥 Error: ${err.message}`);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
══════════════════════════════════════
🛡️  Servidor en ejecución
🔗 URL: http://localhost:${PORT}
📦 Base de datos: MongoDB Atlas (GanaNico1)
🌍 Dominios permitidos:
   - ${allowedDomains.join('\n   - ')}
══════════════════════════════════════`);
});