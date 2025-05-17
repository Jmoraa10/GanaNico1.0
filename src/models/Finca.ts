// @ts-ignore
import mongoose, { Schema } from 'mongoose';

const movimientosGanadoSchema = new Schema({
  id: String,
  fecha: Date,
  tipo: {
    type: String,
    enum: ['ingreso', 'salida'],
    required: true
  },
  cantidad: Number,
  detalles: String,
  procedencia: String,
  destino: String,
  registradoPor: String,
  animales: {
    machos: {
      ceba: Number,
      levante: Number
    },
    hembras: {
      levante: Number,
      vientre: Number,
      preñadas: Number,
      escoteras: Number,
      paridas: {
        total: Number,
        machos: Number,
        hembras: Number
      }
    },
    equinos: {
      caballos: Number,
      yeguas: Number,
      potros: Number,
      mulas: Number,
      yeguasParidas: {
        total: Number,
        machos: Number,
        hembras: Number
      }
    },
    otros: {
      cabras: Number,
      peces: Number,
      pollos: Number,
      cabrasParidas: {
        total: Number,
        machos: Number,
        hembras: Number
      }
    }
  }
});

const fincaSchema = new Schema({
  nombre: String,
  ubicacion: String,
  area: Number,
  propietario: String,
  fechaAdquisicion: Date,
  estado: String,
  animales: {
    machos: {
      ceba: Number,
      levante: Number
    },
    hembras: {
      levante: Number,
      vientre: Number,
      preñadas: Number,
      escoteras: Number,
      paridas: {
        total: Number,
        machos: Number,
        hembras: Number
      }
    },
    equinos: {
      caballos: Number,
      yeguas: Number,
      potros: Number,
      mulas: Number,
      yeguasParidas: {
        total: Number,
        machos: Number,
        hembras: Number
      }
    },
    otros: {
      cabras: Number,
      peces: Number,
      pollos: Number,
      cabrasParidas: {
        total: Number,
        machos: Number,
        hembras: Number
      }
    }
  },
  movimientosGanado: [movimientosGanadoSchema]
});

export const Finca = mongoose.model('Finca', fincaSchema); 