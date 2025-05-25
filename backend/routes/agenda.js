const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');

router.post('/', agendaController.crearEvento);
router.get('/mes/:año/:mes', agendaController.getEventosPorMes);
router.get('/dia/:fecha', agendaController.getEventosPorDia);
router.get('/pendientes', agendaController.getEventosPendientes);

module.exports = router; 