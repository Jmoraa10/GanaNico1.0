const express = require('express');
const Finca = require('../models/Finca'); // Importa el modelo de Finca
const admin = require('firebase-admin');
const router = express.Router();

// Middleware para verificar el token de Firebase
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Aplicar el middleware a todas las rutas
router.use(verifyToken);

// Ruta para obtener todas las fincas
router.get('/', async (req, res) => {
  try {
    const fincas = await Finca.find().sort({ createdAt: -1 });
    res.status(200).json(fincas);
  } catch (error) {
    console.error('Error al obtener las fincas:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta para obtener una finca por ID
router.get('/:id', async (req, res) => {
  try {
    const finca = await Finca.findById(req.params.id);
    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }
    res.status(200).json(finca);
  } catch (error) {
    console.error('Error al obtener la finca:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta para crear una finca
router.post('/', async (req, res) => {
  try {
    const nuevaFinca = new Finca(req.body);
    await nuevaFinca.save();
    res.status(201).json(nuevaFinca);
  } catch (error) {
    console.error('Error al crear la finca:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta para actualizar una finca
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Asegurarse de que los objetos anidados estén correctamente formateados
    if (updateData.movimientosGanado) {
      updateData.movimientosGanado = updateData.movimientosGanado.map(movimiento => ({
        ...movimiento,
        fecha: new Date(movimiento.fecha),
        animales: {
          machos: {
            ceba: Number(movimiento.animales.machos.ceba) || 0,
            levante: Number(movimiento.animales.machos.levante) || 0
          },
          hembras: {
            levante: Number(movimiento.animales.hembras.levante) || 0,
            vientre: Number(movimiento.animales.hembras.vientre) || 0,
            preñadas: Number(movimiento.animales.hembras.preñadas) || 0,
            escoteras: Number(movimiento.animales.hembras.escoteras) || 0,
            paridas: {
              total: Number(movimiento.animales.hembras.paridas.total) || 0,
              machos: Number(movimiento.animales.hembras.paridas.machos) || 0,
              hembras: Number(movimiento.animales.hembras.paridas.hembras) || 0
            }
          },
          equinos: {
            caballos: Number(movimiento.animales.equinos.caballos) || 0,
            yeguas: Number(movimiento.animales.equinos.yeguas) || 0,
            potros: Number(movimiento.animales.equinos.potros) || 0,
            mulas: Number(movimiento.animales.equinos.mulas) || 0,
            yeguasParidas: {
              total: Number(movimiento.animales.equinos.yeguasParidas.total) || 0,
              machos: Number(movimiento.animales.equinos.yeguasParidas.machos) || 0,
              hembras: Number(movimiento.animales.equinos.yeguasParidas.hembras) || 0
            }
          },
          bufalos: {
            machos: {
              levante: Number(movimiento.animales.bufalos?.machos?.levante) || 0,
              ceba: Number(movimiento.animales.bufalos?.machos?.ceba) || 0
            },
            hembras: {
              levante: Number(movimiento.animales.bufalos?.hembras?.levante) || 0,
              vientre: Number(movimiento.animales.bufalos?.hembras?.vientre) || 0,
              preñadas: Number(movimiento.animales.bufalos?.hembras?.preñadas) || 0,
              escoteras: Number(movimiento.animales.bufalos?.hembras?.escoteras) || 0,
              paridas: {
                total: Number(movimiento.animales.bufalos?.hembras?.paridas?.total) || 0,
                machos: Number(movimiento.animales.bufalos?.hembras?.paridas?.machos) || 0,
                hembras: Number(movimiento.animales.bufalos?.hembras?.paridas?.hembras) || 0
              }
            }
          },
          otros: {
            cabras: Number(movimiento.animales.otros.cabras) || 0,
            peces: Number(movimiento.animales.otros.peces) || 0,
            pollos: Number(movimiento.animales.otros.pollos) || 0,
            cabrasParidas: {
              total: Number(movimiento.animales.otros.cabrasParidas.total) || 0,
              machos: Number(movimiento.animales.otros.cabrasParidas.machos) || 0,
              hembras: Number(movimiento.animales.otros.cabrasParidas.hembras) || 0
            }
          }
        }
      }));
    }

    const finca = await Finca.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }

    res.json(finca);
  } catch (error) {
    console.error('Error al actualizar la finca:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

// Ruta para eliminar una finca
router.delete('/:id', async (req, res) => {
  try {
    const finca = await Finca.findByIdAndDelete(req.params.id);

    if (!finca) {
      return res.status(404).json({ message: 'Finca no encontrada' });
    }

    res.status(200).json({ message: 'Finca eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la finca:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;