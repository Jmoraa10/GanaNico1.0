import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, ChevronLeft, ChevronRight, Plus, AlertTriangle } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { agendaService, EventoAgenda, NuevoEvento } from '../services/agendaService';

const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const AgendaScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventos, setEventos] = useState<EventoAgenda[]>([]);
  const [eventosDiaSeleccionado, setEventosDiaSeleccionado] = useState<EventoAgenda[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNuevoEventoOpen, setIsNuevoEventoOpen] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>('');
  const [nuevoEvento, setNuevoEvento] = useState<NuevoEvento>({
    fecha: '',
    tipo: 'otros',
    descripcion: '',
    lugar: '',
    detalles: '',
    fechaVencimiento: '',
  });
  const [fechaPrellenada, setFechaPrellenada] = useState<string | null>(null);
  const [errorForm, setErrorForm] = useState<string>('');
  const [eventosPendientes, setEventosPendientes] = useState<EventoAgenda[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  useEffect(() => {
    cargarEventosMes();
    cargarEventosPendientes();
  }, [currentDate]);

  const cargarEventosMes = async () => {
    const eventos = await agendaService.getEventosPorMes(
      currentDate.getMonth() + 1,
      currentDate.getFullYear()
    );
    setEventos(eventos);
  };

  const cargarEventosDia = async (fecha: string) => {
    const eventos = await agendaService.getEventosPorDia(fecha);
    setEventosDiaSeleccionado(eventos);
    setIsModalOpen(true);
  };

  const cargarEventosPendientes = async () => {
    const pendientes = await agendaService.getEventosPendientes();
    setEventosPendientes(pendientes);
  };

  const cambiarMes = (incremento: number) => {
    const nuevaFecha = new Date(currentDate);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
    setCurrentDate(nuevaFecha);
  };

  // Genera los días del mes, alineando el lunes como primer día de la semana
  const getDiasDelMes = () => {
    const año = currentDate.getFullYear();
    const mes = currentDate.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const dias = [];
    // Ajuste: getDay() devuelve 0 para domingo, 1 para lunes, etc.
    // Queremos que lunes sea el primer día (índice 0)
    let primerDiaSemana = primerDia.getDay();
    if (primerDiaSemana === 0) primerDiaSemana = 7; // domingo pasa a 7
    // Añadir días vacíos al principio (para alinear lunes como primer día)
    for (let i = 1; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    // Añadir los días del mes
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(dia);
    }
    return dias;
  };

  // Al hacer clic en un día, calcula la fecha correctamente y abre el modal
  const handleDiaClick = (dia: number) => {
    if (!dia) return;
    const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setDiaSeleccionado(fecha);
    setFechaPrellenada(fecha);
    cargarEventosDia(fecha);
  };

  const handleNuevoEvento = async () => {
    console.log('DEBUG nuevoEvento:', nuevoEvento);
    // Validación de campos requeridos
    if (!nuevoEvento.fecha || !nuevoEvento.tipo || !nuevoEvento.detalles || !nuevoEvento.lugar) {
      setErrorForm(`Faltan datos requeridos: Fecha (${nuevoEvento.fecha}), Tipo (${nuevoEvento.tipo}), Detalles (${nuevoEvento.detalles}), Lugar (${nuevoEvento.lugar})`);
      return;
    }
    setErrorForm('');
    try {
      const eventoAEnviar = {
        ...nuevoEvento,
        descripcion: nuevoEvento.detalles,
        fechaVencimiento: nuevoEvento.fechaVencimiento ? nuevoEvento.fechaVencimiento : 'sin vencimiento',
      };
      await agendaService.crearEvento(eventoAEnviar);
      setIsNuevoEventoOpen(false);
      cargarEventosMes();
      setNuevoEvento({
        fecha: '',
        tipo: 'otros',
        descripcion: '',
        lugar: '',
        detalles: '',
        fechaVencimiento: '',
      });
    } catch (error) {
      setErrorForm('Error al crear evento. Intenta nuevamente.');
      console.error('Error al crear evento:', error);
    }
  };

  const getEventosDelDia = (dia: number) => {
    if (!dia) return [];
    const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    // Comparar solo la parte de la fecha (YYYY-MM-DD)
    return eventos.filter(evento => (evento.fecha || '').slice(0, 10) === fecha);
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'finca':
        return 'bg-green-500';
      case 'bodega':
        return 'bg-blue-500';
      case 'venta':
        return 'bg-yellow-500';
      case 'subasta':
        return 'bg-purple-500';
      case 'compra':
        return 'bg-orange-500';
      case 'deuda':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex flex-col justify-between font-rio"
      style={{
        backgroundImage: "url('/assets/images/calendario.png')",
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(255,255,255,0.3)',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Inicio
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
          <button
            onClick={() => setIsNuevoEventoOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Agendamiento
          </button>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Agenda</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => cambiarMes(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-xl font-semibold">
                {currentDate.toLocaleString('es', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => cambiarMes(1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
            {diasSemana.map((dia) => (
              <div key={dia} className="text-center font-semibold text-gray-600 py-2">
                {dia}
              </div>
            ))}
            {getDiasDelMes().map((dia, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border rounded-lg ${
                  dia ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                }`}
                onClick={() => dia && handleDiaClick(dia)}
              >
                {dia && (
                  <>
                    <div className="font-semibold mb-2 flex items-center justify-between">
                      <span>{dia}</span>
                      {getEventosDelDia(dia).length > 0 && (
                        <span className="ml-2 bg-green-700 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow-md">
                          {getEventosDelDia(dia).length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {getEventosDelDia(dia).map((evento, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded ${getColorTipo(evento.tipo)} text-white truncate flex items-center`}
                          title={evento.descripcion}
                        >
                          {evento.descripcion}
                          {evento.estado === 'pendiente' && evento.fechaVencimiento && evento.fechaVencimiento >= hoy && (
                            <span className="ml-2 inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Evento pendiente con vencimiento"></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <AlertTriangle className="text-yellow-500 mr-2" /> Eventos por vencerse
            </h2>
            {eventosPendientes.length > 0 && (
              <button
                onClick={() => setShowPrintPreview(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
              >
                Imprimir
              </button>
            )}
          </div>
          {eventosPendientes.length === 0 ? (
            <p className="text-gray-500">No hay eventos pendientes por vencerse.</p>
          ) : (
            <ul className="space-y-4">
              {eventosPendientes.map((evento, idx) => {
                let diasRestantes = null;
                if (evento.fechaVencimiento && evento.fechaVencimiento !== 'sin vencimiento') {
                  const hoyDate = new Date();
                  const vencimientoDate = new Date(evento.fechaVencimiento);
                  diasRestantes = Math.ceil((vencimientoDate.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24));
                }
                const alerta = diasRestantes !== null && diasRestantes <= 3;
                return (
                  <li key={idx} className={`flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 ${alerta ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                    <div>
                      <div className="font-semibold text-lg text-gray-800 flex items-center">
                        {evento.descripcion || evento.detallesTexto}
                        {alerta && (
                          <span title="¡Por vencerse!">
                            <AlertTriangle className="ml-2 text-red-500 animate-bounce" />
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 text-sm">Lugar: {evento.lugar}</div>
                      <div className="text-gray-600 text-sm">Tipo: {evento.tipo}</div>
                    </div>
                    <div className="mt-2 md:mt-0 text-right">
                      <div className="text-gray-700 font-bold">
                        {evento.fechaVencimiento && evento.fechaVencimiento !== 'sin vencimiento'
                          ? `Vence: ${new Date(evento.fechaVencimiento).toLocaleDateString('es-ES')}`
                          : 'Sin vencimiento'}
                      </div>
                      {diasRestantes !== null && (
                        <div className={`text-sm font-semibold ${alerta ? 'text-red-600' : 'text-green-700'}`}>
                          {diasRestantes > 0
                            ? `Faltan ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`
                            : diasRestantes === 0
                            ? '¡Vence hoy!'
                            : 'Vencido'}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Modal de eventos del día */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <Dialog.Title className="text-2xl font-bold mb-4">
              Eventos del {diaSeleccionado ? new Date(diaSeleccionado + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
            </Dialog.Title>

            <div className="space-y-4">
              {eventosDiaSeleccionado.map((evento, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-sm text-white ${getColorTipo(evento.tipo)}`}>
                      {evento.tipo}
                    </span>
                    {evento.fechaVencimiento && (
                      <span className="text-sm text-gray-500 flex items-center">
                        Vence: {new Date(evento.fechaVencimiento).toLocaleDateString('es')}
                        {evento.estado === 'pendiente' && evento.fechaVencimiento >= hoy && (
                          <span className="ml-2 inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Evento pendiente con vencimiento"></span>
                        )}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold">{evento.descripcion}</h3>
                  <p className="text-gray-600 mt-1">{evento.lugar}</p>
                  <p className="text-gray-600 mt-1">{evento.detallesTexto}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => {
                  setIsNuevoEventoOpen(true);
                  setNuevoEvento({
                    ...nuevoEvento,
                    fecha: fechaPrellenada || diaSeleccionado,
                    tipo: nuevoEvento.tipo || 'otros',
                  });
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar evento
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Modal de nuevo evento */}
      <Dialog
        open={isNuevoEventoOpen}
        onClose={() => setIsNuevoEventoOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <Dialog.Title className="text-2xl font-bold mb-4">
              Nuevo Agendamiento
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  value={nuevoEvento.fecha}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  value={nuevoEvento.tipo}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, tipo: e.target.value as any })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="compra">Compra</option>
                  <option value="deuda">Deuda</option>
                  <option value="otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Lugar</label>
                <input
                  type="text"
                  value={nuevoEvento.lugar}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, lugar: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Detalles</label>
                <textarea
                  value={nuevoEvento.detalles}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, detalles: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento (opcional)</label>
                <input
                  type="date"
                  value={nuevoEvento.fechaVencimiento || ''}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, fechaVencimiento: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {errorForm && (
              <div className="mb-4 text-red-600 font-semibold text-center">{errorForm}</div>
            )}

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsNuevoEventoOpen(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNuevoEvento}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Evento
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Vista previa de impresión */}
      {showPrintPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-8 relative" ref={printRef}>
            <button
              onClick={() => setShowPrintPreview(false)}
              className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Cerrar
            </button>
            {/* Encabezado institucional */}
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div className="flex items-center">
                <img src="/assets/images/logo.png" alt="Logo" className="h-14 mr-4" />
                <div>
                  <h1 className="text-2xl font-bold text-green-900">INVERSIONES BONITO VIENTO SAS</h1>
                  <div className="text-gray-700 font-semibold">Reporte de eventos por vencerse</div>
                </div>
              </div>
              <div className="text-right text-gray-600 font-semibold">
                Fecha: {new Date().toLocaleDateString('es-ES')}
              </div>
            </div>
            {/* Lista de eventos */}
            <ul className="space-y-4">
              {eventosPendientes.map((evento, idx) => {
                let diasRestantes = null;
                if (evento.fechaVencimiento && evento.fechaVencimiento !== 'sin vencimiento') {
                  const hoyDate = new Date();
                  const vencimientoDate = new Date(evento.fechaVencimiento);
                  diasRestantes = Math.ceil((vencimientoDate.getTime() - hoyDate.getTime()) / (1000 * 60 * 60 * 24));
                }
                const alerta = diasRestantes !== null && diasRestantes <= 3;
                return (
                  <li key={idx} className={`flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 ${alerta ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                    <div>
                      <div className="font-semibold text-lg text-gray-800 flex items-center">
                        {evento.descripcion || evento.detallesTexto}
                        {alerta && (
                          <span title="¡Por vencerse!">
                            <AlertTriangle className="ml-2 text-red-500 animate-bounce" />
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600 text-sm">Lugar: {evento.lugar}</div>
                      <div className="text-gray-600 text-sm">Tipo: {evento.tipo}</div>
                    </div>
                    <div className="mt-2 md:mt-0 text-right">
                      <div className="text-gray-700 font-bold">
                        {evento.fechaVencimiento && evento.fechaVencimiento !== 'sin vencimiento'
                          ? `Vence: ${new Date(evento.fechaVencimiento).toLocaleDateString('es-ES')}`
                          : 'Sin vencimiento'}
                      </div>
                      {diasRestantes !== null && (
                        <div className={`text-sm font-semibold ${alerta ? 'text-red-600' : 'text-green-700'}`}>
                          {diasRestantes > 0
                            ? `Faltan ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`
                            : diasRestantes === 0
                            ? '¡Vence hoy!'
                            : 'Vencido'}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {/* Botón de impresión real */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  if (printRef.current) {
                    const printContents = printRef.current.innerHTML;
                    const printWindow = window.open('', '', 'height=800,width=1000');
                    if (printWindow) {
                      printWindow.document.write('<html><head><title>Imprimir reporte</title>');
                      printWindow.document.write('<link rel="stylesheet" href="/index.css" />');
                      printWindow.document.write('</head><body>');
                      printWindow.document.write(printContents);
                      printWindow.document.write('</body></html>');
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 500);
                    }
                  }
                }}
                className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 font-bold shadow-md"
              >
                Imprimir hoja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaScreen; 