const Transporte = require('../models/Transporte');

// Crear un nuevo viaje
exports.crearViaje = async (req, res) => {
  try {
    const transporte = new Transporte({
      ...req.body,
      horaInicio: new Date(),
      estado: 'EN_CURSO'
    });
    await transporte.save();
    const viajeConResumen = {
      ...transporte.toObject(),
      resumen: transporte.calcularResumen()
    };
    res.status(201).json(viajeConResumen);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener todos los viajes
exports.obtenerViajes = async (req, res) => {
  try {
    const viajes = await Transporte.find().sort({ createdAt: -1 });
    const viajesConResumen = viajes.map(viaje => ({
      ...viaje.toObject(),
      resumen: viaje.calcularResumen()
    }));
    res.json(viajesConResumen);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener viajes en curso
exports.obtenerViajesEnCurso = async (req, res) => {
  try {
    const viajes = await Transporte.find({ estado: 'EN_CURSO' }).sort({ createdAt: -1 });
    const viajesConResumen = viajes.map(viaje => ({
      ...viaje.toObject(),
      resumen: viaje.calcularResumen()
    }));
    res.json(viajesConResumen);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener viajes culminados
exports.obtenerViajesCulminados = async (req, res) => {
  try {
    const viajes = await Transporte.find({ estado: 'CULMINADO' }).sort({ createdAt: -1 });
    const viajesConResumen = viajes.map(viaje => ({
      ...viaje.toObject(),
      resumen: viaje.calcularResumen()
    }));
    res.json(viajesConResumen);
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
    const viajeConResumen = {
      ...viaje.toObject(),
      resumen: viaje.calcularResumen()
    };
    res.json(viajeConResumen);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar un viaje
exports.actualizarViaje = async (req, res) => {
  try {
    console.log('ID del viaje a actualizar:', req.params.id);
    console.log('Datos recibidos:', req.body);

    const { detallesFinalizacion } = req.body;
    const viaje = await Transporte.findById(req.params.id);
    
    if (!viaje) {
      console.log('Viaje no encontrado con ID:', req.params.id);
      return res.status(404).json({ mensaje: 'Viaje no encontrado' });
    }

    // Si se está marcando como culminado, actualizar la hora de culminación
    if (req.body.estado === 'CULMINADO' && viaje.estado === 'EN_CURSO') {
      viaje.horaCulminacion = new Date();
      viaje.detallesFinalizacion = detallesFinalizacion;
    }

    // Actualizar los demás campos
    Object.assign(viaje, req.body);
    await viaje.save();

    const viajeConResumen = {
      ...viaje.toObject(),
      resumen: viaje.calcularResumen()
    };
    res.json(viajeConResumen);
  } catch (error) {
    console.error('Error al actualizar viaje:', error);
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
      totalSuministros: 0,
      tiempoPromedioViajes: 0,
      viajesPorEstado: {
        enCurso: [],
        culminados: []
      }
    };

    let tiempoTotalViajes = 0;
    let viajesCulminadosCount = 0;

    viajes.forEach(viaje => {
      // Procesar animales
      if (viaje.animales) {
        viaje.animales.forEach(animal => {
          resumen.totalAnimales += animal.cantidad;
          resumen.resumenAnimales[animal.tipo] = (resumen.resumenAnimales[animal.tipo] || 0) + animal.cantidad;
        });
      }

      // Procesar suministros
      if (viaje.suministros) {
        resumen.totalSuministros += viaje.suministros.reduce((total, s) => total + s.cantidad, 0);
      }

      // Procesar tiempos
      if (viaje.estado === 'CULMINADO' && viaje.horaCulminacion) {
        const duracion = Math.round((new Date(viaje.horaCulminacion) - new Date(viaje.horaInicio)) / (1000 * 60));
        tiempoTotalViajes += duracion;
        viajesCulminadosCount++;
      }

      // Agregar a la lista correspondiente según estado
      const viajeResumen = viaje.calcularResumen();
      if (viaje.estado === 'EN_CURSO') {
        resumen.viajesPorEstado.enCurso.push({
          id: viaje._id,
          camionero: viaje.camionero,
          origen: viaje.origen,
          destino: viaje.destino,
          horaInicio: viaje.horaInicio,
          resumen: viajeResumen
        });
      } else {
        resumen.viajesPorEstado.culminados.push({
          id: viaje._id,
          camionero: viaje.camionero,
          origen: viaje.origen,
          destino: viaje.destino,
          horaInicio: viaje.horaInicio,
          horaCulminacion: viaje.horaCulminacion,
          duracion: viajeResumen.duracionViaje,
          detallesAdicionales: viaje.detallesAdicionales,
          resumen: viajeResumen
        });
      }
    });

    // Calcular tiempo promedio de viajes culminados
    if (viajesCulminadosCount > 0) {
      resumen.tiempoPromedioViajes = Math.round(tiempoTotalViajes / viajesCulminadosCount);
    }

    res.json(resumen);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
}; 