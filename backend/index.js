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

// Verificación crítica de variables
if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.MONGODB_URI) {
  console.error('❌ Faltan variables críticas en .env');
  process.exit(1);
}

// Configuración Firebase Admin
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim(),
  client_email: process.env.FIREBASE_CLIENT_EMAIL
};

// Verificación adicional de la clave privada
if (!serviceAccount.private_key || !serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
  console.error('❌ La clave privada de Firebase no está correctamente formateada');
  console.error('Asegúrate de que la clave esté entre comillas dobles y mantenga los saltos de línea \\n');
  process.exit(1);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:', error.message);
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);

const app = express();

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Atlas conectado'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB Atlas:', err.message);
  });

// Configuración CORS
const allowedDomains = [
  'http://localhost',
  'http://localhost:5173',
  'https://inversiones-bonitoviento-sas.firebaseapp.com',
  'https://inversiones-bonitoviento-sas.web.app',
  'https://inversiones-bonitoviento-sas.onrender.com',
  'https://gananico1-0.onrender.com'
];

// Middleware para logging de todas las rutas
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Middleware para CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('Origin recibido:', origin);
  
  // Permitir solicitudes sin origen (como las de Postman)
  if (!origin) {
    return next();
  }

  // Verificar si el origen está en la lista de dominios permitidos
  const isAllowed = allowedDomains.some(domain => 
    origin === domain || 
    origin.startsWith(domain) || 
    origin.includes('localhost:') || 
    origin.includes('127.0.0.1:')
  );

  if (isAllowed) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Firebase-Token, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400'); // 24 horas
    console.log('✅ CORS headers configurados para:', origin);
  } else {
    console.log('⚠️ Dominio no permitido:', origin);
  }

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Procesando preflight request para:', req.path);
    return res.status(204).end();
  }

  next();
});

// Configuración de CORS usando el middleware de cors
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = allowedDomains.some(domain => 
      origin === domain || 
      origin.startsWith(domain) || 
      origin.includes('localhost:') || 
      origin.includes('127.0.0.1:')
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('⚠️ Dominio no permitido (cors middleware):', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Firebase-Token', 'Accept'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

// Ruta raíz para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({
    status: '✅ Servidor funcionando',
    message: 'API de Inversiones Bonito Viento',
    version: '1.0.0'
  });
});

// Rutas de health check
app.get('/health', (req, res) => {
  console.log('🔍 Health check request recibido en /health');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  res.json({
    status: '✅ Saludable',
    database: 'MongoDB Atlas (GanaNico1)',
    firebase: 'Conectado',
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: req.headers.origin,
      allowedDomains
    }
  });
});

app.get('/api/health', (req, res) => {
  console.log('🔍 Health check request recibido en /api/health');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  res.json({
    status: '✅ Saludable',
    database: 'MongoDB Atlas (GanaNico1)',
    firebase: 'Conectado',
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: req.headers.origin,
      allowedDomains
    }
  });
});

// Middleware específico para rutas de autenticación
app.use('/api/auth', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Firebase-Token, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
});

// Rutas de la API
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
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`
══════════════════════════════════════
🛡️  Servidor en ejecución
🔗 URL: http://${HOST}:${PORT}
📦 Base de datos: MongoDB Atlas (GanaNico1)
🌍 Dominios permitidos:
   - ${allowedDomains.join('\n   - ')}
══════════════════════════════════════`);
});