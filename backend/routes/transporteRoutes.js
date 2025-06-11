const express = require('express');
const router = express.Router();
const transporteController = require('../controllers/transporteController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para administradores
router.post('/crear', transporteController.crearViaje);
router.put('/actualizar/:id', transporteController.actualizarViaje);
router.delete('/eliminar/:id', transporteController.eliminarViaje);

// Rutas para todos los usuarios autenticados
router.get('/todos', transporteController.obtenerViajes);
router.get('/en-curso', transporteController.obtenerViajesEnCurso);
router.get('/culminados', transporteController.obtenerViajesCulminados);
router.get('/detalle/:id', transporteController.obtenerViaje);
router.get('/resumen/total', transporteController.obtenerResumen);

module.exports = router; 