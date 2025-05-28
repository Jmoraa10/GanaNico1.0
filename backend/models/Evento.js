const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventoSchema = new Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  fecha: { type: Date, required: true },
  tipo: { 
    type: String, 
    enum: ['subasta', 'bodega', 'finca', 'venta', 'ingreso', 'salida'],
    required: true 
  },
  estado: {
    type: String,
    enum: ['pendiente', 'cumplido', 'vencido'],
    default: 'pendiente'
  },
  fechaVencimiento: { type: Date },
  lugar: { type: String },
  detalles: { type: Schema.Types.Mixed },
  registradoPor: { type: String },
  detallesCumplimiento: { type: String },
  usuarioId: { type: String, required: true },
  referenciaId: { type: Schema.Types.ObjectId }, // ID del documento relacionado (subasta, bodega, etc)
  referenciaTipo: { type: String } // Tipo de documento relacionado
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
eventoSchema.index({ fecha: 1 });
eventoSchema.index({ tipo: 1 });
eventoSchema.index({ estado: 1 });
eventoSchema.index({ usuarioId: 1 });
eventoSchema.index({ referenciaId: 1, referenciaTipo: 1 });

module.exports = mongoose.model('Evento', eventoSchema); 