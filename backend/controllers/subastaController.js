const Subasta = require('../models/Subasta');

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
      _id: req.params.id,
      usuarioId: req.user.uid
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
    res.status(201).json(subastaGuardada);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la subasta', error });
  }
};

// Actualizar una subasta
exports.updateSubasta = async (req, res) => {
  try {
    const subastaActualizada = await Subasta.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.user.uid },
      req.body,
      { new: true }
    );
    
    if (!subastaActualizada) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
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
      _id: req.params.id,
      usuarioId: req.user.uid
    });
    
    if (!subastaEliminada) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }
    
    res.status(200).json({ message: 'Subasta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la subasta', error });
  }
}; 