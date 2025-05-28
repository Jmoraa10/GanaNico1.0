const MovimientoGanado = require('../models/MovimientoGanado');
const Finca = require('../models/Finca');
const agendaController = require('./agendaController');

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

    // Crear el nuevo movimiento
    const nuevoMovimiento = new MovimientoGanado({
      tipo,
      cantidad,
      detalles,
      registradoPor,
      procedencia,
      destino,
      animales,
      fecha: new Date()
    });

    // Guardar el movimiento
    const movimientoGuardado = await nuevoMovimiento.save();

    // Actualizar la finca con el nuevo movimiento
    const finca = await Finca.findById(fincaId);
    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }

    // Agregar el movimiento al historial de la finca
    finca.movimientosGanado.push(movimientoGuardado._id);
    await finca.save();

    // Crear evento en la agenda
    await agendaController.crearEventoDesdeModulo({
      fecha: new Date(),
      tipo: 'finca',
      subtipo: tipo,
      titulo: `Movimiento de Ganado: ${tipo}`,
      descripcion: `${cantidad} animales - ${detalles || 'Sin detalles'}`,
      lugar: finca.nombre,
      referencia: {
        tipo: 'movimiento',
        id: movimientoGuardado._id
      },
      usuarioId: req.user.uid
    });

    res.status(201).json(movimientoGuardado);
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

    // Actualizar evento en la agenda
    await agendaController.crearEventoDesdeModulo({
      fecha: new Date(),
      tipo: 'finca',
      subtipo: 'actualizacion',
      titulo: `Actualización de Movimiento: ${tipo}`,
      descripcion: `Movimiento actualizado - ${cantidad} animales - ${detalles || 'Sin detalles'}`,
      lugar: movimiento.procedencia || movimiento.destino,
      referencia: {
        tipo: 'movimiento',
        id: movimientoActualizado._id
      },
      usuarioId: req.user.uid
    });

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

    // Crear evento de eliminación en la agenda
    await agendaController.crearEventoDesdeModulo({
      fecha: new Date(),
      tipo: 'finca',
      subtipo: 'eliminacion',
      titulo: `Eliminación de Movimiento: ${movimiento.tipo}`,
      descripcion: `Movimiento eliminado - ${movimiento.cantidad} animales`,
      lugar: movimiento.procedencia || movimiento.destino,
      referencia: {
        tipo: 'movimiento',
        id: id
      },
      usuarioId: req.user.uid
    });

    res.status(200).json({ message: 'Movimiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar movimiento:', error);
    res.status(500).json({ message: 'Error al eliminar el movimiento', error: error.message });
  }
}; 