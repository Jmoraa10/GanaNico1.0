const express = require('express');
const router = express.Router();
const transporteController = require('../controllers/transporteController');
const { authenticate, esAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para administradores
router.post('/', esAdmin, transporteController.crearViaje);
router.put('/:id', esAdmin, transporteController.actualizarViaje);
router.delete('/:id', esAdmin, transporteController.eliminarViaje);

// Rutas para todos los usuarios autenticados
router.get('/', transporteController.obtenerViajes);
router.get('/en-curso', transporteController.obtenerViajesEnCurso);
router.get('/culminados', transporteController.obtenerViajesCulminados);
router.get('/:id', transporteController.obtenerViaje);
router.get('/resumen/total', esAdmin, transporteController.obtenerResumen);

module.exports = router; 