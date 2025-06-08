const Venta = require('../models/Venta');
const Finca = require('../models/Finca');
const eventoService = require('../services/eventoService');

// Crear una nueva venta
exports.crearVenta = async (req, res) => {
  try {
    const {
      fincaId,
      comprador,
      destino,
      registradoPor,
      tipoAnimales,
      valorPorKilo,
      animales,
      estadisticas,
      movimientosAnimales,
      movimientosBodega,
      fecha
    } = req.body;

    // Verificar que la finca existe
    const finca = await Finca.findById(fincaId);
    if (!finca) {
      return res.status(404).json({ mensaje: 'Finca no encontrada' });
    }

    // Crear la venta
    const venta = new Venta({
      finca: fincaId,
      comprador,
      destino,
      registradoPor,
      tipoAnimales,
      valorPorKilo,
      fecha: fecha || new Date(),
      animales,
      estadisticas,
      movimientosAnimales,
      movimientosBodega,
      estado: 'completada'
    });

    // Guardar la venta
    const ventaGuardada = await venta.save();

    // Agregar la venta al array de ventas de la finca
    if (!finca.ventas) {
      finca.ventas = [];
    }
    finca.ventas.push(ventaGuardada._id);
    await finca.save();

    // Crear evento en la agenda usando el servicio centralizado
    const eventoData = {
      fecha: (fecha || new Date()).toISOString().split('T')[0],
      descripcion: `Venta de ganado (${tipoAnimales}) a ${comprador}`,
      lugar: destino,
      detallesTexto: `Valor por kilo: $${valorPorKilo}. Animales: ${animales.length}`,
      registradoPor: registradoPor,
      detalles: { 
        animales, 
        estadisticas, 
        movimientosAnimales, 
        movimientosBodega,
        fincaId: finca._id,
        fincaNombre: finca.nombre
      }
    };

    await eventoService.crearEventoVenta(eventoData);

    res.status(201).json({
      mensaje: 'Venta registrada exitosamente',
      venta: ventaGuardada
    });
  } catch (error) {
    console.error('Error al crear la venta:', error);
    res.status(500).json({
      mensaje: 'Error al registrar la venta',
      error: error.message
    });
  }
};

// Obtener todas las ventas de una finca
exports.getVentasByFinca = async (req, res) => {
  try {
    const { fincaId } = req.params;
    const ventas = await Venta.find({ finca: fincaId })
      .sort({ fecha: -1 })
      .lean(); // Usar lean() para obtener objetos JavaScript planos
    
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    res.status(500).json({
      mensaje: 'Error al obtener las ventas',
      error: error.message
    });
  }
};

// Obtener una venta específica
exports.getVentaById = async (req, res) => {
  try {
    const { id } = req.params;
    const venta = await Venta.findById(id).lean();
    
    if (!venta) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }
    
    // Convertir las fechas a strings ISO
    const ventaFormateada = {
      ...venta,
      fecha: venta.fecha.toISOString(),
      createdAt: venta.createdAt.toISOString(),
      updatedAt: venta.updatedAt.toISOString()
    };
    
    res.json(ventaFormateada);
  } catch (error) {
    console.error('Error al obtener la venta:', error);
    res.status(500).json({
      mensaje: 'Error al obtener la venta',
      error: error.message
    });
  }
}; 