require('dotenv').config(); // Carga variables de entorno al inicio

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { corsOptions, allowedOrigins } = require('./config/corsOptions');
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

// Middleware de logging detallado
app.use((req, res, next) => {
  // No loguear health checks de Render
  if (!req.headers['render-health-check']) {
    console.log('\n🔍 Nueva solicitud recibida:');
    console.log('📝 Método:', req.method);
    console.log('🔗 URL:', req.url);
    console.log('🌐 Origin:', req.headers.origin);
    console.log('🔑 Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body) console.log('📦 Body:', JSON.stringify(req.body, null, 2));
    console.log('----------------------------------------\n');
  }
  next();
});

// Configuración de CORS
app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Ruta raíz para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  // Respuesta simple para health checks de Render
  if (req.headers['render-health-check']) {
    return res.status(200).send('OK');
  }

  console.log('📨 Request recibida en ruta raíz');
  res.json({
    status: '✅ Servidor funcionando',
    message: 'API de Inversiones Bonito Viento',
    version: '1.0.0'
  });
});

// Rutas de health check
app.get('/health', (req, res) => {
  // Respuesta simple para health checks de Render
  if (req.headers['render-health-check']) {
    return res.status(200).send('OK');
  }

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
  if (!req.headers['render-health-check']) {
    console.log('🔐 Auth Middleware - Request recibida');
    console.log('🔐 Auth Middleware - Origin:', req.headers.origin);
    console.log('🔐 Auth Middleware - Método:', req.method);
    console.log('🔐 Auth Middleware - Ruta:', req.path);
  }

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🔄 Auth Middleware - Procesando preflight request');
    return res.status(204).end();
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
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Función para verificar la conexión a MongoDB
const checkMongoConnection = async () => {
  try {
    // Verificar si la conexión está establecida
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB Atlas conectado y respondiendo');
      return true;
    } else {
      console.log('🔄 Esperando conexión a MongoDB...');
      // Esperar a que la conexión se establezca
      await new Promise((resolve, reject) => {
        mongoose.connection.once('connected', () => {
          console.log('✅ MongoDB Atlas conectado y respondiendo');
          resolve();
        });
        mongoose.connection.once('error', (err) => {
          console.error('❌ Error de conexión a MongoDB:', err);
          reject(err);
        });
      });
      return true;
    }
  } catch (error) {
    console.error('❌ Error al verificar conexión con MongoDB:', error);
    return false;
  }
};

// Iniciar el servidor después de verificar la conexión
const startServer = async () => {
  try {
    const isConnected = await checkMongoConnection();
    if (isConnected) {
      app.listen(PORT, HOST, () => {
        console.log(`
══════════════════════════════════════
🛡️  Servidor en ejecución
🔗 URL: http://${HOST}:${PORT}
📦 Base de datos: MongoDB Atlas (GanaNico1)
🌍 Dominios permitidos:
   - ${allowedOrigins.join('\n   - ')}
══════════════════════════════════════`);
      });
    } else {
      console.error('❌ No se pudo iniciar el servidor debido a problemas con la base de datos');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();