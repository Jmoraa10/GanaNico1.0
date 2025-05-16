const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ventaSchema = new Schema({
  finca: {
    type: Schema.Types.ObjectId,
    ref: 'Finca',
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  comprador: {
    type: String,
    required: true
  },
  destino: {
    type: String,
    required: true
  },
  registradoPor: {
    type: String,
    required: true
  },
  tipoAnimales: {
    type: String,
    required: true
  },
  valorPorKilo: {
    type: Number,
    required: true
  },
  animales: [{
    numero: Number,
    peso: Number
  }],
  estadisticas: {
    totalAnimales: Number,
    pesoTotal: Number,
    pesoPromedio: Number,
    valorPromedio: Number,
    valorTotal: Number
  },
  movimientosAnimales: [{
    tipo: {
      type: String,
      enum: ['salida'],
      default: 'salida'
    },
    cantidad: Number,
    motivo: String,
    detalles: String
  }],
  movimientosBodega: [{
    tipo: {
      type: String,
      enum: ['salida'],
      default: 'salida'
    },
    producto: String,
    cantidad: Number,
    motivo: String
  }],
  estado: {
    type: String,
    enum: ['pendiente', 'completada', 'cancelada'],
    default: 'completada'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Venta', ventaSchema); 