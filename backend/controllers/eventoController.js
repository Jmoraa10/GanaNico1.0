const Evento = require('../models/Evento');

// Obtener todos los eventos
exports.getEventos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin, tipo, estado } = req.query;
    const query = {};

    if (fechaInicio && fechaFin) {
      query.fecha = {
        $gte: new Date(fechaInicio),
        $lte: new Date(fechaFin)
      };
    }

    if (tipo) query.tipo = tipo;
    if (estado) query.estado = estado;

    const eventos = await Evento.find(query)
      .sort({ fecha: 1 });
    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los eventos', error });
  }
};

// Crear un nuevo evento
exports.createEvento = async (req, res) => {
  try {
    const nuevoEvento = new Evento({
      ...req.body,
      usuarioId: req.user.uid
    });
    
    const eventoGuardado = await nuevoEvento.save();
    res.status(201).json(eventoGuardado);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el evento', error });
  }
};

// Actualizar estado de un evento
exports.updateEventoEstado = async (req, res) => {
  try {
    const { estado, registradoPor, detallesCumplimiento } = req.body;
    
    const eventoActualizado = await Evento.findByIdAndUpdate(
      req.params.id,
      { 
        estado,
        registradoPor,
        detallesCumplimiento,
        ...(estado === 'cumplido' && { fechaCumplimiento: new Date() })
      },
      { new: true }
    );
    
    if (!eventoActualizado) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    res.status(200).json(eventoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el evento', error });
  }
};

// Eliminar un evento
exports.deleteEvento = async (req, res) => {
  try {
    const eventoEliminado = await Evento.findByIdAndDelete(req.params.id);
    
    if (!eventoEliminado) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    res.status(200).json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el evento', error });
  }
};

// Función auxiliar para crear eventos automáticamente
exports.crearEventoAutomatico = async (datos) => {
  try {
    const nuevoEvento = new Evento(datos);
    return await nuevoEvento.save();
  } catch (error) {
    console.error('Error al crear evento automático:', error);
    throw error;
  }
}; 