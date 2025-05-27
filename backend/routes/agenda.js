const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');

router.post('/', agendaController.crearEvento);
router.get('/mes/:anio/:mes', agendaController.getEventosPorMes);
router.get('/dia/:fecha', agendaController.getEventosPorDia);
router.get('/pendientes', agendaController.getEventosPendientes);
router.put('/:id/cumplido', agendaController.marcarEventoCumplido);

module.exports = router; 