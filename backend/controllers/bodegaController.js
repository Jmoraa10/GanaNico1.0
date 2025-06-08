const Finca = require('../models/Finca');
const eventoService = require('../services/eventoService');

exports.crearMovimientoBodega = async (req, res) => {
  try {
    const { fincaId, movimiento } = req.body;
    const finca = await Finca.findById(fincaId);
    
    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }

    // Agregar el movimiento al historial
    if (!finca.movimientosBodega) {
      finca.movimientosBodega = [];
    }
    finca.movimientosBodega.push(movimiento);
    await finca.save();

    // Crear evento en la agenda
    const eventoData = {
      fecha: movimiento.fecha,
      descripcion: `Movimiento en bodega: ${movimiento.detalles}`,
      lugar: finca.nombre,
      detallesTexto: `Registrado por: ${movimiento.registradoPor}`,
      registradoPor: movimiento.registradoPor,
      detalles: {
        fincaId: finca._id,
        fincaNombre: finca.nombre,
        snapshotBodega: movimiento.snapshotBodega
      }
    };

    await eventoService.crearEventoBodega(eventoData);

    res.status(201).json(finca);
  } catch (error) {
    console.error('Error al crear movimiento de bodega:', error);
    res.status(500).json({ message: 'Error al crear el movimiento', error: error.message });
  }
}; 