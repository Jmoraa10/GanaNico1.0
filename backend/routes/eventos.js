const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { verificarToken } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);

// Obtener todos los eventos
router.get('/', eventoController.getEventos);

// Crear un nuevo evento
router.post('/', eventoController.createEvento);

// Actualizar estado de un evento
router.patch('/:id/estado', eventoController.updateEventoEstado);

// Eliminar un evento
router.delete('/:id', eventoController.deleteEvento);

module.exports = router; 