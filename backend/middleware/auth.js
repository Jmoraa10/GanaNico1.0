const admin = require('firebase-admin');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🔐 Intento de acceso sin token');
    return res.status(401).json({ 
      error: 'Token no proporcionado',
      solution: 'Incluye el token en el header Authorization: Bearer <token>'
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    console.log(`🔐 Usuario autenticado: ${decodedToken.email}`);
    next();
  } catch (error) {
    console.error('❌ Error de token:', error.message);
    res.status(401).json({ 
      error: 'Token inválido',
      details: error.message
    });
  }
};

module.exports = {
  authenticate
}; 