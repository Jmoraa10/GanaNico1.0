import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Finca, BodegaItem, MovimientoBodega } from '../types/FincaTypes';
import { getFincaById, updateFinca } from '../services/fincaService';
import { PlusCircle, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import AlertaFaltantes from '../components/AlertaFaltantes';
import MovimientoBodegaDialog from '../components/MovimientoBodegaDialog';

const BodegaEditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [finca, setFinca] = useState<Finca | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFaltanteDialog, setShowFaltanteDialog] = useState(false);
  const [faltanteSection, setFaltanteSection] = useState<'suministros' | 'veterinarios'>('suministros');
  const [faltanteNombre, setFaltanteNombre] = useState('');
  const [isMovimientoDialogOpen, setIsMovimientoDialogOpen] = useState(false);

  // Cargar datos de la finca
  React.useEffect(() => {
    const fetchFinca = async () => {
      if (!id) return;
      try {
        const data = await getFincaById(id);
        console.log('[DEBUG] Finca cargada:', data);
        setFinca(data);
      } catch (err) {
        setError('Error al cargar los datos de la finca');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinca();
  }, [id]);

  // Manejadores para agregar/quitar items
  const handleAddItem = (section: 'suministros' | 'veterinarios') => {
    const nombre = prompt('Nombre del nuevo item:');
    if (!nombre || !finca) return;

    const nuevoItem: BodegaItem = {
      nombre,
      cantidad: 0,
      esFaltante: false
    };

    setFinca({
      ...finca,
      bodega: {
        ...finca.bodega,
        [section]: [...finca.bodega[section], nuevoItem]
      }
    });
  };

  const handleRemoveItem = (section: 'suministros' | 'veterinarios', index: number) => {
    if (!finca) return;
    
    setFinca({
      ...finca,
      bodega: {
        ...finca.bodega,
        [section]: finca.bodega[section].filter((_, i) => i !== index)
      }
    });
  };

  const handleQuantityChange = (section: 'suministros' | 'veterinarios', index: number, delta: number) => {
    if (!finca) return;

    const newItems = [...finca.bodega[section]];
    newItems[index] = {
      ...newItems[index],
      cantidad: Math.max(0, newItems[index].cantidad + delta)
    };

    setFinca({
      ...finca,
      bodega: {
        ...finca.bodega,
        [section]: newItems
      }
    });
  };

  // Faltantes
  const handleAddFaltante = () => {
    setShowFaltanteDialog(true);
    setFaltanteNombre('');
    setFaltanteSection('suministros');
  };

  const handleFaltanteSubmit = () => {
    if (!finca || !faltanteNombre) return;
    const nuevoItem: BodegaItem = { nombre: faltanteNombre, cantidad: 0, esFaltante: true };
    setFinca({
      ...finca,
      bodega: {
        ...finca.bodega,
        [faltanteSection]: [...finca.bodega[faltanteSection], nuevoItem]
      }
    });
    setShowFaltanteDialog(false);
  };

  const handleMarcarComoComprado = (section: 'suministros' | 'veterinarios', nombre: string) => {
    if (!finca) return;
    setFinca({
      ...finca,
      bodega: {
        ...finca.bodega,
        [section]: finca.bodega[section].map(item =>
          item.nombre === nombre ? { ...item, esFaltante: false } : item
        )
      }
    });
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!finca || !id) return;
    try {
      const payload = {
        nombre: finca.nombre,
        capataz: finca.capataz,
        ubicacion: finca.ubicacion,
        hectareas: finca.hectareas,
        animales: finca.animales,
        bodega: finca.bodega
      };
      console.log('[DEBUG] Enviando a updateFinca (bodega):', payload);
      const response = await updateFinca(id, payload);
      console.log('[DEBUG] Respuesta de updateFinca (bodega):', response);
      setIsMovimientoDialogOpen(true);
    } catch (err) {
      setError('Error al guardar la bodega. Intenta de nuevo.');
      console.error(err);
    }
  };

  const handleSaveMovimientoBodega = async (movimiento: Omit<MovimientoBodega, 'id'>) => {
    if (!finca || !id) return;
    try {
      const updatedMovimientos = [
        ...(finca.movimientosBodega || []),
        { ...movimiento, id: Date.now().toString(), snapshotBodega: { ...finca.bodega } }
      ];
      const payload = { movimientosBodega: updatedMovimientos };
      console.log('[DEBUG] Enviando a updateFinca (movimientosBodega):', payload);
      const response = await updateFinca(id, payload);
      console.log('[DEBUG] Respuesta de updateFinca (movimientosBodega):', response);
      setIsMovimientoDialogOpen(false);
      navigate(`/fincas/${id}`);
    } catch (err) {
      setError('Error al guardar el movimiento');
      console.error(err);
    }
  };

  // Cancelar
  const handleCancel = () => {
    navigate(`/fincas/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-green-700">Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-700">{error}</p>
      </div>
    );
  }

  if (!finca) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-700">No se encontró la finca</p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gray-200">
      {/* Fondo con imagen y overlay difuminado */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-60 z-0"
        style={{ 
          backgroundImage: `url('/assets/images/editarbodega.png')`,
          backgroundAttachment: 'fixed',
          filter: 'blur(1.5px)'
        }}
      />
      <div className="fixed top-0 left-0 w-full h-full bg-white/60 backdrop-blur-sm z-0" />

      {/* Contenido principal */}
      <div className="relative z-10 w-full min-h-screen p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 inline-block">
              <button
                onClick={() => navigate(`/fincas/${id}`)}
                className="flex items-center gap-2 px-3 py-2 text-blue-700 hover:text-blue-900 font-semibold"
              >
                <ArrowLeft size={18} /> Volver a Finca
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Editar Bodega</h1>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Actualizar Bodega
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancelar
              </button>
            </div>
          </div>

          {/* Botón para agregar faltante */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleAddFaltante}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow"
            >
              <AlertCircle size={20} /> Agregar Faltante
            </button>
          </div>

          {/* Alarma de faltantes */}
          <AlertaFaltantes
            items={[...finca.bodega.suministros, ...finca.bodega.veterinarios]}
            onMarcarComoComprado={(nombre) => {
              // Buscar en qué sección está el faltante
              if (finca.bodega.suministros.some(i => i.nombre === nombre)) {
                handleMarcarComoComprado('suministros', nombre);
              } else {
                handleMarcarComoComprado('veterinarios', nombre);
              }
            }}
            titulo="Productos"
            className="mb-8"
          />

          {/* Diálogo simple para agregar faltante */}
          {showFaltanteDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4 text-red-700 flex items-center gap-2"><AlertCircle />Agregar Faltante</h2>
                <label className="block mb-2 font-medium">Nombre del producto</label>
                <input
                  type="text"
                  value={faltanteNombre}
                  onChange={e => setFaltanteNombre(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                  placeholder="Nombre"
                  autoFocus
                />
                <label className="block mb-2 font-medium">Sección</label>
                <select
                  value={faltanteSection}
                  onChange={e => setFaltanteSection(e.target.value as 'suministros' | 'veterinarios')}
                  className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                >
                  <option value="suministros">Suministros</option>
                  <option value="veterinarios">Veterinarios</option>
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowFaltanteDialog(false)}
                    className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleFaltanteSubmit}
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
                    disabled={!faltanteNombre.trim()}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sección de Suministros */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-700">Suministros</h2>
              <button
                onClick={() => handleAddItem('suministros')}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                <PlusCircle size={20} /> Agregar Suministro
              </button>
            </div>
            <div className="space-y-4">
              {finca.bodega.suministros.map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${item.esFaltante ? 'bg-red-100 border border-red-400' : 'bg-gray-50'}`}>
                  <span className={`font-medium ${item.esFaltante ? 'text-red-700' : ''}`}>{item.nombre}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange('suministros', index, -1)}
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => handleQuantityChange('suministros', index, 1)}
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem('suministros', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección de Veterinarios */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-red-700">Productos Veterinarios</h2>
              <button
                onClick={() => handleAddItem('veterinarios')}
                className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
              >
                <PlusCircle size={20} /> Agregar Producto
              </button>
            </div>
            <div className="space-y-4">
              {finca.bodega.veterinarios.map((item, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${item.esFaltante ? 'bg-red-100 border border-red-400' : 'bg-gray-50'}`}>
                  <span className={`font-medium ${item.esFaltante ? 'text-red-700' : ''}`}>{item.nombre}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange('veterinarios', index, -1)}
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => handleQuantityChange('veterinarios', index, 1)}
                        className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem('veterinarios', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botones inferiores sticky */}
      <div className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 py-4 flex justify-end gap-4 px-6 z-10">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow"
        >
          Actualizar Bodega
        </button>
        <button
          onClick={() => navigate(`/fincas/${id}`)}
          className="bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-400 shadow"
        >
          Cancelar
        </button>
      </div>

      <MovimientoBodegaDialog
        isOpen={isMovimientoDialogOpen}
        onClose={() => setIsMovimientoDialogOpen(false)}
        onSave={handleSaveMovimientoBodega}
        bodegaActual={finca?.bodega}
      />
    </div>
  );
}

export default BodegaEditForm;