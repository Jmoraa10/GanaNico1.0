const express = require('express');
const Finca = require('../models/Finca'); // Importa el modelo de Finca
const admin = require('firebase-admin');
const router = express.Router();
const fincaController = require('../controllers/fincaController');
const { verificarToken } = require('../middleware/auth');

// Middleware para verificar el token de Firebase
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Aplicar el middleware a todas las rutas
router.use(verifyToken);

// Ruta para obtener todas las fincas
router.get('/', fincaController.getFincas);

// Ruta para obtener una finca por ID
router.get('/:id', fincaController.getFinca);

// Ruta para crear una finca
router.post('/', fincaController.createFinca);

// Ruta para actualizar una finca
router.put('/:id', fincaController.updateFinca);

// Ruta para eliminar una finca
router.delete('/:id', fincaController.deleteFinca);

// Rutas de movimientos
router.post('/:id/movimientos-ganado', fincaController.agregarMovimientoGanado);
router.post('/:id/movimientos-bodega', fincaController.agregarMovimientoBodega);

module.exports = router;