const Venta = require('../models/Venta');
const Finca = require('../models/Finca');
const { crearEventoAutomatico } = require('./eventoController');

// Obtener todas las ventas
exports.getVentas = async (req, res) => {
  try {
    const ventas = await Venta.find()
      .populate('finca', 'nombre ubicacion')
      .sort({ fecha: -1 });
    res.status(200).json(ventas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las ventas', error });
  }
};

// Obtener una venta por ID
exports.getVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id)
      .populate('finca', 'nombre ubicacion');
    
    if (!venta) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    res.status(200).json(venta);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la venta', error });
  }
};

// Crear una nueva venta
exports.createVenta = async (req, res) => {
  try {
    const nuevaVenta = new Venta({
      ...req.body,
      registradoPor: req.user.uid
    });
    
    const ventaGuardada = await nuevaVenta.save();
    const finca = await Finca.findById(ventaGuardada.finca);

    // Crear evento automático para la nueva venta
    await crearEventoAutomatico({
      titulo: `Nueva Venta en ${finca.nombre}`,
      descripcion: `Venta de ${ventaGuardada.estadisticas.totalAnimales} ${ventaGuardada.tipoAnimales}`,
      fecha: ventaGuardada.fecha,
      tipo: 'venta',
      lugar: finca.ubicacion,
      detalles: {
        ventaId: ventaGuardada._id,
        fincaId: finca._id,
        fincaNombre: finca.nombre,
        comprador: ventaGuardada.comprador,
        totalAnimales: ventaGuardada.estadisticas.totalAnimales,
        valorTotal: ventaGuardada.estadisticas.valorTotal
      },
      usuarioId: req.user.uid,
      referenciaId: ventaGuardada._id,
      referenciaTipo: 'venta'
    });

    // Crear evento para el movimiento de ganado
    await crearEventoAutomatico({
      titulo: `Salida de Ganado en ${finca.nombre}`,
      descripcion: `Salida de ${ventaGuardada.estadisticas.totalAnimales} ${ventaGuardada.tipoAnimales} por venta`,
      fecha: ventaGuardada.fecha,
      tipo: 'salida',
      lugar: finca.ubicacion,
      detalles: {
        ventaId: ventaGuardada._id,
        fincaId: finca._id,
        fincaNombre: finca.nombre,
        tipoAnimales: ventaGuardada.tipoAnimales,
        cantidad: ventaGuardada.estadisticas.totalAnimales
      },
      usuarioId: req.user.uid,
      referenciaId: ventaGuardada._id,
      referenciaTipo: 'venta'
    });

    // Si hay movimientos de bodega, crear eventos para cada uno
    if (ventaGuardada.movimientosBodega && ventaGuardada.movimientosBodega.length > 0) {
      for (const movimiento of ventaGuardada.movimientosBodega) {
        await crearEventoAutomatico({
          titulo: `Salida de Bodega en ${finca.nombre}`,
          descripcion: `Salida de ${movimiento.cantidad} ${movimiento.producto}`,
          fecha: ventaGuardada.fecha,
          tipo: 'bodega',
          lugar: finca.ubicacion,
          detalles: {
            ventaId: ventaGuardada._id,
            fincaId: finca._id,
            fincaNombre: finca.nombre,
            producto: movimiento.producto,
            cantidad: movimiento.cantidad,
            motivo: movimiento.motivo
          },
          usuarioId: req.user.uid,
          referenciaId: ventaGuardada._id,
          referenciaTipo: 'venta'
        });
      }
    }
    
    res.status(201).json(ventaGuardada);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la venta', error });
  }
};

// Actualizar una venta
exports.updateVenta = async (req, res) => {
  try {
    const ventaActualizada = await Venta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('finca', 'nombre ubicacion');
    
    if (!ventaActualizada) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    // Crear evento automático para la actualización
    await crearEventoAutomatico({
      titulo: `Actualización de Venta en ${ventaActualizada.finca.nombre}`,
      descripcion: `Actualización de venta de ${ventaActualizada.estadisticas.totalAnimales} ${ventaActualizada.tipoAnimales}`,
      fecha: new Date(),
      tipo: 'venta',
      lugar: ventaActualizada.finca.ubicacion,
      detalles: {
        ventaId: ventaActualizada._id,
        fincaId: ventaActualizada.finca._id,
        fincaNombre: ventaActualizada.finca.nombre,
        cambios: req.body
      },
      usuarioId: req.user.uid,
      referenciaId: ventaActualizada._id,
      referenciaTipo: 'venta'
    });
    
    res.status(200).json(ventaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la venta', error });
  }
};

// Eliminar una venta
exports.deleteVenta = async (req, res) => {
  try {
    const ventaEliminada = await Venta.findByIdAndDelete(req.params.id)
      .populate('finca', 'nombre ubicacion');
    
    if (!ventaEliminada) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    // Crear evento automático para la eliminación
    await crearEventoAutomatico({
      titulo: `Eliminación de Venta en ${ventaEliminada.finca.nombre}`,
      descripcion: `Eliminación de venta de ${ventaEliminada.estadisticas.totalAnimales} ${ventaEliminada.tipoAnimales}`,
      fecha: new Date(),
      tipo: 'venta',
      lugar: ventaEliminada.finca.ubicacion,
      detalles: {
        ventaId: ventaEliminada._id,
        fincaId: ventaEliminada.finca._id,
        fincaNombre: ventaEliminada.finca.nombre,
        comprador: ventaEliminada.comprador,
        totalAnimales: ventaEliminada.estadisticas.totalAnimales,
        valorTotal: ventaEliminada.estadisticas.valorTotal
      },
      usuarioId: req.user.uid,
      referenciaId: ventaEliminada._id,
      referenciaTipo: 'venta'
    });
    
    res.status(200).json({ message: 'Venta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la venta', error });
  }
}; 