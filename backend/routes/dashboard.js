const express = require('express');
const router = express.Router();
const Finca = require('../models/Finca');

// Ruta para obtener el resumen de las fincas
router.get('/resumen', async (req, res) => {
  try {
    const fincas = await Finca.find();
    
    const resumen = {
      totalMachosCeba: fincas.reduce((sum, f) => sum + f.machosCeba, 0),
      totalVacasParidas: fincas.reduce((sum, f) => sum + f.vacasParidas, 0),
      totalBodegas: fincas.reduce((sum, f) => sum + f.bodegas.length, 0)
    };

    res.status(200).json(resumen);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar resumen' });
  }
});

module.exports = router;