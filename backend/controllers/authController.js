const admin = require('firebase-admin');
const jwt = require('jsonwebtoken'); // Para generar tokens JWT

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verifica el usuario en Firebase Auth
    const user = await admin.auth().getUserByEmail(email);

    // Aquí puedes agregar lógica para verificar la contraseña si es necesario
    // (Firebase Auth maneja la autenticación, pero puedes agregar validaciones adicionales).

    // Genera un token JWT
    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      'TU_SECRETO_JWT', // Cambia esto por una clave secreta segura
      { expiresIn: '1h' } // El token expira en 1 hora
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ message: 'Error de autenticación', error: error.message });
  }
};
