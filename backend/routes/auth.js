const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('Solicitud de login recibida:', { email });

  try {
    // Verifica si el usuario existe en Firebase
    const user = await admin.auth().getUserByEmail(email);
    console.log('Usuario encontrado en Firebase:', user.uid);

    // Genera un custom token para el usuario
    const customToken = await admin.auth().createCustomToken(user.uid);
    console.log('Custom token generado:', customToken);

    // Retorna el custom token al cliente
    res.status(200).json({ success: true, customToken });
  } catch (error) {
    console.error('Error en el proceso de login:', error);

    // Maneja errores específicos
    if (error.code === 'auth/user-not-found') {
      res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    } else if (error.code === 'auth/wrong-password') {
      res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    } else {
      res.status(500).json({ success: false, message: 'Error en el servidor', error: error.message });
    }
  }
});

module.exports = router;