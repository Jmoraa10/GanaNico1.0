const mongoose = require('mongoose');

const bodegaSchema = new mongoose.Schema({
  nombre: String,
  capacidad: Number,
  productos: [String],  // Lista de productos en la bodega
});

const fincaSchema = new mongoose.Schema({
  nombre: String,
  ubicacion: String,
  vacasParidas: Number,
  criasMacho: Number,
  criasHembras: Number,
  machoLevante: Number,
  hembraLevante: Number,
  hembraVientre: Number,
  machosCeba: Number,
  caballos: Number,
  bodegas: [bodegaSchema],  // Lista de bodegas
});

module.exports = mongoose.model('Finca', fincaSchema);