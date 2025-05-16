const { auth } = require('../config/firebase');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtén el token del header
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token); // Verifica el token
    req.user = decodedToken; // Almacena la información del usuario en la solicitud
    next(); // Continúa con la siguiente función (controlador)
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = authenticate;