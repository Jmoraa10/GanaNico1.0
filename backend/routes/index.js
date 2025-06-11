const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const fincaRoutes = require('./finca');
const subastaRoutes = require('./subastas');
const bodegaRoutes = require('./bodegaRoutes');
const transporteRoutes = require('./transporteRoutes');
const agendaRoutes = require('./agenda');
const ventaRoutes = require('./ventaRoutes');
const dashboardRoutes = require('./dashboard');
const movimientoRoutes = require('./movimientos');

router.use('/auth', authRoutes);
router.use('/fincas', fincaRoutes);
router.use('/subastas', subastaRoutes);
router.use('/bodegas', bodegaRoutes);
router.use('/transportes', transporteRoutes);
router.use('/agenda', agendaRoutes);
router.use('/ventas', ventaRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/movimientos', movimientoRoutes);

module.exports = router; 