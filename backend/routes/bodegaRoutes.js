const express = require('express');
const router = express.Router();
const bodegaController = require('../controllers/bodegaController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas de bodega requieren autenticación
router.use(authenticate);

// Crear movimiento de bodega
router.post('/movimiento', bodegaController.crearMovimientoBodega);

// Puedes agregar aquí más rutas de bodega según tu controlador

module.exports = router; 