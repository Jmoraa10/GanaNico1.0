const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tipoDetalleSchema = new Schema({
  criasMacho: { type: Number, default: 0 },
  criasHembra: { type: Number, default: 0 }
}, { _id: false });

const movimientoSchema = new Schema({
  fecha: { type: Date, required: true },
  subastaNumero: String,
  grupo: { type: String, enum: ['Bovinos', 'Bufalinos'], required: true },
  tipo: { type: String, required: true },
  tipoDetalle: { type: tipoDetalleSchema, default: () => ({}) },
  cantidad: { type: Number, required: true },
  pesoTotal: { type: Number, required: true },
  valorBase: { type: Number, required: true },
  porcentajeSubasta: { type: Number, required: true },
  procedencia: String,
  destino: String,
  tipoMovimiento: { type: String, enum: ['venta', 'compra', 'pago'], required: true },
  valor: Number, // Para pagos
  descripcion: String, // Para pagos
  fechaRegistro: { type: Date, default: Date.now }
}, { _id: false });

const subastaSchema = new Schema({
  nombre: { type: String, required: true },
  ubicacion: { type: String, required: true },
  historialMovimientos: [movimientoSchema],
  usuarioId: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subasta', subastaSchema); 