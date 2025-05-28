const Subasta = require('../models/Subasta');
const { crearEventoAutomatico } = require('./eventoController');

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

    // Crear evento automático para la nueva subasta
    await crearEventoAutomatico({
      titulo: `Nueva Subasta: ${subastaGuardada.nombre}`,
      descripcion: `Se ha creado una nueva subasta en ${subastaGuardada.ubicacion}`,
      fecha: new Date(),
      tipo: 'subasta',
      lugar: subastaGuardada.ubicacion,
      detalles: {
        subastaId: subastaGuardada._id,
        nombre: subastaGuardada.nombre
      },
      usuarioId: req.user.uid,
      referenciaId: subastaGuardada._id,
      referenciaTipo: 'subasta'
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

    // Crear evento automático para la actualización
    await crearEventoAutomatico({
      titulo: `Actualización de Subasta: ${subastaActualizada.nombre}`,
      descripcion: `Se ha actualizado la subasta en ${subastaActualizada.ubicacion}`,
      fecha: new Date(),
      tipo: 'subasta',
      lugar: subastaActualizada.ubicacion,
      detalles: {
        subastaId: subastaActualizada._id,
        nombre: subastaActualizada.nombre,
        cambios: req.body
      },
      usuarioId: req.user.uid,
      referenciaId: subastaActualizada._id,
      referenciaTipo: 'subasta'
    });
    
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

    // Crear evento automático para la eliminación
    await crearEventoAutomatico({
      titulo: `Eliminación de Subasta: ${subastaEliminada.nombre}`,
      descripcion: `Se ha eliminado la subasta en ${subastaEliminada.ubicacion}`,
      fecha: new Date(),
      tipo: 'subasta',
      lugar: subastaEliminada.ubicacion,
      detalles: {
        subastaId: subastaEliminada._id,
        nombre: subastaEliminada.nombre
      },
      usuarioId: req.user.uid,
      referenciaId: subastaEliminada._id,
      referenciaTipo: 'subasta'
    });
    
    res.status(200).json({ message: 'Subasta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la subasta', error });
  }
}; 