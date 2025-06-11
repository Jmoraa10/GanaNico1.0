import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Home, LogOut, Plus, CheckCircle, Clock, Truck, DollarSign, Calendar } from "lucide-react";
import { ViajeTransporte, TipoCarga, TipoAnimal, AnimalTransporte, SuministroTransporte } from '../types/Transporte';
import { transporteService } from '../services/transporteService';
import { Dialog } from '@headlessui/react';

const TIPOS_ANIMALES: { value: TipoAnimal; label: string }[] = [
  { value: 'MACHO_CEBA', label: 'Machos de Ceba' },
  { value: 'MACHO_LEVANTE', label: 'Machos de Levante' },
  { value: 'HEMBRA_LEVANTE', label: 'Hembras de Levante' },
  { value: 'HEMBRA_VIENTRE', label: 'Hembras de Vientre' },
  { value: 'VACA_ESCOTERA', label: 'Vacas Escoteras' },
  { value: 'VACA_PARIDA', label: 'Vacas Paridas' },
  { value: 'BUFALO_MACHO', label: 'Búfalos Machos' },
  { value: 'BUFALO_HEMBRA', label: 'Búfalos Hembras' },
];

const CamionerosScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [selectedViaje, setSelectedViaje] = useState<ViajeTransporte | null>(null);
  const [completionDetails, setCompletionDetails] = useState('');
  const [viajesEnCurso, setViajesEnCurso] = useState<ViajeTransporte[]>([]);
  const [viajesCulminados, setViajesCulminados] = useState<ViajeTransporte[]>([]);
  const [, setLoading] = useState(true);

  // Estado del formulario
  const [formData, setFormData] = useState({
    camionero: '',
    origen: '',
    destino: '',
    tipoCarga: 'ANIMALES' as TipoCarga,
    animales: [] as AnimalTransporte[],
    suministros: [] as SuministroTransporte[],
    gastos: {
      diesel: 0,
      peajes: 0,
      viaticos: 0,
    },
    detallesAdicionales: '',
    horaInicio: new Date(),
    estado: 'EN_CURSO' as const,
  });

  useEffect(() => {
    cargarViajes();
  }, []);

  const cargarViajes = async () => {
    try {
      setLoading(true);
      const [enCurso, culminados] = await Promise.all([
        transporteService.obtenerViajesEnCurso(),
        transporteService.obtenerViajesCulminados(),
      ]);
      setViajesEnCurso(enCurso);
      setViajesCulminados(culminados);
    } catch (error) {
      console.error('Error al cargar viajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const viajeData = {
        ...formData,
        horaInicio: new Date().toISOString(),
        gastos: {
          diesel: Number(formData.gastos.diesel) || 0,
          peajes: Number(formData.gastos.peajes) || 0,
          viaticos: Number(formData.gastos.viaticos) || 0,
        },
        animales: formData.animales.map(animal => ({
          ...animal,
          cantidad: Number(animal.cantidad) || 0
        })),
        suministros: formData.suministros.map(suministro => ({
          ...suministro,
          cantidad: Number(suministro.cantidad) || 0
        }))
      };
      await transporteService.crearViaje(viajeData);
      setShowForm(false);
      cargarViajes();
      // Resetear formulario
      setFormData({
        camionero: '',
        origen: '',
        destino: '',
        tipoCarga: 'ANIMALES',
        animales: [],
        suministros: [],
        gastos: {
          diesel: 0,
          peajes: 0,
          viaticos: 0,
        },
        detallesAdicionales: '',
        horaInicio: new Date(),
        estado: 'EN_CURSO',
      });
    } catch (error) {
      console.error('Error al crear viaje:', error);
    }
  };

  const handleCompletarViaje = async (viaje: ViajeTransporte) => {
    setSelectedViaje(viaje);
    setShowCompletionDialog(true);
  };

  const handleConfirmarCompletar = async () => {
    if (!selectedViaje) return;

    try {
      await transporteService.actualizarViaje(selectedViaje.id!, {
        estado: 'CULMINADO',
        horaCulminacion: new Date().toISOString(),
        detallesAdicionales: completionDetails,
      });
      setShowCompletionDialog(false);
      setCompletionDetails('');
      setSelectedViaje(null);
      cargarViajes();
    } catch (error) {
      console.error('Error al completar viaje:', error);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calcularDuracion = (inicio: Date | string, fin: Date | string) => {
    const start = new Date(inicio);
    const end = new Date(fin);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  const agregarAnimal = () => {
    setFormData(prev => ({
      ...prev,
      animales: [...prev.animales, { tipo: 'MACHO_CEBA', cantidad: 0 }],
    }));
  };

  const agregarSuministro = () => {
    setFormData(prev => ({
      ...prev,
      suministros: [...prev.suministros, { descripcion: '', cantidad: 0, unidad: '' }],
    }));
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center p-6 font-rio"
      style={{
        backgroundImage: "url('/assets/images/camionero.png')",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-rio text-green-900">
            GESTIÓN DE TRANSPORTES
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl transition-colors duration-300 shadow-md"
            >
              <Home size={20} />
              Regresar a Home
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("idToken");
                navigate("/login");
              }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition-colors duration-300 shadow-md"
            >
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Botón para mostrar formulario */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors duration-300 shadow-md"
          >
            <Plus size={20} />
            Nuevo Viaje
          </button>
        )}

        {/* Formulario de nuevo viaje */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-4">Nuevo Viaje</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Camionero</label>
                  <input
                    type="text"
                    value={formData.camionero}
                    onChange={e => setFormData(prev => ({ ...prev, camionero: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Origen</label>
                  <input
                    type="text"
                    value={formData.origen}
                    onChange={e => setFormData(prev => ({ ...prev, origen: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destino</label>
                  <input
                    type="text"
                    value={formData.destino}
                    onChange={e => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Carga</label>
                  <select
                    value={formData.tipoCarga}
                    onChange={e => setFormData(prev => ({ ...prev, tipoCarga: e.target.value as TipoCarga }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="ANIMALES">Animales</option>
                    <option value="SUMINISTROS">Suministros</option>
                  </select>
                </div>
              </div>

              {/* Carga de animales */}
              {formData.tipoCarga === 'ANIMALES' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Animales a Transportar</h3>
                    <button
                      type="button"
                      onClick={agregarAnimal}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={16} />
                      Agregar Animal
                    </button>
                  </div>
                  {formData.animales.map((animal, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <select
                        value={animal.tipo}
                        onChange={e => {
                          const newAnimales = [...formData.animales];
                          newAnimales[index].tipo = e.target.value as TipoAnimal;
                          setFormData(prev => ({ ...prev, animales: newAnimales }));
                        }}
                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      >
                        {TIPOS_ANIMALES.map(tipo => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={animal.cantidad}
                        onChange={e => {
                          const newAnimales = [...formData.animales];
                          newAnimales[index].cantidad = parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, animales: newAnimales }));
                        }}
                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        min="0"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Carga de suministros */}
              {formData.tipoCarga === 'SUMINISTROS' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Suministros a Transportar</h3>
                    <button
                      type="button"
                      onClick={agregarSuministro}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                    >
                      <Plus size={16} />
                      Agregar Suministro
                    </button>
                  </div>
                  {formData.suministros.map((suministro, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={suministro.descripcion}
                        onChange={e => {
                          const newSuministros = [...formData.suministros];
                          newSuministros[index].descripcion = e.target.value;
                          setFormData(prev => ({ ...prev, suministros: newSuministros }));
                        }}
                        placeholder="Descripción"
                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        required
                      />
                      <input
                        type="number"
                        value={suministro.cantidad}
                        onChange={e => {
                          const newSuministros = [...formData.suministros];
                          newSuministros[index].cantidad = parseInt(e.target.value);
                          setFormData(prev => ({ ...prev, suministros: newSuministros }));
                        }}
                        placeholder="Cantidad"
                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        min="0"
                        required
                      />
                      <input
                        type="text"
                        value={suministro.unidad}
                        onChange={e => {
                          const newSuministros = [...formData.suministros];
                          newSuministros[index].unidad = e.target.value;
                          setFormData(prev => ({ ...prev, suministros: newSuministros }));
                        }}
                        placeholder="Unidad"
                        className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Gastos */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Gastos del Viaje</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diesel</label>
                    <input
                      type="number"
                      value={formData.gastos.diesel}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        gastos: { ...prev.gastos, diesel: parseInt(e.target.value) }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Peajes</label>
                    <input
                      type="number"
                      value={formData.gastos.peajes}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        gastos: { ...prev.gastos, peajes: parseInt(e.target.value) }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Viáticos</label>
                    <input
                      type="number"
                      value={formData.gastos.viaticos}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        gastos: { ...prev.gastos, viaticos: parseInt(e.target.value) }
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Detalles Adicionales</label>
                <textarea
                  value={formData.detallesAdicionales}
                  onChange={e => setFormData(prev => ({ ...prev, detallesAdicionales: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  rows={3}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Crear Viaje
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de viajes en curso */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <Clock className="text-yellow-600" />
            Viajes en Curso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viajesEnCurso.map((viaje) => (
              <div key={viaje.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{viaje.camionero}</h3>
                    <p className="text-sm text-gray-600">
                      {viaje.origen} → {viaje.destino}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    En Curso
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <Clock className="inline-block w-4 h-4 mr-1" />
                    Inicio: {formatDate(viaje.horaInicio)}
                  </p>
                  <p className="text-sm">
                    <Truck className="inline-block w-4 h-4 mr-1" />
                    Carga: {viaje.tipoCarga}
                  </p>
                  <p className="text-sm">
                    <DollarSign className="inline-block w-4 h-4 mr-1" />
                    Gastos: ${viaje.gastos.diesel + viaje.gastos.peajes + viaje.gastos.viaticos}
                  </p>
                </div>
                <button
                  onClick={() => handleCompletarViaje(viaje)}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Marcar como Completado
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de viajes culminados */}
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" />
            Viajes Culminados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viajesCulminados.map((viaje) => (
              <div key={viaje.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">{viaje.camionero}</h3>
                    <p className="text-sm text-gray-600">
                      {viaje.origen} → {viaje.destino}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Completado
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm">
                    <Clock className="inline-block w-4 h-4 mr-1" />
                    Inicio: {formatDate(viaje.horaInicio)}
                  </p>
                  {viaje.horaCulminacion && (
                    <p className="text-sm">
                      <Calendar className="inline-block w-4 h-4 mr-1" />
                      Fin: {formatDate(viaje.horaCulminacion)}
                    </p>
                  )}
                  <p className="text-sm">
                    <Truck className="inline-block w-4 h-4 mr-1" />
                    Carga: {viaje.tipoCarga}
                  </p>
                  <p className="text-sm">
                    <DollarSign className="inline-block w-4 h-4 mr-1" />
                    Gastos: ${viaje.gastos.diesel + viaje.gastos.peajes + viaje.gastos.viaticos}
                  </p>
                  {viaje.horaCulminacion && (
                    <p className="text-sm">
                      Duración: {calcularDuracion(viaje.horaInicio, viaje.horaCulminacion)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog para completar viaje */}
      <Dialog
        open={showCompletionDialog}
        onClose={() => setShowCompletionDialog(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Completar Viaje
            </Dialog.Title>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detalles de Finalización
              </label>
              <textarea
                value={completionDetails}
                onChange={(e) => setCompletionDetails(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Ingrese detalles relevantes sobre el viaje..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCompletionDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarCompletar}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CamionerosScreen; 