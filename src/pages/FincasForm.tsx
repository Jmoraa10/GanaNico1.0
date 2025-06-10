import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Asegúrate de que estos tipos existan y sean correctos
import { FincaFormData, Animales, MovimientoGanado } from '../types/FincaTypes';
import NumericInput from './NumericInput'; // Asume que este componente existe y funciona
import { useFincas, useFinca } from '../hooks/useFincas'; // Hooks combinados si vienen del mismo sitio
import { produce } from 'immer'; // Usar Immer para actualizaciones anidadas más sencillas
import MovimientoGanadoDialog from '../components/MovimientoGanadoDialog';
import { getFincaById } from '../services/fincaService';
import { useLogout } from '../hooks/useLogout';

// Helper para formatear etiquetas (opcional, si no lo tienes globalmente)
const formatLabel = (str: string): string => {
    return str.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
};

// Tipo base para un grupo de animales que puede tener números o sub-objetos con números
type AnimalGroup = Record<string, number | Record<string, number>>;

// Valor inicial incluyendo bodega y movimientosGanado
const getInitialFincaFormData = (): FincaFormData => ({
    nombre: '',
    capataz: '',
    ubicacion: '',
    hectareas: 0,
    animales: {
        hembras: { levante: 0, vientre: 0, preñadas: 0, escoteras: 0, paridas: { total: 0, machos: 0, hembras: 0 } },
        machos: { ceba: 0, levante: 0 },
        equinos: { caballos: 0, yeguas: 0, potros: 0, mulas: 0 },
        otros: { cabras: 0, peces: 0, pollos: 0, cabrasParidas: { total: 0, machos: 0, hembras: 0 } },
        bufalos: {
            machos: { ceba: 0, levante: 0 },
            hembras: { 
                levante: 0, 
                vientre: 0, 
                preñadas: 0, 
                escoteras: 0, 
                paridas: { total: 0, machos: 0, hembras: 0 } 
            }
        }
    },
    bodega: { suministros: [], veterinarios: [] },
    movimientosGanado: []
});

interface MovimientoChanges {
  tipo: 'ingreso' | 'salida';
  cantidad: number;
  detalles: string;
  animales: {
    machos: number;
    hembras: number;
    equinos: number;
    otros: number;
    bufalos: number;
  };
}

const FincasForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // ID para saber si es edición
  const isEditing = Boolean(id);
  const { addFinca, updateFinca, loading: saving } = useFincas(); // Asume que useFincas retorna 'loading'
  // Cargar datos solo si estamos editando
  const { finca: existingFinca, loading: loadingFinca } = useFinca(id || ''); // Removed second argument
  const logout = useLogout();

  // Estado inicial con la estructura completa, incluyendo bodega
  const [formData, setFormData] = React.useState<FincaFormData>(getInitialFincaFormData());
  const [error, setError] = React.useState<string | null>(null); // Para errores del formulario
  const [isMovimientoDialogOpen, setIsMovimientoDialogOpen] = useState(false);
  const [lastChanges, setLastChanges] = useState<MovimientoChanges | null>(null);

  // Efecto para cargar datos existentes en modo edición
  React.useEffect(() => {
    if (isEditing && existingFinca) {
        setFormData(produce(draft => {
             draft.nombre = existingFinca.nombre ?? '';
             draft.capataz = existingFinca.capataz ?? '';
             draft.ubicacion = existingFinca.ubicacion ?? '';
             draft.hectareas = existingFinca.hectareas ?? 0;
             // Fusionar animales y bodega asegurando estructura completa
             draft.animales = {
                ...getInitialFincaFormData().animales,
                ...(existingFinca.animales ?? {}),
                hembras: {
                    ...getInitialFincaFormData().animales.hembras,
                    ...(existingFinca.animales?.hembras ?? {}),
                    paridas: {
                        ...getInitialFincaFormData().animales.hembras.paridas,
                        ...(existingFinca.animales?.hembras?.paridas ?? {})
                    }
                },
                machos: { ...getInitialFincaFormData().animales.machos, ...(existingFinca.animales?.machos ?? {}) },
                equinos: { ...getInitialFincaFormData().animales.equinos, ...(existingFinca.animales?.equinos ?? {}) },
                otros: { ...getInitialFincaFormData().animales.otros, ...(existingFinca.animales?.otros ?? {}) },
                bufalos: { ...getInitialFincaFormData().animales.bufalos, ...(existingFinca.animales?.bufalos ?? {}) }
             };
             draft.bodega = existingFinca.bodega ?? getInitialFincaFormData().bodega;
        }));
    }
     // Resetear si pasamos de editar a crear (aunque normalmente la navegación desmonta el componente)
    // Eliminado el reseteo automático de formData aquí para evitar limpiar datos al guardar
    // if (!isEditing) {
    //     setFormData(getInitialFincaFormData());
    // }
  }, [isEditing, existingFinca]); // Dependencias

  // Handler para inputs de texto simples (nombre, capataz, ubicacion)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(produce(draft => {
        if (name === 'nombre' || name === 'capataz' || name === 'ubicacion') {
            draft[name] = value;
        }
    }));
  };

  // Handler para input numérico simple (hectareas)
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = Number(value);
    if (name === 'hectareas' && (value === '' || !isNaN(numberValue))) {
       setFormData(produce(draft => {
           draft.hectareas = value === '' ? 0 : numberValue;
       }));
    }
  };

 // Handler genérico para cambios en NumericInput de animales
 const handleAnimalChange = (path: string, value: number | null) => {
    const keys = path.split('.'); // e.g., ['hembras', 'paridas', 'total']
    const valueToSet = value ?? 0; // Si llega null (podría pasar si NumericInput lo permite), usar 0

    setFormData(produce(draft => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let currentLevel: any = draft.animales; // Empezar en el objeto animales

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (currentLevel && typeof currentLevel === 'object' && key in currentLevel) {
                currentLevel = currentLevel[key];
            } else {
                return; // Salir si la ruta no es válida
            }
        }

        const finalKey = keys[keys.length - 1];
        if (currentLevel && typeof currentLevel === 'object' && finalKey in currentLevel) {
            // Verificar si el destino es un número antes de asignar
             if (typeof currentLevel[finalKey] === 'number') {
                currentLevel[finalKey] = valueToSet;
             } else {
                 return;
             }
        }
    }));
 };


  // Función para renderizar los inputs de un grupo de animales
  const renderAnimalInputs = (pathPrefix: keyof Animales, group: AnimalGroup | undefined | null) => {
    if (!group) return <p className="text-sm text-gray-500">Datos no disponibles.</p>;

    return Object.entries(group).map(([key, value]) => {
      const currentPath = `${pathPrefix}.${key}`;

      // Caso 1: Subgrupo anidado (como 'paridas' o 'cabrasParidas')
      if (typeof value === 'object' && value !== null) {
        const nestedGroup = value as Record<string, number>;
        return (
          <div key={key} className="form-group nested-group pl-4 border-l-2 border-gray-200 mb-3 pb-2">
            <label className="font-semibold mb-1 block text-sm text-gray-600">
              {formatLabel(key)}
            </label>
            {Object.entries(nestedGroup).map(([subKey, subValue]) => {
              const numericSubValue = typeof subValue === 'number' ? subValue : 0;
              const subPath = `${currentPath}.${subKey}`;
              return (
                <div key={subKey} className="form-subgroup mb-2 flex items-center">
                  <label className="text-xs block w-1/2 pr-2">
                    {formatLabel(subKey)}
                  </label>
                  <NumericInput
                    value={numericSubValue}
                    onChange={(val) => handleAnimalChange(subPath, val)}
                  />
                </div>
              );
            })}
          </div>
        );
      }

      // Caso 2: Campo numérico simple
      else if (typeof value === 'number') {
        const numericValue = typeof value === 'number' ? value : 0;
        return (
          <div key={key} className="form-group mb-3 flex items-center">
            <label className="font-semibold mb-1 block text-sm w-1/2 pr-2">
              {formatLabel(key)}
            </label>
            <NumericInput
              value={numericValue}
              onChange={(val) => handleAnimalChange(currentPath, val)}
            />
          </div>
        );
      }
        return null;
    });
  };


  // Handler para enviar el formulario (crear o actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim()) {
        setError("El nombre de la finca es obligatorio.");
        return;
    }

    try {
      if (isEditing && id) {
        const changes: MovimientoChanges = {
          tipo: 'ingreso',
          cantidad: 1,
          detalles: 'Actualización de información de la finca',
          animales: {
            machos: (formData.animales?.machos?.ceba || 0) + (formData.animales?.machos?.levante || 0),
            hembras: (formData.animales?.hembras?.levante || 0) + (formData.animales?.hembras?.vientre || 0),
            equinos: (formData.animales?.equinos?.caballos || 0) + (formData.animales?.equinos?.yeguas || 0),
            otros: (formData.animales?.otros?.cabras || 0) + (formData.animales?.otros?.peces || 0) + (formData.animales?.otros?.pollos || 0),
            bufalos:
              ((formData.animales?.bufalos?.machos?.ceba || 0) +
              (formData.animales?.bufalos?.machos?.levante || 0) +
              (formData.animales?.bufalos?.hembras?.levante || 0) +
              (formData.animales?.bufalos?.hembras?.vientre || 0) +
              (formData.animales?.bufalos?.hembras?.preñadas || 0) +
              (formData.animales?.bufalos?.hembras?.escoteras || 0) +
              (formData.animales?.bufalos?.hembras?.paridas?.total || 0))
          }
        };
        setLastChanges(changes);
        setIsMovimientoDialogOpen(true);
      } else {
        const newFinca = await addFinca(formData);
        // Limpiar el formulario solo después de navegar
        setFormData(getInitialFincaFormData());
        navigate(`/fincas/${newFinca.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los cambios');
    }
  };

  const handleSaveMovimiento = async (movimientoData: Omit<MovimientoGanado, 'id'>) => {
    if (!id) return;

    try {
      // Crear el nuevo movimiento con todos los datos necesarios
      const newMovimiento: MovimientoGanado = {
        ...movimientoData,
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        registradoPor: movimientoData.registradoPor,
        animales: {
          machos: {
            ceba: formData.animales?.machos?.ceba || 0,
            levante: formData.animales?.machos?.levante || 0
          },
          hembras: {
            levante: formData.animales?.hembras?.levante || 0,
            vientre: formData.animales?.hembras?.vientre || 0,
            preñadas: formData.animales?.hembras?.preñadas || 0,
            escoteras: formData.animales?.hembras?.escoteras || 0,
            paridas: {
              total: formData.animales?.hembras?.paridas?.total || 0,
              machos: formData.animales?.hembras?.paridas?.machos || 0,
              hembras: formData.animales?.hembras?.paridas?.hembras || 0
            }
          },
          equinos: {
            caballos: formData.animales?.equinos?.caballos || 0,
            yeguas: formData.animales?.equinos?.yeguas || 0,
            potros: formData.animales?.equinos?.potros || 0,
            mulas: formData.animales?.equinos?.mulas || 0,
            yeguasParidas: {
              total: formData.animales?.equinos?.yeguasParidas?.total || 0,
              machos: formData.animales?.equinos?.yeguasParidas?.machos || 0,
              hembras: formData.animales?.equinos?.yeguasParidas?.hembras || 0
            }
          },
          otros: {
            cabras: formData.animales?.otros?.cabras || 0,
            peces: formData.animales?.otros?.peces || 0,
            pollos: formData.animales?.otros?.pollos || 0,
            cabrasParidas: {
              total: formData.animales?.otros?.cabrasParidas?.total || 0,
              machos: formData.animales?.otros?.cabrasParidas?.machos || 0,
              hembras: formData.animales?.otros?.cabrasParidas?.hembras || 0
            }
          },
          bufalos: {
            machos: {
              ceba: formData.animales?.bufalos?.machos?.ceba || 0,
              levante: formData.animales?.bufalos?.machos?.levante || 0
            },
            hembras: {
              levante: formData.animales?.bufalos?.hembras?.levante || 0,
              vientre: formData.animales?.bufalos?.hembras?.vientre || 0,
              preñadas: formData.animales?.bufalos?.hembras?.preñadas || 0,
              escoteras: formData.animales?.bufalos?.hembras?.escoteras || 0,
              paridas: {
                total: formData.animales?.bufalos?.hembras?.paridas?.total || 0,
                machos: formData.animales?.bufalos?.hembras?.paridas?.machos || 0,
                hembras: formData.animales?.bufalos?.hembras?.paridas?.hembras || 0
              }
            }
          }
        }
      };

      // Obtener la finca actual para preservar los movimientos existentes
      const fincaActual = await getFincaById(id);
      if (!fincaActual) {
        throw new Error('No se encontró la finca');
      }

      // Actualizar la finca con el nuevo movimiento, preservando los existentes
      const updatedFinca = {
        ...formData,
        movimientosGanado: [...(fincaActual.movimientosGanado || []), newMovimiento]
      };

      // Guardar la actualización
      const result = await updateFinca(id, updatedFinca);
      
      if (result) {
        setIsMovimientoDialogOpen(false);
        // Redirigir a la página de detalles
      navigate(`/fincas/${id}`);
      } else {
        throw new Error('No se pudo actualizar la finca');
      }
    } catch (error) {
      console.error('Error al guardar el movimiento:', error);
      setError('Error al guardar el movimiento. Por favor, intente nuevamente.');
    }
  };

  // Renderizado mientras carga datos para edición
  if (isEditing && loadingFinca) {
      return <div className="text-center p-10">Cargando datos de la finca...</div>;
  }

  // --- Renderizado del Formulario ---
  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Imagen de fondo con posicionamiento fijo */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-50 z-0"
        style={{ 
          backgroundImage: `url('/assets/images/editarfinca.png')`,
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Contenido principal */}
      <div className="relative z-10 w-full min-h-screen p-4 md:p-6 font-rio">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Editar Finca' : 'Nueva Finca'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
              Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <div className="p-4 bg-gray-50 rounded-md border">
            <h3 className="text-lg font-semibold text-gray-700 border-b mb-4 pb-2">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre*</label>
                 <input
                   type="text"
                   id="nombre"
                   name="nombre"
                   value={formData.nombre}
                   onChange={handleInputChange}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                   readOnly={isEditing}
                 />
              </div>
               <div>
                 <label htmlFor="capataz" className="block text-sm font-medium text-gray-700 mb-1">Capataz</label>
                 <input
                   type="text"
                   id="capataz"
                   name="capataz"
                   value={formData.capataz}
                   onChange={handleInputChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                   readOnly={isEditing}
                 />
               </div>
               <div className="md:col-span-2">
                 <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                 <input
                   type="text"
                   id="ubicacion"
                   name="ubicacion"
                   value={formData.ubicacion}
                   onChange={handleInputChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                   readOnly={isEditing}
                 />
               </div>
               <div>
                 <label htmlFor="hectareas" className="block text-sm font-medium text-gray-700 mb-1">Hectáreas</label>
                 <input
                   type="number"
                   id="hectareas"
                   name="hectareas"
                   min="0"
                   value={formData.hectareas}
                   onChange={handleNumberInputChange}
                   className="w-full md:w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                   readOnly={isEditing}
                 />
               </div>
            </div>
          </div>

          {/* Sección Animales */}
          <div>
               <h3 className="text-lg font-semibold text-gray-700 mb-3">Animales</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">Hembras</h4>
                      {renderAnimalInputs('hembras', formData.animales?.hembras)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">Machos</h4>
                      {renderAnimalInputs('machos', formData.animales?.machos)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">Equinos</h4>
                      {renderAnimalInputs('equinos', formData.animales?.equinos as AnimalGroup)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">Otros Animales</h4>
                      {renderAnimalInputs('otros', formData.animales?.otros as AnimalGroup)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md border">
  <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">Búfalos</h4>

  {/* Sección de Machos */}
  <div className="mb-4">
  <h5 className="text-sm font-medium text-gray-700 mb-2">Machos</h5>
  <div className="space-y-2">
    {/* Contador de Ceba */}
    <div className="flex items-center">
      <label className="text-xs block w-1/2 pr-2">CEBA</label>
      <NumericInput
        value={formData.animales?.bufalos?.machos?.ceba || 0}
        onChange={(val) => handleAnimalChange('bufalos.machos.ceba', val)}
      />
    </div>
    {/* Contador de Levante */}
    <div className="flex items-center">
      <label className="text-xs block w-1/2 pr-2">LEVANTE</label>
      <NumericInput
        value={formData.animales?.bufalos?.machos?.levante || 0}
        onChange={(val) => handleAnimalChange('bufalos.machos.levante', val)}
      />
    </div>
  </div>
</div>

  {/* Sección de Hembras - Contadores específicos */}
  <div className="mb-4">
    <h5 className="text-sm font-medium text-gray-700 mb-2">Hembras</h5>
    <div className="space-y-2">
      {/* Contador de Levante */}
      <div className="flex items-center">
        <label className="text-xs block w-1/2 pr-2">LEVANTE</label>
        <NumericInput
          value={formData.animales?.bufalos?.hembras?.levante || 0}
          onChange={(val) => handleAnimalChange('bufalos.hembras.levante', val)}
        />
      </div>
      
      {/* Contador de Vientre */}
      <div className="flex items-center">
        <label className="text-xs block w-1/2 pr-2">VIENTRE</label>
        <NumericInput
          value={formData.animales?.bufalos?.hembras?.vientre || 0}
          onChange={(val) => handleAnimalChange('bufalos.hembras.vientre', val)}
        />
      </div>
      
      {/* Contador de Escoteras */}
      <div className="flex items-center">
        <label className="text-xs block w-1/2 pr-2">ESCOTERAS</label>
        <NumericInput
          value={formData.animales?.bufalos?.hembras?.escoteras || 0}
          onChange={(val) => handleAnimalChange('bufalos.hembras.escoteras', val)}
        />
      </div>
      
      {/* Contador de Preñadas */}
      <div className="flex items-center">
        <label className="text-xs block w-1/2 pr-2">PREÑADAS</label>
        <NumericInput
          value={formData.animales?.bufalos?.hembras?.preñadas || 0}
          onChange={(val) => handleAnimalChange('bufalos.hembras.preñadas', val)}
        />
      </div>
    </div>
  </div>

  {/* Sección de Búfalas Paridas (la que funciona) */}
  <div className="pl-4 border-l-2 border-gray-200">
    <h5 className="text-sm font-medium text-gray-700 mb-2">Búfalas Paridas</h5>
    {formData.animales?.bufalos?.hembras?.paridas &&
      Object.entries(formData.animales.bufalos.hembras.paridas).map(([key, value]) => (
        <div key={key} className="form-group mb-2 flex items-center">
          <label className="text-xs block w-1/2 pr-2">
            {formatLabel(key)}
          </label>
          <NumericInput
            value={typeof value === 'number' ? value : 0}
            onChange={val => handleAnimalChange(`bufalos.hembras.paridas.${key}`, val)}
          />
        </div>
      )
    )}
  </div>
</div>
               </div>
          </div>


          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 pt-5 mt-4 border-t">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => navigate(isEditing ? `/fincas/${id}` : '/fincas')} // Modificado para redirigir a detalles si estamos editando
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Guardando...' : (isEditing ? 'Actualizar Finca' : 'Guardar Finca')}
            </button>
          </div>
        </form>

        {/* Diálogo de Movimiento */}
        {isMovimientoDialogOpen && lastChanges && (
          <MovimientoGanadoDialog
            isOpen={isMovimientoDialogOpen}
            onClose={() => setIsMovimientoDialogOpen(false)}
            onSave={handleSaveMovimiento}
              initialData={{
                ...lastChanges,
                detalles: `Actualización de información de la finca ${formData.nombre}`,
                registradoPor: localStorage.getItem('user') || ''
              }}
          />
        )}
        </div>
      </div>
      <button
        onClick={logout}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default FincasForm;