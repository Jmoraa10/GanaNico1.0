const Finca = require('../models/Finca');

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
    const finca = await Finca.findById(req.params.id);
    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
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
        vacasParidas: req.body.vacasParidas,
        criasMacho: req.body.criasMacho,
        criasHembras: req.body.criasHembras,
        machoLevante: req.body.machoLevante,
        hembraLevante: req.body.hembraLevante,
        hembraVientre: req.body.hembraVientre,
        machosCeba: req.body.machosCeba,
        caballos: req.body.caballos,
        bodegas: req.body.bodegas || [],  // Actualizar bodegas
      },
      { new: true },  // Devolver la finca actualizada
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