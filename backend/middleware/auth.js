const admin = require('firebase-admin');

const verificarToken = async (req, res, next) => {
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

const esAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar si el usuario tiene el rol de admin
    const userRecord = await admin.auth().getUser(req.user.uid);
    const customClaims = userRecord.customClaims || {};
    
    if (!customClaims.admin) {
      return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
    }

    next();
  } catch (error) {
    console.error('❌ Error al verificar rol de admin:', error);
    res.status(500).json({ error: 'Error al verificar permisos' });
  }
};

module.exports = {
  verificarToken,
  esAdmin
}; 