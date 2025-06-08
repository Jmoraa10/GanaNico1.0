const Evento = require('../models/Evento');

const eventoService = {
  async crearEventoFinca(data) {
    const { fecha, tipo, descripcion, lugar, detallesTexto, registradoPor, detalles } = data;
    return await Evento.create({
      fecha: fecha || new Date().toISOString().split('T')[0],
      tipo: 'finca',
      descripcion,
      lugar,
      detallesTexto,
      registradoPor,
      detalles,
      estado: 'pendiente'
    });
  },

  async crearEventoBodega(data) {
    const { fecha, descripcion, lugar, detallesTexto, registradoPor, detalles } = data;
    return await Evento.create({
      fecha: fecha || new Date().toISOString().split('T')[0],
      tipo: 'bodega',
      descripcion,
      lugar,
      detallesTexto,
      registradoPor,
      detalles,
      estado: 'pendiente'
    });
  },

  async crearEventoSubasta(data) {
    const { fecha, tipo, descripcion, lugar, detallesTexto, registradoPor, detalles } = data;
    return await Evento.create({
      fecha: fecha || new Date().toISOString().split('T')[0],
      tipo: 'subasta',
      descripcion,
      lugar,
      detallesTexto,
      registradoPor,
      detalles,
      estado: 'pendiente'
    });
  },

  async crearEventoVenta(data) {
    const { fecha, descripcion, lugar, detallesTexto, registradoPor, detalles } = data;
    return await Evento.create({
      fecha: fecha || new Date().toISOString().split('T')[0],
      tipo: 'venta',
      descripcion,
      lugar,
      detallesTexto,
      registradoPor,
      detalles,
      estado: 'pendiente'
    });
  }
};

module.exports = eventoService; 