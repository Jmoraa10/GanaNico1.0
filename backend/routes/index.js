const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const fincaRoutes = require('./fincaRoutes');
const subastaRoutes = require('./subastaRoutes');
const bodegaRoutes = require('./bodegaRoutes');
const transporteRoutes = require('./transporteRoutes');

router.use('/auth', authRoutes);
router.use('/fincas', fincaRoutes);
router.use('/subastas', subastaRoutes);
router.use('/bodegas', bodegaRoutes);
router.use('/transportes', transporteRoutes);

module.exports = router; 