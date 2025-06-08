const MovimientoGanado = require('../models/MovimientoGanado');
const Finca = require('../models/Finca');
const Evento = require('../models/Evento');
const eventoService = require('../services/eventoService');

// Obtener todos los movimientos
exports.getMovimientos = async (req, res) => {
  try {
    const movimientos = await MovimientoGanado.find()
      .populate('fincaId', 'nombre')
      .sort({ fecha: -1 });
    res.status(200).json(movimientos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los movimientos', error });
  }
};

// Obtener movimientos por finca
exports.getMovimientosByFinca = async (req, res) => {
  try {
    const { fincaId } = req.params;
    const movimientos = await MovimientoGanado.find({ fincaId }).sort({ fecha: -1 });
    res.status(200).json(movimientos);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ message: 'Error al obtener los movimientos', error: error.message });
  }
};

// Crear un nuevo movimiento
exports.createMovimiento = async (req, res) => {
  try {
    const { fincaId, tipo, cantidad, detalles, registradoPor, procedencia, destino, animales } = req.body;

    // Actualizar la finca con el nuevo movimiento
    const finca = await Finca.findById(fincaId);
    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }

    // Crear el nuevo movimiento
    const nuevoMovimiento = {
      tipo,
      cantidad,
      detalles,
      registradoPor,
      procedencia,
      destino,
      animales,
      fecha: new Date()
    };

    // Agregar el movimiento al historial de la finca
    if (!finca.movimientosGanado) {
      finca.movimientosGanado = [];
    }
    finca.movimientosGanado.push(nuevoMovimiento);
    await finca.save();

    // Crear evento en la agenda usando el servicio centralizado
    const eventoData = {
      fecha: new Date().toISOString().split('T')[0],
      descripcion: `${tipo === 'ingreso' ? 'Ingreso' : 'Salida'} de ganado (${cantidad})`,
      lugar: finca.nombre || 'Finca',
      detallesTexto: detalles,
      registradoPor: registradoPor,
      detalles: { 
        procedencia, 
        destino, 
        animales,
        fincaId: finca._id,
        fincaNombre: finca.nombre
      }
    };

    await eventoService.crearEventoFinca(eventoData);

    res.status(201).json(nuevoMovimiento);
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({ message: 'Error al crear el movimiento', error: error.message });
  }
};

// Actualizar un movimiento
exports.updateMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, cantidad, detalles, registradoPor, procedencia, destino, animales } = req.body;

    const movimiento = await MovimientoGanado.findById(id);
    if (!movimiento) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    // Actualizar los campos
    movimiento.tipo = tipo;
    movimiento.cantidad = cantidad;
    movimiento.detalles = detalles;
    movimiento.registradoPor = registradoPor;
    movimiento.procedencia = procedencia;
    movimiento.destino = destino;
    movimiento.animales = animales;

    const movimientoActualizado = await movimiento.save();
    res.status(200).json(movimientoActualizado);
  } catch (error) {
    console.error('Error al actualizar movimiento:', error);
    res.status(500).json({ message: 'Error al actualizar el movimiento', error: error.message });
  }
};

// Eliminar un movimiento
exports.deleteMovimiento = async (req, res) => {
  try {
    const { id } = req.params;
    const movimiento = await MovimientoGanado.findById(id);
    
    if (!movimiento) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }

    // Eliminar el movimiento
    await MovimientoGanado.findByIdAndDelete(id);

    // Actualizar la finca para remover la referencia al movimiento
    await Finca.updateOne(
      { movimientosGanado: id },
      { $pull: { movimientosGanado: id } }
    );

    res.status(200).json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    res.status(500).json({ message: 'Error al eliminar el movimiento', error: error.message });
  }
}; 