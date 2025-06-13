import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Home, LogOut, Plus, CheckCircle, Clock, Truck, DollarSign, Calendar, MapPin } from "lucide-react";
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

export const CamionerosScreen = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [viajesEnCurso, setViajesEnCurso] = useState<ViajeTransporte[]>([]);
  const [viajesCulminados, setViajesCulminados] = useState<ViajeTransporte[]>([]);
  const [, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [isFinalizarDialogOpen, setIsFinalizarDialogOpen] = useState(false);
  const [viajeSeleccionado, setViajeSeleccionado] = useState<ViajeTransporte | null>(null);
  const [detallesFinalizacion, setDetallesFinalizacion] = useState('');
  const [isDetallesDialogOpen, setIsDetallesDialogOpen] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    camionero: '',
    placaCamion: '',
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
      setIsLoading(true);
      const [enCurso, culminados] = await Promise.all([
        transporteService.obtenerViajesEnCurso(),
        transporteService.obtenerViajesCulminados()
      ]);
      setViajesEnCurso(enCurso);
      setViajesCulminados(culminados);
      setError(null);
    } catch (err) {
      setError('Error al cargar los viajes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await transporteService.crearViaje(formData);
      setShowForm(false);
      cargarViajes();
      // Resetear formulario
      setFormData({
        camionero: '',
        placaCamion: '',
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

  const handleFinalizarViaje = async (viaje: ViajeTransporte) => {
    console.log('Viaje seleccionado:', viaje);
    if (!viaje._id) {
      console.error('El viaje no tiene ID:', viaje);
      return;
    }
    setViajeSeleccionado(viaje);
    setIsFinalizarDialogOpen(true);
  };

  const confirmarFinalizacion = async () => {
    if (!viajeSeleccionado || !viajeSeleccionado._id) {
      console.error('No se ha seleccionado un viaje o el ID es inválido');
      return;
    }

    try {
      const datosActualizacion = {
        estado: 'CULMINADO' as const,
        detallesFinalizacion,
        horaCulminacion: new Date()
      };
      
      console.log('Actualizando viaje con datos:', datosActualizacion);
      await transporteService.actualizarViaje(viajeSeleccionado._id, datosActualizacion);
      await cargarViajes();
      setIsFinalizarDialogOpen(false);
      setDetallesFinalizacion('');
      setViajeSeleccionado(null);
    } catch (err) {
      console.error('Error al finalizar el viaje:', err);
      setError('Error al finalizar el viaje');
    }
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

  const formatearFecha = (fecha: Date) => {
    const opciones: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota'
    };
    return new Date(fecha).toLocaleString('es-CO', opciones);
  };

  const formatearDuracion = (inicio: Date, fin: Date) => {
    const duracion = Math.round((new Date(fin).getTime() - new Date(inicio).getTime()) / (1000 * 60));
    const horas = Math.floor(duracion / 60);
    const minutos = duracion % 60;
    return `${horas}h ${minutos}m`;
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
                  <label className="block text-sm font-medium text-gray-700">Placa del Camión</label>
                  <input
                    type="text"
                    value={formData.placaCamion}
                    onChange={e => setFormData(prev => ({ ...prev, placaCamion: e.target.value }))}
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
            {viajesEnCurso.map(viaje => (
              <div key={viaje._id} className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{viaje.camionero}</h3>
                    <p className="text-gray-600">Placa: {viaje.placaCamion}</p>
                    <p className="text-gray-600">{viaje.origen} → {viaje.destino}</p>
                  </div>
                  <button
                    onClick={() => handleFinalizarViaje(viaje)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    <CheckCircle size={20} />
                    <span>Culminar Viaje</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2">
                    <Truck size={16} className="text-blue-600" />
                    {viaje.tipoCarga === 'ANIMALES' ? 'Transporte de Animales' : 'Transporte de Suministros'}
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    Total Gastos: ${viaje.gastos.diesel + viaje.gastos.peajes + viaje.gastos.viaticos}
                  </p>
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-purple-600 mt-1" />
                    <div>
                      <p className="font-medium">Inicio:</p>
                      <p className="text-sm text-gray-600">{formatearFecha(viaje.horaInicio)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-red-600 mt-1" />
                    <div>
                      <p className="font-medium">Ruta:</p>
                      <p className="text-sm text-gray-600">{viaje.origen} → {viaje.destino}</p>
                    </div>
                  </div>
                  {viaje.detallesAdicionales && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-700">Detalles Adicionales:</p>
                      <p className="text-sm text-gray-600">{viaje.detallesAdicionales}</p>
                    </div>
                  )}
                </div>
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
            {viajesCulminados.map(viaje => (
              <div 
                key={viaje._id} 
                className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow duration-300"
                onClick={() => {
                  setViajeSeleccionado(viaje);
                  setIsDetallesDialogOpen(true);
                }}
              >
                <div className="mb-2">
                  <h3 className="font-bold text-lg">{viaje.camionero}</h3>
                  <p className="text-gray-600">Placa: {viaje.placaCamion}</p>
                  <p className="text-gray-600">{viaje.origen} → {viaje.destino}</p>
                  <p className="text-gray-600">
                    {viaje.tipoCarga === 'ANIMALES' ? 'Transporte de Animales' : 'Transporte de Suministros'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diálogo de Finalización */}
      <Dialog
        open={isFinalizarDialogOpen}
        onClose={() => setIsFinalizarDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Finalizar Viaje
            </Dialog.Title>

            <div className="mt-2">
              <label htmlFor="detalles" className="block text-sm font-medium text-gray-700">
                Detalles de Finalización
              </label>
              <textarea
                id="detalles"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={detallesFinalizacion}
                onChange={(e) => setDetallesFinalizacion(e.target.value)}
                placeholder="Ingrese detalles relevantes sobre el viaje..."
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsFinalizarDialogOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={confirmarFinalizacion}
              >
                Confirmar Finalización
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Diálogo de Detalles del Viaje */}
      <Dialog
        open={isDetallesDialogOpen}
        onClose={() => setIsDetallesDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              Detalles del Viaje
            </Dialog.Title>

            {viajeSeleccionado && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Camionero</p>
                    <p className="text-gray-600">{viajeSeleccionado.camionero}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Placa del Camión</p>
                    <p className="text-gray-600">{viajeSeleccionado.placaCamion}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Origen</p>
                    <p className="text-gray-600">{viajeSeleccionado.origen}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Destino</p>
                    <p className="text-gray-600">{viajeSeleccionado.destino}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700">Tipo de Carga</p>
                  <p className="text-gray-600">
                    {viajeSeleccionado.tipoCarga === 'ANIMALES' ? 'Transporte de Animales' : 'Transporte de Suministros'}
                  </p>
                </div>

                {viajeSeleccionado.tipoCarga === 'ANIMALES' && viajeSeleccionado.animales && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Animales Transportados</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {viajeSeleccionado.animales.map((animal, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span className="text-gray-600">{TIPOS_ANIMALES.find(t => t.value === animal.tipo)?.label}</span>
                          <span className="font-medium text-gray-700">{animal.cantidad}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viajeSeleccionado.tipoCarga === 'SUMINISTROS' && viajeSeleccionado.suministros && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Suministros Transportados</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {viajeSeleccionado.suministros.map((suministro, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span className="text-gray-600">{suministro.descripcion}</span>
                          <span className="font-medium text-gray-700">
                            {suministro.cantidad} {suministro.unidad}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="font-medium text-gray-700 mb-2">Gastos</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Diesel</span>
                      <span className="font-medium text-gray-700">${viajeSeleccionado.gastos.diesel}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Peajes</span>
                      <span className="font-medium text-gray-700">${viajeSeleccionado.gastos.peajes}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Viáticos</span>
                      <span className="font-medium text-gray-700">${viajeSeleccionado.gastos.viaticos}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-t border-gray-200 mt-2 pt-2">
                      <span className="font-medium text-gray-700">Total</span>
                      <span className="font-bold text-gray-900">
                        ${viajeSeleccionado.gastos.diesel + viajeSeleccionado.gastos.peajes + viajeSeleccionado.gastos.viaticos}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-gray-700 mb-2">Tiempos</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Inicio</span>
                      <span className="font-medium text-gray-700">{formatearFecha(viajeSeleccionado.horaInicio)}</span>
                    </div>
                    {viajeSeleccionado.horaCulminacion && (
                      <>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600">Culminación</span>
                          <span className="font-medium text-gray-700">{formatearFecha(viajeSeleccionado.horaCulminacion)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600">Duración</span>
                          <span className="font-medium text-gray-700">
                            {formatearDuracion(viajeSeleccionado.horaInicio, viajeSeleccionado.horaCulminacion)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {viajeSeleccionado.detallesAdicionales && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Detalles Adicionales</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600">{viajeSeleccionado.detallesAdicionales}</p>
                    </div>
                  </div>
                )}

                {viajeSeleccionado.detallesFinalizacion && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Detalles de Finalización</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600">{viajeSeleccionado.detallesFinalizacion}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsDetallesDialogOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}; 