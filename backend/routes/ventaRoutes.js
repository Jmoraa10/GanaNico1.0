const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

// Crear una nueva venta
router.post('/', ventaController.crearVenta);

// Obtener todas las ventas de una finca
router.get('/finca/:fincaId', ventaController.getVentasByFinca);

// Obtener una venta específica
router.get('/:id', ventaController.getVentaById);

module.exports = router; 