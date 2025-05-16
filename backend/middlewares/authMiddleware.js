const admin = require('firebase-admin');

const authMiddleware = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(' ')[1]; // Obtén el ID Token

  if (!idToken) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verifica el ID Token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Agrega el usuario decodificado a la solicitud
    next(); // Continúa con la siguiente función
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).json({ message: 'Token inválido', error: error.message });
  }
};

module.exports = authMiddleware;