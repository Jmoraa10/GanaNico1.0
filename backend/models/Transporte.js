const mongoose = require('mongoose');

const animalTransporteSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: [
      'MACHO_CEBA',
      'MACHO_LEVANTE',
      'HEMBRA_LEVANTE',
      'HEMBRA_VIENTRE',
      'VACA_ESCOTERA',
      'VACA_PARIDA',
      'BUFALO_MACHO',
      'BUFALO_HEMBRA'
    ],
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 0
  }
});

const suministroTransporteSchema = new mongoose.Schema({
  descripcion: {
    type: String,
    required: true
  },
  cantidad: {
    type: Number,
    required: true,
    min: 0
  },
  unidad: {
    type: String,
    required: true
  }
});

const gastoTransporteSchema = new mongoose.Schema({
  diesel: {
    type: Number,
    required: true,
    min: 0
  },
  peajes: {
    type: Number,
    required: true,
    min: 0
  },
  viaticos: {
    type: Number,
    required: true,
    min: 0
  }
});

const transporteSchema = new mongoose.Schema({
  camionero: {
    type: String,
    required: true
  },
  origen: {
    type: String,
    required: true
  },
  destino: {
    type: String,
    required: true
  },
  tipoCarga: {
    type: String,
    enum: ['ANIMALES', 'SUMINISTROS'],
    required: true
  },
  animales: [animalTransporteSchema],
  suministros: [suministroTransporteSchema],
  gastos: {
    type: gastoTransporteSchema,
    required: true
  },
  detallesAdicionales: String,
  horaInicio: {
    type: Date,
    required: true
  },
  estado: {
    type: String,
    enum: ['EN_CURSO', 'CULMINADO'],
    default: 'EN_CURSO'
  },
  horaCulminacion: Date
}, {
  timestamps: true
});

// Método para calcular el resumen del viaje
transporteSchema.methods.calcularResumen = function() {
  const resumen = {
    totalAnimales: 0,
    resumenAnimales: {},
    totalSuministros: 0,
    totalGastos: 0
  };

  // Calcular totales de animales
  if (this.animales && this.animales.length > 0) {
    this.animales.forEach(animal => {
      resumen.totalAnimales += animal.cantidad;
      resumen.resumenAnimales[animal.tipo] = (resumen.resumenAnimales[animal.tipo] || 0) + animal.cantidad;
    });
  }

  // Calcular totales de suministros
  if (this.suministros && this.suministros.length > 0) {
    resumen.totalSuministros = this.suministros.reduce((total, suministro) => total + suministro.cantidad, 0);
  }

  // Calcular totales de gastos
  resumen.totalGastos = this.gastos.diesel + this.gastos.peajes + this.gastos.viaticos;

  return resumen;
};

const Transporte = mongoose.model('Transporte', transporteSchema);

module.exports = Transporte; 