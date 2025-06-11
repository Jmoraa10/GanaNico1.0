const express = require('express');
const { auth } = require('../config/firebase');
const router = express.Router();

// Middleware para verificar el token de Firebase
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Ruta para verificar el estado de autenticación
router.get('/verify', verifyToken, (req, res) => {
  res.json({ 
    authenticated: true, 
    user: {
      uid: req.user.uid,
      email: req.user.email
    }
  });
});

// Ruta para obtener información del usuario
router.get('/user', verifyToken, async (req, res) => {
  try {
    const user = await auth.getUser(req.user.uid);
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
});

// Endpoint para listar todos los usuarios con metadatos (solo admin)
router.get('/users', verifyToken, async (req, res) => {
  try {
    // Solo permitir admins
    const adminEmails = [
      'johanmora.jm@gmail.com',
      'mora.castro.raul@gmail.com'
    ];
    console.log('🔍 Usuario autenticado:', req.user.email);
    console.log('🔑 Token decodificado:', req.user);
    
    if (!adminEmails.includes(req.user.email)) {
      console.log('❌ Acceso denegado: Usuario no es admin');
      return res.status(403).json({ error: 'Solo los administradores pueden ver la lista de usuarios.' });
    }

    // Verificar que auth esté inicializado
    if (!auth) {
      return res.status(500).json({ error: 'Firebase Auth no está inicializado correctamente. Verifica las credenciales.' });
    }

    console.log('✅ Usuario autorizado como admin');
    
    // Listar usuarios de Firebase Auth
    const listAllUsers = async (nextPageToken, accum = []) => {
      try {
        console.log('📋 Listando usuarios con token:', nextPageToken || 'inicial');
        const result = await auth.listUsers(1000, nextPageToken);
        console.log(`✅ Usuarios obtenidos: ${result.users.length}`);
        
        const users = result.users.map(userRecord => ({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          phoneNumber: userRecord.phoneNumber,
          disabled: userRecord.disabled,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime
          }
        }));
        
        accum.push(...users);
        
        if (result.pageToken) {
          console.log('🔄 Hay más usuarios, continuando con paginación...');
          return listAllUsers(result.pageToken, accum);
        }
        
        return accum;
      } catch (error) {
        console.error('❌ Error en listAllUsers:', error);
        throw error;
      }
    };

    const users = await listAllUsers();
    console.log(`✅ Total de usuarios listados: ${users.length}`);
    res.json({ users });
  } catch (error) {
    console.error('❌ Error al listar usuarios:', error);
    res.status(500).json({ 
      error: 'Error al listar usuarios', 
      details: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;