// src/pages/FincasEditForm.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Importamos FincaFormData y Finca para tipado
import { FincaFormData, Animales, MovimientoGanado } from '../types/FincaTypes'; // Asegúrate de importar Animales si no está en FincaFormData
// Asegúrate de que tus hooks useFinca y useFincas estén tipados correctamente
import { useFinca, useFincas } from '../hooks/useFincas';
// Importamos los iconos necesarios
import { Save, XCircle, AlertCircle } from 'lucide-react';
// Importamos produce de immer
import { produce } from 'immer';
import MovimientoGanadoDialog from '../components/MovimientoGanadoDialog';


// Definimos un tipo más preciso para un grupo de animales que puede incluir números u objetos anidados
// (como 'paridas' que contiene 'total', 'criasMachos', etc.)

type AnimalCategoryData = {
  [key: string]: number | { [key: string]: number };
};

// Helper para navegar de forma segura por rutas de objetos anidados usando Immer
// Actualiza un valor numérico en una ruta específica dentro de un objeto draft.
const updateNestedValue = (draft: Animales, path: string, value: number): void => { // Tipamos draft como Animales
  const keys = path.split('.');
  // 'current' empieza siendo el draft.animales y se mueve por la estructura.
  // Usamos 'any' aquí porque el tipo de 'current' cambia dinámicamente
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = draft; // Empezamos desde el objeto Animales

  // Navegamos hasta el penúltimo nivel de la ruta
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    // Verificamos que la clave existe en el objeto actual y que es un objeto
    if (!(key in current) || typeof current[key] !== 'object') {
      console.error(`Invalid path: Key "${key}" not found or is not an object in path "${path}".`);
      return;
    }
    current = current[key];
  }

  // Llegamos al último nivel, la clave final donde asignaremos el valor
  const finalKey = keys[keys.length - 1];
  // Verificamos que el penúltimo nivel es un objeto válido y contiene la clave final (o se puede crear)
  if (current === null || typeof current !== 'object' || Array.isArray(current)) {
     console.error(`Invalid final path step: "${path}". Penultimate level is not an object.`);
     return;
  }

  // Aseguramos que el objeto actual sea válido antes de asignar el valor
  if (typeof current[finalKey] === 'number' || current[finalKey] === undefined) {
    current[finalKey] = value;
  } else {
    console.error(`Cannot assign value to non-numeric key "${finalKey}" in path "${path}".`);
  }
};


// Función para inicializar los datos del formulario con una estructura por defecto
const getInitialFormData = (): FincaFormData => ({
  nombre: '',
  capataz: '',
  ubicacion: '',
  hectareas: 0,
  animales: {
    hembras: { levante: 0, vientre: 0, preñadas: 0, escoteras: 0, paridas: { total: 0, criasMachos: 0, criasHembras: 0, machos: 0, hembras: 0 } },
    machos: { ceba: 0, levante: 0 },
    equinos: { caballos: 0, yeguas: 0, potros: 0, mulas: 0 },
    otros: {
      cabras: 0, peces: 0, pollos: 0,
      cabrasParidas: { total: 0, machos: 0, hembras: 0, criasMachos: 0, criasHembras: 0 }
    },
    bufalos: {
      machos: { ceba: 0, levante: 0 },
      hembras: { levante: 0, vientre: 0, preñadas: 0, escoteras: 0, paridas: { total: 0, criasMachos: 0, criasHembras: 0, machos: 0, hembras: 0 } }
    }
  },
  bodega: { suministros: [], veterinarios: [] },
  movimientosGanado: []
});

// Helper para formatear las claves de objeto a etiquetas legibles (ej: "criasMachos" -> "CRIAS MACHOS")
const formatLabel = (str: string): string => {
    // Inserta un espacio antes de cada letra mayúscula (excepto al inicio) y convierte a mayúsculas
    return str.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
};

const FincasEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Usamos useFinca para cargar los datos iniciales de la finca
  const { finca, loading: loadingFinca, error: fetchError } = useFinca(id || '');
  // Usamos useFincas para la función de actualización
  const { updateFinca, loading: updating } = useFincas();
  // Estado del formulario, inicializado con la estructura por defecto
  const [formData, setFormData] = React.useState<FincaFormData>(getInitialFormData());
  // Estado para manejar errores al guardar el formulario
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isMovimientoDialogOpen, setIsMovimientoDialogOpen] = useState(false);

  // Efecto para cargar los datos de la finca en el formulario cuando 'finca' cambia
  React.useEffect(() => {
    if (finca) {
        // Al cargar, mapeamos los datos de la finca a la estructura de formData.
        // Usamos '??' (nullish coalescing) para proporcionar valores por defecto
        // solo si la propiedad es null o undefined, manteniendo 0 o '' si existen.
        setFormData(produce(draft => {
             draft.nombre = finca.nombre ?? '';
             draft.capataz = finca.capataz ?? '';
             draft.ubicacion = finca.ubicacion ?? '';
             draft.hectareas = finca.hectareas ?? 0;
             // Fusiona los animales existentes con los default para asegurar todas las claves
             draft.animales = {
                ...getInitialFormData().animales, // Empieza con la estructura completa default
                ...(finca.animales ?? {}), // Sobrescribe con los datos de la finca si existen
                hembras: { // Asegura la estructura interna de hembras y paridas
                    ...getInitialFormData().animales.hembras,
                    ...(finca.animales?.hembras ?? {}),
                    paridas: {
                        ...getInitialFormData().animales.hembras.paridas,
                        ...(finca.animales?.hembras?.paridas ?? {})
                    }
                },
                machos: { ...getInitialFormData().animales.machos, ...(finca.animales?.machos ?? {}) },
                equinos: { ...getInitialFormData().animales.equinos, ...(finca.animales?.equinos ?? {}) },
                otros: { ...getInitialFormData().animales.otros, ...(finca.animales?.otros ?? {}) },
             };
             draft.bodega = finca.bodega ?? getInitialFormData().bodega;
        }));
    }
    // Este efecto depende de 'finca'. Se ejecutará cada vez que el objeto 'finca' cambie.
  }, [finca]);

  // Handler genérico para inputs de texto/área de texto (propiedades de nivel superior)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(produce((draft: FincaFormData) => {
        if (name in draft && typeof draft[name as keyof FincaFormData] === 'string') {
        (draft[name as keyof FincaFormData] as string) = value;
        } else {
            console.warn(`Input name "${name}" does not match a valid string top-level property.`);
        }
    }));
  };

  // Handler para inputs numéricos (propiedades de nivel superior, ej: hectareas)
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = Number(value);

    if (value === '' || !isNaN(numberValue)) {
      setFormData(produce((draft: FincaFormData) => {
             if (name in draft && typeof draft[name as keyof FincaFormData] === 'number') {
          (draft[name as keyof FincaFormData] as number) = value === '' ? 0 : numberValue;
             } else {
                 console.warn(`Input name "${name}" does not match a numeric top-level property.`);
             }
         }));
    } else {
        console.warn(`Invalid input value for numeric field "${name}":`, value);
    }
  };

  // Handler para cambios en inputs de animales (propiedades anidadas)
  const handleAnimalChange = (path: string, inputValue: string) => { // Recibe el valor del input como string
      const numberValue = Number(inputValue);
      // Si es número válido o cadena vacía (interpretada como 0)
      if (!isNaN(numberValue) || inputValue === '') {
            const valueToSet = inputValue === '' ? 0 : numberValue;
            setFormData(produce(draft => {
                // Pasa el número válido (o 0) al helper de actualización, operando sobre draft.animales
                updateNestedValue(draft.animales, path, valueToSet);
            }));
      } else {
          // Si el valor no es numérico ni vacío, no hacer nada o mostrar error
          console.warn(`Invalid value provided for animal input at path "${path}":`, inputValue);
      }
  };

  // Componente auxiliar para renderizar un grupo de inputs de animales (ej: Hembras, Machos)
  const AnimalInputGroup: React.FC<{
    title: string;
    pathPrefix: string;
    groupData: AnimalCategoryData;
    onChange: (path: string, value: string) => void;
  }> = ({ title, pathPrefix, groupData, onChange }) => {
    if (!groupData) return null;

    return (
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h4 className="text-lg font-medium text-gray-800 mb-3">{title}</h4>
        {Object.entries(groupData).map(([key, value]) => {
          const currentPath = `${pathPrefix}.${key}`;

          if (typeof value === 'object' && value !== null) {
            return (
              <div key={key} className="mb-3 border-t border-gray-200 pt-3 mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formatLabel(key)}
                </label>
                {Object.entries(value).map(([subKey, subValue]) => {
                  const subPath = `${currentPath}.${subKey}`;
                  return (
                    <div key={subKey} className="flex items-center mb-2">
                      <label className="w-1/2 text-sm text-gray-600 pr-2">
                        {formatLabel(subKey)}:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={typeof subValue === 'number' ? subValue : 0}
                        onChange={(e) => onChange(subPath, e.target.value)}
                        className="w-1/2 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={key} className="flex items-center mb-3">
              <label className="w-1/2 text-sm font-medium text-gray-700 pr-2">
                {formatLabel(key)}:
              </label>
              <input
                type="number"
                min="0"
                value={typeof value === 'number' ? value : 0}
                onChange={(e) => onChange(currentPath, e.target.value)}
                className="w-1/2 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          );
        })}
      </div>
    );
  };


  const handleSaveMovimiento = async (movimientoData: Omit<MovimientoGanado, 'id'>) => {
    if (!id) return;

    try {
      const newMovimiento: MovimientoGanado = {
        ...movimientoData,
        id: Date.now().toString(),
        fecha: new Date().toISOString(),
        animales: {
          machos: {
            ceba: formData.animales?.machos?.ceba || 0,
            levante: formData.animales?.machos?.levante || 0,
          },
          hembras: {
            levante: formData.animales?.hembras?.levante || 0,
            vientre: formData.animales?.hembras?.vientre || 0,
            preñadas: formData.animales?.hembras?.preñadas || 0,
            escoteras: formData.animales?.hembras?.escoteras || 0,
            paridas: formData.animales?.hembras?.paridas || { total: 0, machos: 0, hembras: 0 }
          },
          equinos: {
            caballos: formData.animales?.equinos?.caballos || 0,
            yeguas: formData.animales?.equinos?.yeguas || 0,
            potros: formData.animales?.equinos?.potros || 0,
            mulas: formData.animales?.equinos?.mulas || 0,
            yeguasParidas: {
              total: formData.animales?.equinos?.yeguasParidas?.total || 0,
              machos: formData.animales?.equinos?.yeguasParidas?.machos || 0,
              hembras: formData.animales?.equinos?.yeguasParidas?.hembras || 0,
            }
          },
          otros: {
            cabras: formData.animales?.otros?.cabras || 0,
            peces: formData.animales?.otros?.peces || 0,
            pollos: formData.animales?.otros?.pollos || 0,
            cabrasParidas: {
              total: formData.animales?.otros?.cabrasParidas?.total || 0,
              machos: formData.animales?.otros?.cabrasParidas?.machos || 0,
              hembras: formData.animales?.otros?.cabrasParidas?.hembras || 0,
            }
          },
          bufalos: {
            machos: {
              ceba: formData.animales?.bufalos?.machos?.ceba || 0,
              levante: formData.animales?.bufalos?.machos?.levante || 0,
            },
            hembras: {
              levante: formData.animales?.bufalos?.hembras?.levante || 0,
              vientre: formData.animales?.bufalos?.hembras?.vientre || 0,
              preñadas: formData.animales?.bufalos?.hembras?.preñadas || 0,
              escoteras: formData.animales?.bufalos?.hembras?.escoteras || 0,
              paridas: formData.animales?.bufalos?.hembras?.paridas || { total: 0, machos: 0, hembras: 0 }
            }
          },
        }
      };

      const updatedFinca = {
        ...formData,
        movimientosGanado: [...(formData.movimientosGanado || []), newMovimiento]
      };

      await updateFinca(id, updatedFinca);
      setIsMovimientoDialogOpen(false);
      navigate(`/fincas/${id}/detalle`);
    } catch (error) {
      console.error('Error al guardar el movimiento:', error);
    }
  };

  // Handler para el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!id) {
      setSubmitError("ID de finca no disponible para actualizar.");
      return;
    }

    if (!formData.nombre.trim()) {
      setSubmitError("El nombre de la finca no puede estar vacío.");
      return;
    }

    try {
      await updateFinca(id, formData);
      // Abrimos el diálogo y navegamos a la página de detalles
      setIsMovimientoDialogOpen(true);
      navigate(`/fincas/${id}/detalle`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al guardar";
      console.error('Error al actualizar la finca:', err);
      setSubmitError(`Error al guardar los cambios: ${errorMessage}`);
    }
  };

  // --- Renderizado Condicional ---
  if (loadingFinca) {
    return <LoadingSpinner message="Cargando datos de la finca..." />;
  }

  if (fetchError) {
    return <ErrorAlert message={fetchError} />;
  }

  // No es estrictamente necesario si useFinca maneja bien el error, pero es una doble verificación
  if (!finca) {
    return <WarningAlert message="No se encontraron datos de la finca para editar con el ID proporcionado." />;
  }

  // --- Renderizado del Formulario ---
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl my-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Editar Finca: {formData.nombre || '...'}</h2>

      {/* Mostrar errores de submit si existen */}
      {submitError && <ErrorAlert message={submitError} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Sección de Información General */}
        <GeneralInfoSection
          formData={formData}
          onInputChange={handleInputChange}
          onNumberChange={handleNumberInputChange} // Pasamos el handler correcto
        />

        {/* Sección de Animales */}
        <div className="border-b pb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Animales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Pasamos el handler handleAnimalChange y la parte correspondiente de formData.animales */}
             <AnimalInputGroup
               title="Hembras"
               pathPrefix="hembras" // El prefijo es relativo a 'animales'
               groupData={formData.animales?.hembras}
               onChange={handleAnimalChange} // Pasamos el handler que recibe string
             />
             <AnimalInputGroup
               title="Machos"
               pathPrefix="machos"
               groupData={formData.animales?.machos}
               onChange={handleAnimalChange}
             />
             <AnimalInputGroup
               title="Equinos"
               pathPrefix="equinos"
               groupData={formData.animales?.equinos as AnimalCategoryData}
               onChange={handleAnimalChange}
             />
             <AnimalInputGroup
               title="Otros Animales"
               pathPrefix="otros"
               groupData={formData.animales?.otros as AnimalCategoryData}
               onChange={handleAnimalChange}
             />
             {/* Sección Búfalos */}
             <AnimalInputGroup
               title="Búfalos"
               pathPrefix="bufalos"
               groupData={{
                 machos: formData.animales?.bufalos?.machos,
                 hembras: {
                   levante: formData.animales?.bufalos?.hembras?.levante || 0,
                   vientre: formData.animales?.bufalos?.hembras?.vientre || 0,
                   escoteras: formData.animales?.bufalos?.hembras?.escoteras || 0,
                   preñadas: formData.animales?.bufalos?.hembras?.preñadas || 0
                 }
               }}
               onChange={handleAnimalChange}
             />
          </div>
        </div>

        {/* Sección de Bodega (Opcional: Mostrar o gestionar aquí si es necesario) */}
        {/* <div className="border-b pb-6">
             <h3 className="text-xl font-semibold text-gray-700 mb-4">Bodega</h3>
             <p className="text-gray-600 italic">Gestión de bodega (si aplica)...</p>
        </div> */}

        {/* Acciones del formulario */}
        <FormActions
          onCancel={() => navigate(`/fincas/${id}`)} // Handler para Cancelar
          isSubmitting={updating} // Estado de carga para deshabilitar botones
        />
      </form>

      <MovimientoGanadoDialog
        isOpen={isMovimientoDialogOpen}
        onClose={() => {
          setIsMovimientoDialogOpen(false);
        }}
        onSave={handleSaveMovimiento}
      />
    </div>
  );
};

// --- Componentes Auxiliares (sin cambios significativos respecto al original, solo verificación) ---

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center min-h-[200px]">
    <div className="text-center">
        <Spinner />
        <p className="text-lg text-gray-600 mt-2">{message}</p>
    </div>
  </div>
);

const ErrorAlert: React.FC<{ message: string; className?: string }> = ({ message, className = '' }) => (
  <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow relative text-center ${className}`}>
    <strong className="font-bold mr-2"><AlertCircle className="inline-block align-text-bottom mr-1" size={20}/>Error:</strong>
    <span className="block sm:inline ml-1">{message}</span>
  </div>
);

const WarningAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="max-w-md mx-auto bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded-lg shadow relative text-center mt-8">
    <strong className="font-bold mr-2"><AlertCircle className="inline-block align-text-bottom mr-1" size={20}/>Advertencia:</strong>
    <span className="block sm:inline ml-1">{message}</span>
  </div>
);

const GeneralInfoSection: React.FC<{
  formData: Pick<FincaFormData, 'nombre' | 'capataz' | 'ubicacion' | 'hectareas'>; // Solo las props necesarias
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ formData, onInputChange, onNumberChange }) => (
  <div className="border-b pb-6">
    <h3 className="text-xl font-semibold text-gray-700 mb-4">Información General</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormInput
        label="Nombre"
        id="nombre"
        name="nombre"
        value={formData.nombre} // String
        onChange={onInputChange}
        required
      />
      <FormInput
        label="Capataz"
        id="capataz"
        name="capataz"
        value={formData.capataz} // String
        onChange={onInputChange}
      />
      <FormInput
        label="Ubicación"
        id="ubicacion"
        name="ubicacion"
        value={formData.ubicacion} // String
        onChange={onInputChange}
      />
      <FormNumberInput
        label="Hectáreas"
        id="hectareas"
        name="hectareas"
        value={formData.hectareas} // Pasa el número del estado
        onChange={onNumberChange} // Usa el handler correcto para números
        min="0"
      />
    </div>
  </div>
);

const FormInput: React.FC<{
  label: string;
  id: string;
  name: string;
  value: string; // Espera string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
}> = ({ label, id, name, value, onChange, required = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && '*'}:</label>
    <input
      type="text" // Asegurar tipo texto
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  </div>
);

const FormNumberInput: React.FC<{
  label: string;
  id: string;
  name: string;
  value: number; // Espera número del estado
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Recibe evento
  min?: string;
  step?: string; // Opcional: añadir step
}> = ({ label, id, name, value, onChange, min, step }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}:</label>
    <input
      type="number"
      id={id}
      name={name}
      // Convertir número a string para el input value, manejar NaN o null/undefined
      value={String(value ?? 0)}
      onChange={onChange}
      min={min}
      step={step}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
  </div>
);

const FormActions: React.FC<{
  onCancel: () => void;
  isSubmitting: boolean;
}> = ({ onCancel, isSubmitting }) => (
  <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
    <button
      type="button"
      onClick={onCancel}
      disabled={isSubmitting}
      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
    >
      <XCircle size={20} /> Cancelar
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50"
    >
      {isSubmitting ? (
        <>
          <Spinner />
          Guardando...
        </>
      ) : (
        <>
          <Save size={20} /> Guardar Cambios
        </>
      )}
    </button>
    {/* La sintaxis aquí ahora está correcta */}
  </div>
);

const Spinner: React.FC = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
  </svg>
);

export default FincasEditForm;