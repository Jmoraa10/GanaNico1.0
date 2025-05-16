const admin = require('firebase-admin');
const jwt = require('jsonwebtoken'); // Para generar tokens JWT

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica el usuario en Firebase Auth
    const user = await admin.auth().getUserByEmail(email);

    // Aqu� puedes agregar l�gica para verificar la contrase�a si es necesario
    // (Firebase Auth maneja la autenticaci�n, pero puedes agregar validaciones adicionales).

    // Genera un token JWT
    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      'TU_SECRETO_JWT', // Cambia esto por una clave secreta segura
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ message: 'Error de autenticaci�n', error: error.message });
  }
};
