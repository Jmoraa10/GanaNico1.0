const express = require('express');
const router = express.Router();
const transporteController = require('../controllers/transporteController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para administradores (usando authenticate en lugar de esAdmin)
router.post('/', authenticate, transporteController.crearViaje);
router.put('/:id', authenticate, transporteController.actualizarViaje);
router.delete('/:id', authenticate, transporteController.eliminarViaje);

// Rutas para todos los usuarios autenticados
router.get('/', transporteController.obtenerViajes);
router.get('/en-curso', transporteController.obtenerViajesEnCurso);
router.get('/culminados', transporteController.obtenerViajesCulminados);
router.get('/:id', transporteController.obtenerViaje);
router.get('/resumen/total', authenticate, transporteController.obtenerResumen);

module.exports = router; 