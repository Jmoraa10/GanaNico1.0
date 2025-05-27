const Evento = require('../models/Evento');

exports.crearEvento = async (req, res) => {
  try {
    const { fecha, tipo, descripcion, lugar, detalles, detallesTexto, fechaVencimiento } = req.body;
    if (!fecha || !tipo || !descripcion || !lugar) {
      return res.status(400).json({ message: 'Faltan campos requeridos: fecha, tipo, descripcion, lugar' });
    }
    const evento = new Evento({
      fecha,
      tipo,
      descripcion,
      lugar,
      detallesTexto: detallesTexto || detalles || '',
      fechaVencimiento,
      estado: 'pendiente',
      detalles: {},
    });
    await evento.save();
    res.status(201).json(evento);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear evento', error: error.message, stack: error.stack });
  }
};

exports.getEventosPorMes = async (req, res) => {
  try {
    const { anio, mes } = req.params;
    const regex = new RegExp(`^${anio}-${mes.padStart(2, '0')}`);
    const eventos = await Evento.find({ fecha: { $regex: regex } });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener eventos del mes', error });
  }
};

exports.getEventosPorDia = async (req, res) => {
  try {
    const { fecha } = req.params;
    const eventos = await Evento.find({ fecha });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener eventos del día', error });
  }
};

exports.getEventosPendientes = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const eventos = await Evento.find({ estado: 'pendiente', fechaVencimiento: { $gte: hoy } });
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener eventos pendientes', error });
  }
};

exports.marcarEventoCumplido = async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await Evento.findByIdAndUpdate(id, { estado: 'completado' }, { new: true });
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: 'Error al marcar evento como cumplido', error });
  }
}; 