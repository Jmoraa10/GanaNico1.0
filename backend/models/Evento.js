const mongoose = require('mongoose');

const EventoSchema = new mongoose.Schema({
  fecha: { type: String, required: true },
  tipo: { type: String, enum: ['finca', 'bodega', 'venta', 'subasta', 'compra', 'deuda', 'otros'], required: true },
  descripcion: { type: String, required: true },
  lugar: { type: String, required: true },
  detallesTexto: { type: String },
  fechaVencimiento: { type: String },
  estado: { type: String, enum: ['pendiente', 'completado', 'vencido'], default: 'pendiente' },
  detalles: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Evento', EventoSchema); 