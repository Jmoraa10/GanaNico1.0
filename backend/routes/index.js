const express = require('express');
const router = express.Router();
const subastasRoutes = require('./subastas');
const eventosRoutes = require('./eventos');
const ventaRoutes = require('./ventas');
// ... otros requires de rutas

// Rutas de subastas
router.use('/subastas', subastasRoutes);

// Rutas de eventos
router.use('/eventos', eventosRoutes);

// Rutas de ventas
router.use('/ventas', ventaRoutes);

// ... otras rutas

module.exports = router; 