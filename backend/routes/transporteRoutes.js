const express = require('express');
const router = express.Router();
const transporteController = require('../controllers/transporteController');
const { verificarToken, esAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas para administradores
router.post('/crear', esAdmin, transporteController.crearViaje);
router.put('/actualizar/:id', esAdmin, transporteController.actualizarViaje);
router.delete('/eliminar/:id', esAdmin, transporteController.eliminarViaje);

// Rutas para todos los usuarios autenticados
router.get('/todos', transporteController.obtenerViajes);
router.get('/en-curso', transporteController.obtenerViajesEnCurso);
router.get('/culminados', transporteController.obtenerViajesCulminados);
router.get('/detalle/:id', transporteController.obtenerViaje);
router.get('/resumen/total', esAdmin, transporteController.obtenerResumen);

module.exports = router; 