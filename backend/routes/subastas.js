const express = require('express');
const router = express.Router();
const subastaController = require('../controllers/subastaController');
const { authenticate } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de subastas
router.get('/', subastaController.getSubastas);
router.get('/:id', subastaController.getSubasta);
router.post('/', subastaController.createSubasta);
router.put('/:id', subastaController.updateSubasta);
router.delete('/:id', subastaController.deleteSubasta);

module.exports = router; 