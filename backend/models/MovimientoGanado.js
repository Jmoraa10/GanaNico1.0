const mongoose = require('mongoose');

const movimientoGanadoSchema = new mongoose.Schema({
  fincaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Finca',
    required: true
  },
  tipoMovimiento: {
    type: String,
    enum: ['entrada', 'salida', 'muerte', 'nacimiento'],
    required: true
  },
  categoria: {
    type: String,
    enum: ['vacasParidas', 'criasMacho', 'criasHembras', 'machoLevante', 'hembraLevante', 'hembraVientre', 'machosCeba', 'caballos'],
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 1
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  observaciones: {
    type: String,
    trim: true
  },
  usuarioId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MovimientoGanado', movimientoGanadoSchema); 