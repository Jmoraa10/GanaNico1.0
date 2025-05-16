const Finca = require('../models/Finca');
const mongoose = require('mongoose');

// Obtener todas las fincas
exports.getFincas = async (req, res) => {
  try {
    const fincas = await Finca.find();
    res.status(200).json(fincas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las fincas', error });
  }
};

// Obtener una finca por ID
exports.getFinca = async (req, res) => {
  try {
    let finca = await Finca.findById(req.params.id);
    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }
    // Limpiar ventas corruptas: dejar solo ObjectId
    if (Array.isArray(finca.ventas)) {
      const ventasLimpias = finca.ventas.filter(v =>
        mongoose.Types.ObjectId.isValid(v) || (v && v._id && mongoose.Types.ObjectId.isValid(v._id))
      ).map(v => (typeof v === 'object' && v._id ? v._id : v));
      if (ventasLimpias.length !== finca.ventas.length) {
        finca.ventas = ventasLimpias;
        await finca.save();
      }
    }
    res.status(200).json(finca);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la finca', error });
  }
};

// Crear una nueva finca
exports.createFinca = async (req, res) => {
  try {
    const nuevaFinca = new Finca({
      nombre: req.body.nombre,
      ubicacion: req.body.ubicacion,
      capataz: req.body.capataz,
      hectareas: req.body.hectareas,
      vacasParidas: req.body.vacasParidas,
      criasMacho: req.body.criasMacho,
      criasHembras: req.body.criasHembras,
      machoLevante: req.body.machoLevante,
      hembraLevante: req.body.hembraLevante,
      hembraVientre: req.body.hembraVientre,
      machosCeba: req.body.machosCeba,
      caballos: req.body.caballos,
      bodegas: req.body.bodegas || [],  // Inicializar bodegas como un array vacío si no se proporciona
    });
    const fincaGuardada = await nuevaFinca.save();
    res.status(201).json(fincaGuardada);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la finca', error });
  }
};

// Actualizar una finca
exports.updateFinca = async (req, res) => {
  try {
    const fincaActualizada = await Finca.findByIdAndUpdate(
      req.params.id,
      {
        nombre: req.body.nombre,
        ubicacion: req.body.ubicacion,
        capataz: req.body.capataz,
        hectareas: req.body.hectareas,
        propietario: req.body.propietario,
        fechaAdquisicion: req.body.fechaAdquisicion,
        estado: req.body.estado,
        animales: req.body.animales,
        bodega: req.body.bodega,
        movimientosGanado: req.body.movimientosGanado,
        movimientosBodega: req.body.movimientosBodega,
      },
      { new: true }
    );
    if (!fincaActualizada) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }
    res.status(200).json(fincaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la finca', error });
  }
};

// Eliminar una finca
exports.deleteFinca = async (req, res) => {
  try {
    const fincaEliminada = await Finca.findByIdAndDelete(req.params.id);
    if (!fincaEliminada) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }
    res.status(200).json({ message: 'Finca eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la finca', error });
  }
};