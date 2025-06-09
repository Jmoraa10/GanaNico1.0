const Transporte = require('../models/Transporte');

// Crear un nuevo viaje
exports.crearViaje = async (req, res) => {
  try {
    const transporte = new Transporte(req.body);
    await transporte.save();
    res.status(201).json(transporte);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener todos los viajes
exports.obtenerViajes = async (req, res) => {
  try {
    const viajes = await Transporte.find().sort({ createdAt: -1 });
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener viajes en curso
exports.obtenerViajesEnCurso = async (req, res) => {
  try {
    const viajes = await Transporte.find({ estado: 'EN_CURSO' }).sort({ createdAt: -1 });
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener viajes culminados
exports.obtenerViajesCulminados = async (req, res) => {
  try {
    const viajes = await Transporte.find({ estado: 'CULMINADO' }).sort({ createdAt: -1 });
    res.json(viajes);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener un viaje específico
exports.obtenerViaje = async (req, res) => {
  try {
    const viaje = await Transporte.findById(req.params.id);
    if (!viaje) {
      return res.status(404).json({ mensaje: 'Viaje no encontrado' });
    }
    res.json(viaje);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar un viaje
exports.actualizarViaje = async (req, res) => {
  try {
    const viaje = await Transporte.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!viaje) {
      return res.status(404).json({ mensaje: 'Viaje no encontrado' });
    }
    res.json(viaje);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Eliminar un viaje
exports.eliminarViaje = async (req, res) => {
  try {
    const viaje = await Transporte.findByIdAndDelete(req.params.id);
    if (!viaje) {
      return res.status(404).json({ mensaje: 'Viaje no encontrado' });
    }
    res.json({ mensaje: 'Viaje eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener resumen de transportes
exports.obtenerResumen = async (req, res) => {
  try {
    const viajes = await Transporte.find();
    const resumen = {
      totalViajes: viajes.length,
      viajesEnCurso: viajes.filter(v => v.estado === 'EN_CURSO').length,
      viajesCulminados: viajes.filter(v => v.estado === 'CULMINADO').length,
      totalGastos: viajes.reduce((total, v) => total + v.gastos.diesel + v.gastos.peajes + v.gastos.viaticos, 0),
      resumenAnimales: {},
      totalAnimales: 0,
      totalSuministros: 0
    };

    viajes.forEach(viaje => {
      if (viaje.animales) {
        viaje.animales.forEach(animal => {
          resumen.totalAnimales += animal.cantidad;
          resumen.resumenAnimales[animal.tipo] = (resumen.resumenAnimales[animal.tipo] || 0) + animal.cantidad;
        });
      }
      if (viaje.suministros) {
        resumen.totalSuministros += viaje.suministros.reduce((total, s) => total + s.cantidad, 0);
      }
    });

    res.json(resumen);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}; 