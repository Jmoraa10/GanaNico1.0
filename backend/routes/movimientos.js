const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientos.controller');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todos los movimientos
router.get('/', movimientosController.getMovimientos);

// Obtener movimientos por finca
router.get('/finca/:fincaId', movimientosController.getMovimientosByFinca);

// Crear un nuevo movimiento
router.post('/', movimientosController.createMovimiento);

// Actualizar un movimiento
router.put('/:id', movimientosController.updateMovimiento);

// Eliminar un movimiento
router.delete('/:id', movimientosController.deleteMovimiento);

module.exports = router; 