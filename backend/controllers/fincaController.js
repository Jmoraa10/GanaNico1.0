const Finca = require('../models/Finca');
const mongoose = require('mongoose');
const { crearEventoAutomatico } = require('./eventoController');

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
      bodegas: req.body.bodegas || [],
    });
    const fincaGuardada = await nuevaFinca.save();

    // Crear evento automático para la nueva finca
    await crearEventoAutomatico({
      titulo: `Nueva Finca: ${fincaGuardada.nombre}`,
      descripcion: `Se ha creado una nueva finca en ${fincaGuardada.ubicacion}`,
      fecha: new Date(),
      tipo: 'finca',
      lugar: fincaGuardada.ubicacion,
      detalles: {
        fincaId: fincaGuardada._id,
        nombre: fincaGuardada.nombre,
        capataz: fincaGuardada.capataz,
        hectareas: fincaGuardada.hectareas
      },
      usuarioId: req.user.uid,
      referenciaId: fincaGuardada._id,
      referenciaTipo: 'finca'
    });

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

    // Crear evento automático para la actualización
    await crearEventoAutomatico({
      titulo: `Actualización de Finca: ${fincaActualizada.nombre}`,
      descripcion: `Se ha actualizado la finca en ${fincaActualizada.ubicacion}`,
      fecha: new Date(),
      tipo: 'finca',
      lugar: fincaActualizada.ubicacion,
      detalles: {
        fincaId: fincaActualizada._id,
        nombre: fincaActualizada.nombre,
        cambios: req.body
      },
      usuarioId: req.user.uid,
      referenciaId: fincaActualizada._id,
      referenciaTipo: 'finca'
    });

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

    // Crear evento automático para la eliminación
    await crearEventoAutomatico({
      titulo: `Eliminación de Finca: ${fincaEliminada.nombre}`,
      descripcion: `Se ha eliminado la finca en ${fincaEliminada.ubicacion}`,
      fecha: new Date(),
      tipo: 'finca',
      lugar: fincaEliminada.ubicacion,
      detalles: {
        fincaId: fincaEliminada._id,
        nombre: fincaEliminada.nombre
      },
      usuarioId: req.user.uid,
      referenciaId: fincaEliminada._id,
      referenciaTipo: 'finca'
    });

    res.status(200).json({ message: 'Finca eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la finca', error });
  }
};

// Agregar movimiento de ganado
exports.agregarMovimientoGanado = async (req, res) => {
  try {
    const finca = await Finca.findById(req.params.id);
    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }

    const nuevoMovimiento = {
      id: new mongoose.Types.ObjectId().toString(),
      ...req.body,
      fecha: new Date()
    };

    finca.movimientosGanado.push(nuevoMovimiento);
    await finca.save();

    // Crear evento automático para el movimiento de ganado
    await crearEventoAutomatico({
      titulo: `Movimiento de Ganado en ${finca.nombre}`,
      descripcion: `${nuevoMovimiento.tipo === 'ingreso' ? 'Ingreso' : 'Salida'} de ${nuevoMovimiento.cantidad} animales`,
      fecha: nuevoMovimiento.fecha,
      tipo: nuevoMovimiento.tipo,
      lugar: finca.ubicacion,
      detalles: {
        fincaId: finca._id,
        fincaNombre: finca.nombre,
        movimiento: nuevoMovimiento
      },
      usuarioId: req.user.uid,
      referenciaId: finca._id,
      referenciaTipo: 'finca'
    });

    res.status(200).json(finca);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar movimiento de ganado', error });
  }
};

// Agregar movimiento de bodega
exports.agregarMovimientoBodega = async (req, res) => {
  try {
    const finca = await Finca.findById(req.params.id);
    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }

    const nuevoMovimiento = {
      id: new mongoose.Types.ObjectId().toString(),
      ...req.body,
      fecha: new Date()
    };

    finca.movimientosBodega.push(nuevoMovimiento);
    await finca.save();

    // Crear evento automático para el movimiento de bodega
    await crearEventoAutomatico({
      titulo: `Movimiento de Bodega en ${finca.nombre}`,
      descripcion: `Actualización de inventario en bodega`,
      fecha: nuevoMovimiento.fecha,
      tipo: 'bodega',
      lugar: finca.ubicacion,
      detalles: {
        fincaId: finca._id,
        fincaNombre: finca.nombre,
        movimiento: nuevoMovimiento
      },
      usuarioId: req.user.uid,
      referenciaId: finca._id,
      referenciaTipo: 'finca'
    });

    res.status(200).json(finca);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar movimiento de bodega', error });
  }
};