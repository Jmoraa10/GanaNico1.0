// src/pages/FincasDetalleScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Finca, FincaFormData, MovimientoGanado } from '../types/FincaTypes';
import FincaDetalle from './FincasDetalle';
import { getFincaById, updateFinca } from '../services/fincaService';
import { ArrowLeft, AlertCircle, Plus, Edit, DollarSign } from 'lucide-react';
import MovimientoGanadoDialog from '../components/MovimientoGanadoDialog';

// --- Componente Screen ---
const FincasDetalleScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [finca, setFinca] = useState<Finca | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isMovimientoDialogOpen, setIsMovimientoDialogOpen] = useState(false);

  // --- Carga de datos ---
  const fetchFinca = useCallback(async () => {
    if (!id) {
      setError("ID de finca no proporcionado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getFincaById(id);
      if (data) {
        setFinca(data);
      } else {
        setError(`La finca con ID ${id} no fue encontrada.`);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error al cargar la finca:", err.message);
        setError(`Error al cargar los datos de la finca: ${err.message}`);
      } else {
        console.error("Error al cargar la finca:", err);
        setError("Ocurrió un error desconocido al cargar los datos de la finca.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFinca();
  }, [fetchFinca]);

  // --- Actualización de datos ---
  const handleUpdate = useCallback(async (updatedFincaData: Finca) => {
    if (!updatedFincaData.id) {
      setError("ID de finca faltante para actualizar.");
      return;
    }

    setIsUpdating(true);
    setError(null);

    const formData: Partial<FincaFormData> = {
        nombre: updatedFincaData.nombre,
        capataz: updatedFincaData.capataz,
        ubicacion: updatedFincaData.ubicacion,
        hectareas: updatedFincaData.hectareas,
        animales: updatedFincaData.animales,
        bodega: updatedFincaData.bodega,
    };

    try {
      const updated = await updateFinca(updatedFincaData.id, formData);
      if (updated) {
        setFinca(updated);
      } else {
        setError(`La actualización de la finca con ID ${updatedFincaData.id} falló.`);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error("Error al actualizar la finca:", err.message);
        setError(`Error al guardar los cambios: ${err.message}`);
      } else {
        console.error("Error al actualizar la finca:", err);
        setError("Ocurrió un error desconocido al guardar los cambios.");
      }
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const handleSaveMovimiento = async (movimiento: Omit<MovimientoGanado, 'id'>) => {
    if (!finca) return;

    try {
      const updatedFinca = {
        ...finca,
        movimientosGanado: [
          ...(finca.movimientosGanado || []),
          {
            ...movimiento,
            id: Date.now().toString() // Temporal, debería venir del backend
          } as MovimientoGanado
        ]
      };

      await handleUpdate(updatedFinca);
      setIsMovimientoDialogOpen(false); // Cerramos el diálogo después de guardar
    } catch (error) {
      console.error('Error al guardar el movimiento:', error);
      setError('Error al guardar el movimiento. Por favor, intente nuevamente.');
    }
  };

  // --- Renderizado ---

  return (
    // Contenedor principal relativo para posicionar la imagen de fondo
    <div className="relative w-full min-h-screen overflow-hidden bg-gray-200">
        {/* Imagen de fondo con posicionamiento fijo */}
        <div 
            className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-80 z-0"
            style={{ 
                backgroundImage: `url('/assets/images/pantalla1.png')`,
                backgroundAttachment: 'fixed'
            }}
        />

        {/* Contenedor para el contenido principal con scroll */}
        <div className="relative z-10 w-full min-h-screen p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Botones de Navegación */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => navigate('/fincas')}
                        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 transition font-medium px-3 py-1 bg-white/70 rounded-lg shadow hover:shadow-md"
                    >
                        <ArrowLeft size={20} /> Volver a Fincas
                    </button>
                    <button
                        onClick={() => navigate('/home')}
                        className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 transition font-medium px-3 py-1 bg-white/70 rounded-lg shadow hover:shadow-md"
                    >
                        <ArrowLeft size={20} /> Volver a Home
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('user');
                            navigate('/login');
                        }}
                        className="inline-flex items-center gap-2 text-red-700 hover:text-red-900 transition font-medium px-3 py-1 bg-white/70 rounded-lg shadow hover:shadow-md"
                    >
                        Cerrar Sesión
                    </button>
                </div>

        {/* Contenido Principal */}
        {loading && (
           <div className="flex justify-center items-center h-[calc(100vh-100px)]">
             <p className="text-xl text-green-700 font-semibold animate-pulse bg-white/80 px-4 py-2 rounded-lg shadow">
               YA VAMOS LLEGANDO...
             </p>
           </div>
        )}

        {error && (
          <div className="max-w-md mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow relative text-center" role="alert">
            <strong className="font-bold mr-2"><AlertCircle className="inline-block align-text-bottom mr-1" size={20}/>Error:</strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && finca && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Detalles de la Finca</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/fincas/editar/${finca.id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Edit size={20} />
                            Editar Finca
                        </button>
                        <button
                            onClick={() => navigate(`/fincas/${finca.id}/venta`)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                        >
                            <DollarSign size={20} />
                            Venta en la finca
                        </button>
                    </div>
                </div>

                <FincaDetalle finca={finca} onUpdate={handleUpdate} onOpenMovimientoDialog={() => setIsMovimientoDialogOpen(true)} />

                <MovimientoGanadoDialog
                    isOpen={isMovimientoDialogOpen}
                    onClose={() => setIsMovimientoDialogOpen(false)}
                    onSave={handleSaveMovimiento}
                />

                {/* Indicador de guardado */}
                {isUpdating && (
                    <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse z-50">
                        ESPERE TANTICO...
                    </div>
                )}
            </div>
        )}
            </div>
        </div>
    </div>
  );
};

export default FincasDetalleScreen;