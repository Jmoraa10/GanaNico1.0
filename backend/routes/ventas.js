const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');
const { validarJWT } = require('../middlewares/validar-jwt');

// Aplicar middleware de autenticación a todas las rutas
router.use(validarJWT);

// Rutas de ventas
router.get('/', ventaController.getVentas);
router.get('/:id', ventaController.getVenta);
router.post('/', ventaController.createVenta);
router.put('/:id', ventaController.updateVenta);
router.delete('/:id', ventaController.deleteVenta);

module.exports = router; 