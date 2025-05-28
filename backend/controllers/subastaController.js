const Subasta = require('../models/Subasta');
const agendaController = require('./agendaController');

// Obtener todas las subastas
exports.getSubastas = async (req, res) => {
  try {
    const subastas = await Subasta.find()
      .sort({ createdAt: -1 });
    res.status(200).json(subastas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las subastas', error });
  }
};

// Obtener una subasta por ID
exports.getSubasta = async (req, res) => {
  try {
    const subasta = await Subasta.findOne({
      _id: req.params.id
    });
    
    if (!subasta) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }
    
    res.status(200).json(subasta);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la subasta', error });
  }
};

// Crear una nueva subasta
exports.createSubasta = async (req, res) => {
  try {
    const nuevaSubasta = new Subasta({
      ...req.body,
      usuarioId: req.user.uid
    });
    
    const subastaGuardada = await nuevaSubasta.save();

    // Crear evento en la agenda
    await agendaController.crearEventoDesdeModulo({
      fecha: new Date(),
      tipo: 'subasta',
      subtipo: 'nueva',
      titulo: `Nueva Subasta: ${subastaGuardada.nombre}`,
      descripcion: `Se ha creado una nueva subasta en ${subastaGuardada.ubicacion}`,
      lugar: subastaGuardada.ubicacion,
      referencia: {
        tipo: 'subasta',
        id: subastaGuardada._id
      },
      usuarioId: req.user.uid
    });
    
    res.status(201).json(subastaGuardada);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la subasta', error });
  }
};

// Actualizar una subasta
exports.updateSubasta = async (req, res) => {
  try {
    const subastaActualizada = await Subasta.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    
    if (!subastaActualizada) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }

    // Si hay nuevos movimientos, crear eventos para cada uno
    if (req.body.historialMovimientos) {
      const nuevosMovimientos = req.body.historialMovimientos.filter(
        mov => !subastaActualizada.historialMovimientos.some(
          m => m.fecha.getTime() === new Date(mov.fecha).getTime() && 
               m.tipoMovimiento === mov.tipoMovimiento
        )
      );

      for (const movimiento of nuevosMovimientos) {
        await agendaController.crearEventoDesdeModulo({
          fecha: new Date(movimiento.fecha),
          tipo: 'subasta',
          subtipo: movimiento.tipoMovimiento,
          titulo: `${movimiento.tipoMovimiento.toUpperCase()} en Subasta: ${subastaActualizada.nombre}`,
          descripcion: `Movimiento de ${movimiento.cantidad} ${movimiento.grupo} - ${movimiento.tipo}`,
          lugar: subastaActualizada.ubicacion,
          referencia: {
            tipo: 'subasta',
            id: subastaActualizada._id
          },
          usuarioId: req.user.uid
        });
      }
    }
    
    res.status(200).json(subastaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la subasta', error });
  }
};

// Eliminar una subasta
exports.deleteSubasta = async (req, res) => {
  try {
    const subastaEliminada = await Subasta.findOneAndDelete({
      _id: req.params.id
    });
    
    if (!subastaEliminada) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }
    
    res.status(200).json({ message: 'Subasta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la subasta', error });
  }
}; 