const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener eventos
router.get('/', agendaController.getEventos);

// Obtener eventos pendientes
router.get('/pendientes', agendaController.getEventosPendientes);

// Crear evento
router.post('/', agendaController.createEvento);

// Actualizar estado de evento
router.patch('/:id/estado', agendaController.updateEstadoEvento);

// Eliminar evento
router.delete('/:id', agendaController.deleteEvento);

module.exports = router; 