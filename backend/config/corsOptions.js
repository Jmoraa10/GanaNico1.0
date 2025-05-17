const allowedOrigins = [
  'http://localhost',
  'http://localhost:5173',
  'https://inversiones-bonitoviento-sas.firebaseapp.com',
  'https://inversiones-bonitoviento-sas.web.app',
  'https://inversiones-bonitoviento-sas.onrender.com',
  'https://gananico1-0.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como las de Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Verificar si el origen está en la lista de permitidos o es un subdominio
    const isAllowed = allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith(allowedOrigin) || 
      origin.includes('localhost:') || 
      origin.includes('127.0.0.1:')
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Firebase-Token',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = {
  corsOptions,
  allowedOrigins
}; 