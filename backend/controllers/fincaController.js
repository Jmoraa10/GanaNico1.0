const Finca = require('../models/Finca');
const mongoose = require('mongoose');
const agendaController = require('./agendaController');

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

    // Crear evento en la agenda para la nueva finca
    await agendaController.crearEventoDesdeModulo({
      fecha: new Date(),
      tipo: 'finca',
      subtipo: 'nueva',
      titulo: `Nueva Finca: ${fincaGuardada.nombre}`,
      descripcion: `Se ha creado una nueva finca en ${fincaGuardada.ubicacion}`,
      lugar: fincaGuardada.ubicacion,
      referencia: {
        tipo: 'finca',
        id: fincaGuardada._id
      },
      usuarioId: req.user.uid
    });

    res.status(201).json(fincaGuardada);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la finca', error });
  }
};

// Actualizar una finca
exports.updateFinca = async (req, res) => {
  try {
    const fincaAnterior = await Finca.findById(req.params.id);
    if (!fincaAnterior) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }

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

    // Verificar cambios en bodegas
    if (req.body.bodega) {
      const bodegaAnterior = fincaAnterior.bodega || {};
      const bodegaNueva = req.body.bodega;

      // Verificar cambios en suministros
      if (bodegaNueva.suministros) {
        const suministrosNuevos = bodegaNueva.suministros.filter(
          nuevo => !bodegaAnterior.suministros?.some(
            antiguo => antiguo.nombre === nuevo.nombre
          )
        );

        for (const suministro of suministrosNuevos) {
          await agendaController.crearEventoDesdeModulo({
            fecha: new Date(),
            tipo: 'bodega',
            subtipo: 'suministro',
            titulo: `Nuevo Suministro: ${suministro.nombre}`,
            descripcion: `Cantidad: ${suministro.cantidad} - ${suministro.esFaltante ? 'FALTANTE' : 'Disponible'}`,
            lugar: fincaActualizada.nombre,
            referencia: {
              tipo: 'finca',
              id: fincaActualizada._id
            },
            usuarioId: req.user.uid
          });
        }
      }

      // Verificar cambios en veterinarios
      if (bodegaNueva.veterinarios) {
        const veterinariosNuevos = bodegaNueva.veterinarios.filter(
          nuevo => !bodegaAnterior.veterinarios?.some(
            antiguo => antiguo.nombre === nuevo.nombre
          )
        );

        for (const veterinario of veterinariosNuevos) {
          await agendaController.crearEventoDesdeModulo({
            fecha: new Date(),
            tipo: 'bodega',
            subtipo: 'veterinario',
            titulo: `Nuevo Producto Veterinario: ${veterinario.nombre}`,
            descripcion: `Cantidad: ${veterinario.cantidad} - ${veterinario.esFaltante ? 'FALTANTE' : 'Disponible'}`,
            lugar: fincaActualizada.nombre,
            referencia: {
              tipo: 'finca',
              id: fincaActualizada._id
            },
            usuarioId: req.user.uid
          });
        }
      }
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

    // Crear evento de eliminación en la agenda
    await agendaController.crearEventoDesdeModulo({
      fecha: new Date(),
      tipo: 'finca',
      subtipo: 'eliminacion',
      titulo: `Eliminación de Finca: ${fincaEliminada.nombre}`,
      descripcion: `Se ha eliminado la finca ubicada en ${fincaEliminada.ubicacion}`,
      lugar: fincaEliminada.ubicacion,
      referencia: {
        tipo: 'finca',
        id: fincaEliminada._id
      },
      usuarioId: req.user.uid
    });

    res.status(200).json({ message: 'Finca eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la finca', error });
  }
};