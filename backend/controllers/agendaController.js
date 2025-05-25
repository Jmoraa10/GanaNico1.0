const Evento = require('../models/Evento');

exports.crearEvento = async (req, res) => {
  try {
    const { fecha, tipo, descripcion, lugar, detalles, detallesTexto, fechaVencimiento } = req.body;
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
    res.status(500).json({ message: 'Error al crear evento', error });
  }
};

exports.getEventosPorMes = async (req, res) => {
  try {
    const { año, mes } = req.params;
    const regex = new RegExp(`^${año}-${mes.padStart(2, '0')}`);
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