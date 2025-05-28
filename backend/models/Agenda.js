const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agendaSchema = new Schema({
  fecha: { type: Date, required: true },
  tipo: { 
    type: String, 
    enum: [
      'subasta', 
      'bodega', 
      'finca', 
      'venta', 
      'compra', 
      'ingreso', 
      'salida'
    ], 
    required: true 
  },
  subtipo: { type: String }, // Para especificar el tipo específico dentro de cada categoría
  titulo: { type: String, required: true },
  descripcion: { type: String },
  lugar: { type: String },
  estado: { 
    type: String, 
    enum: ['pendiente', 'cumplido', 'vencido'],
    default: 'pendiente'
  },
  fechaVencimiento: { type: Date },
  registradoPor: { type: String }, // ID del usuario que registró el cumplimiento
  detallesCumplimiento: { type: String },
  referencia: { // Para vincular con el documento original
    tipo: { type: String }, // 'subasta', 'bodega', 'finca', etc.
    id: { type: Schema.Types.ObjectId }
  },
  usuarioId: { type: String, required: true } // Usuario que creó el evento
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
agendaSchema.index({ fecha: 1 });
agendaSchema.index({ tipo: 1 });
agendaSchema.index({ estado: 1 });
agendaSchema.index({ fechaVencimiento: 1 });
agendaSchema.index({ 'referencia.id': 1 });

module.exports = mongoose.model('Agenda', agendaSchema); 