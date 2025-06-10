const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Middleware para verificar el token de Firebase
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
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
    const user = await admin.auth().getUser(req.user.uid);
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
    if (!adminEmails.includes(req.user.email)) {
      return res.status(403).json({ error: 'Solo los administradores pueden ver la lista de usuarios.' });
    }
    // Listar usuarios de Firebase Auth
    const listAllUsers = async (nextPageToken, accum = []) => {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      accum.push(...result.users.map(userRecord => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        disabled: userRecord.disabled,
        metadata: userRecord.metadata
      })));
      if (result.pageToken) {
        return listAllUsers(result.pageToken, accum);
      }
      return accum;
    };
    const users = await listAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al listar usuarios', details: error.message });
  }
});

module.exports = router;