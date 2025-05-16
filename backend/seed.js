const mongoose = require('mongoose');
const Finca = require('./models/Finca');

const seedFinca = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/bonitoviento', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Verificar si ya existe la finca Mónaco
    const fincaExistente = await Finca.findOne({ nombre: 'Hacienda Mónaco' });
    if (fincaExistente) {
      console.log('La finca Mónaco ya existe en la base de datos');
      process.exit(0);
    }

    // Crear la finca Mónaco
    const fincaMonaco = new Finca({
      nombre: 'Hacienda Mónaco',
      capataz: 'El Flaco',
      ubicacion: 'Vereda La Esperanza',
      hectareas: 50,
      animales: {
        hembras: {
          levante: 15,
          vientre: 20,
          preñadas: 8,
          paridas: {
            total: 12,
            criasMachos: 5,
            criasHembras: 7
          }
        },
        machos: {
          ceba: 10,
          levante: 8
        },
        equinos: {
          caballos: 3,
          yeguas: 2,
          potros: 1,
          mulas: 0,
          yeguasParidas: {
            total: 0,
            criasMachos: 0,
            criasHembras: 0
          }
        },
        otros: {
          cabras: 5,
          peces: 0,
          pollos: 0
        }
      },
      bodega: {
        suministros: [
          { nombre: 'Sillas de montar', cantidad: 2, esFaltante: false },
          { nombre: 'Cuido de ordeño', cantidad: 5, esFaltante: false },
          { nombre: 'Melaza', cantidad: 3, esFaltante: false }
        ],
        veterinarios: [
          { nombre: 'Oxitocina', cantidad: 4, esFaltante: false },
          { nombre: 'Betametasona', cantidad: 2, esFaltante: false },
          { nombre: 'Oxitetraciclina', cantidad: 6, esFaltante: false }
        ]
      },
      movimientosGanado: []
    });

    await fincaMonaco.save();
    console.log('Finca Mónaco creada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al crear la finca:', error);
    process.exit(1);
  }
};

seedFinca(); 