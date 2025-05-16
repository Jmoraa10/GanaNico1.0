const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema para paridas
const paridasSchema = new Schema({
  total: { type: Number, default: 0 },
  machos: { type: Number, default: 0 },
  hembras: { type: Number, default: 0 }
}, { _id: false });

// Esquemas para animales
const machosSchema = new Schema({
  ceba: { type: Number, default: 0 },
  levante: { type: Number, default: 0 }
}, { _id: false });

const hembrasSchema = new Schema({
  levante: { type: Number, default: 0 },
  vientre: { type: Number, default: 0 },
  preñadas: { type: Number, default: 0 },
  escoteras: { type: Number, default: 0 },
  paridas: { type: paridasSchema, default: () => ({}) }
}, { _id: false });

const equinosSchema = new Schema({
  caballos: { type: Number, default: 0 },
  yeguas: { type: Number, default: 0 },
  potros: { type: Number, default: 0 },
  mulas: { type: Number, default: 0 },
  yeguasParidas: { type: paridasSchema, default: () => ({}) }
}, { _id: false });

const otrosSchema = new Schema({
  cabras: { type: Number, default: 0 },
  peces: { type: Number, default: 0 },
  pollos: { type: Number, default: 0 },
  cabrasParidas: { type: paridasSchema, default: () => ({}) }
}, { _id: false });

const bufalosSchema = new Schema({
  machos: { 
    ceba: { type: Number, default: 0 },
    levante: { type: Number, default: 0 }
  },
  hembras: {
    levante: { type: Number, default: 0 },
    vientre: { type: Number, default: 0 },
    preñadas: { type: Number, default: 0 },
    escoteras: { type: Number, default: 0 },
    paridas: { type: paridasSchema, default: () => ({}) }
  }
}, { _id: false });

// Esquema principal de animales
const animalesSchema = new Schema({
  machos: { type: machosSchema, default: () => ({}) },
  hembras: { type: hembrasSchema, default: () => ({}) },
  equinos: { type: equinosSchema, default: () => ({}) },
  otros: { type: otrosSchema, default: () => ({}) },
  bufalos: { type: bufalosSchema, default: () => ({}) }
}, { _id: false });

// Esquema para movimientos de ganado
const movimientosGanadoSchema = new Schema({
  id: String,
  fecha: { type: Date, default: Date.now },
  tipo: {
    type: String,
    enum: ['ingreso', 'salida'],
    required: true
  },
  cantidad: { type: Number, default: 0 },
  detalles: String,
  procedencia: String,
  destino: String,
  registradoPor: String,
  animales: {
    type: animalesSchema,
    default: () => ({})
  }
}, { _id: false });

// Esquema para items de bodega
const bodegaItemSchema = new Schema({
  nombre: { type: String, required: true },
  cantidad: { type: Number, default: 0 },
  esFaltante: { type: Boolean, default: false }
}, { _id: false });

const bodegaSchema = new Schema({
  suministros: { type: [bodegaItemSchema], default: [] },
  veterinarios: { type: [bodegaItemSchema], default: [] }
}, { _id: false });

// Esquema para movimientos de bodega
const movimientoBodegaSchema = new Schema({
  id: String,
  fecha: { type: Date, default: Date.now },
  registradoPor: String,
  detalles: String
}, { _id: false });

// ESQUEMA PRINCIPAL DE FINCA
const fincaSchema = new Schema({
  nombre: { type: String, required: true },
  ubicacion: String,
  hectareas: { type: Number, default: 0 },
  capataz: { type: String },
  propietario: String,
  fechaAdquisicion: Date,
  estado: String,
  animales: { type: animalesSchema, default: () => ({}) },
  bodega: { type: bodegaSchema, default: () => ({ suministros: [], veterinarios: [] }) },
  movimientosGanado: [movimientosGanadoSchema],
  movimientosBodega: [movimientoBodegaSchema],
  ventas: [{ type: Schema.Types.ObjectId, ref: 'Venta' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Finca', fincaSchema);