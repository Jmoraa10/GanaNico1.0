const Subasta = require('../models/Subasta');
const eventoService = require('../services/eventoService');

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

exports.crearMovimiento = async (req, res) => {
  try {
    const { subastaId, movimiento } = req.body;
    const subasta = await Subasta.findById(subastaId);
    
    if (!subasta) {
      return res.status(404).json({ message: 'Subasta no encontrada' });
    }

    // Agregar el movimiento al historial
    subasta.historialMovimientos.push(movimiento);
    await subasta.save();

    // Crear evento en la agenda según el tipo de movimiento
    let eventoData = {
      fecha: movimiento.fecha,
      descripcion: '',
      lugar: subasta.ubicacion,
      detallesTexto: '',
      registradoPor: movimiento.registradoPor || 'Sistema',
      detalles: movimiento
    };

    switch (movimiento.tipoMovimiento) {
      case 'venta':
        eventoData.descripcion = `Venta en subasta: ${movimiento.tipo} (${movimiento.cantidad} unidades)`;
        eventoData.detallesTexto = `Valor base: $${movimiento.valorBase}. Porcentaje: ${movimiento.porcentajeSubasta}%`;
        await eventoService.crearEventoSubasta(eventoData);
        break;

      case 'compra':
        eventoData.descripcion = `Compra en subasta: ${movimiento.tipo} (${movimiento.cantidad} unidades)`;
        eventoData.detallesTexto = `Valor base: $${movimiento.valorBase}. Porcentaje: ${movimiento.porcentajeSubasta}%`;
        await eventoService.crearEventoSubasta(eventoData);
        break;

      case 'pago':
        eventoData.descripcion = `Pago en subasta: $${movimiento.valor}`;
        eventoData.detallesTexto = movimiento.descripcion || 'Pago registrado';
        await eventoService.crearEventoSubasta(eventoData);
        break;
    }

    res.status(201).json(subasta);
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({ message: 'Error al crear el movimiento', error: error.message });
  }
}; 