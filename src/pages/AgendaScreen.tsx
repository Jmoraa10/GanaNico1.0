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
    detallesTexto: '',
    fechaVencimiento: '',
  });
  const [fechaPrellenada, setFechaPrellenada] = useState<string | null>(null);
  const [errorForm, setErrorForm] = useState<string>('');
  const [eventosPendientes, setEventosPendientes] = useState<EventoAgenda[]>([]);
  const [eventosCumplidos, setEventosCumplidos] = useState<EventoAgenda[]>([]);
  const printRef = useRef<HTMLDivElement>(null);
  const printRefCumplidos = useRef<HTMLDivElement>(null);
  const [cumplirEventoId, setCumplirEventoId] = useState<string | null>(null);
  const [cumplirRegistradoPor, setCumplirRegistradoPor] = useState('');
  const [cumplirDetalles, setCumplirDetalles] = useState('');
  const [cumplirError, setCumplirError] = useState('');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoAgenda | null>(null);
  const [isModalDetallesOpen, setIsModalDetallesOpen] = useState(false);

  useEffect(() => {
    cargarEventosMes();
    cargarEventosPendientes();
    cargarEventosCumplidos();
  }, [currentDate]);

  const cargarEventosMes = async () => {
    const eventos = await agendaService.getEventosPorMes(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1
    );
    setEventos(eventos);
    console.log('EVENTOS DEL MES:', eventos);
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

  const cargarEventosCumplidos = async () => {
    const cumplidos = await agendaService.getEventosCumplidos();
    setEventosCumplidos(cumplidos);
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
    if (!nuevoEvento.fecha || !nuevoEvento.tipo || !nuevoEvento.detallesTexto || !nuevoEvento.lugar) {
      setErrorForm(`Faltan datos requeridos: Fecha (${nuevoEvento.fecha}), Tipo (${nuevoEvento.tipo}), Detalles (${nuevoEvento.detallesTexto}), Lugar (${nuevoEvento.lugar})`);
      return;
    }
    setErrorForm('');
    try {
      const eventoAEnviar = {
        fecha: nuevoEvento.fecha,
        tipo: nuevoEvento.tipo,
        descripcion: nuevoEvento.detallesTexto,
        lugar: nuevoEvento.lugar,
        detallesTexto: nuevoEvento.detallesTexto,
        fechaVencimiento: nuevoEvento.fechaVencimiento ? nuevoEvento.fechaVencimiento : undefined,
      };
      await agendaService.crearEvento(eventoAEnviar);
      setIsNuevoEventoOpen(false);
      cargarEventosMes();
      setNuevoEvento({
        fecha: '',
        tipo: 'otros',
        descripcion: '',
        lugar: '',
        detallesTexto: '',
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
    const eventosDelDia = eventos.filter(evento => evento.fecha === fecha);
    console.log('FECHA:', fecha, 'EVENTOS DEL DIA:', eventosDelDia);
    return eventosDelDia;
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

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Eventos por Vencerse - Inversiones Bonito Viento SAS</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
              .logo { height: 60px; }
              .empresa { font-size: 2rem; font-weight: bold; color: #14532d; }
              .fecha { font-size: 1rem; color: #555; }
              .evento { border-bottom: 1px solid #ccc; padding: 12px 0; }
              .evento:last-child { border-bottom: none; }
              .titulo { font-size: 1.1rem; font-weight: bold; color: #222; }
              .vencimiento { color: #b91c1c; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/assets/images/logo.png" class="logo" alt="Logo" />
              <div class="empresa">INVERSIONES BONITO VIENTO SAS</div>
              <div class="fecha">${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
            </div>
            <h2 style="font-size:1.5rem; color:#b45309; margin-bottom:20px;">Eventos por Vencerse</h2>
            <div>${printContents}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handlePrintCumplidos = () => {
    if (!printRefCumplidos.current) return;
    const printContents = printRefCumplidos.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=1000');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Eventos Cumplidos - Inversiones Bonito Viento SAS</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
              .logo { height: 60px; }
              .empresa { font-size: 2rem; font-weight: bold; color: #14532d; }
              .fecha { font-size: 1rem; color: #555; }
              .evento { border-bottom: 1px solid #ccc; padding: 12px 0; }
              .evento:last-child { border-bottom: none; }
              .titulo { font-size: 1.1rem; font-weight: bold; color: #222; }
              .cumplido { color: #15803d; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/assets/images/logo.png" class="logo" alt="Logo" />
              <div class="empresa">INVERSIONES BONITO VIENTO SAS</div>
              <div class="fecha">${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
            </div>
            <h2 style="font-size:1.5rem; color:#15803d; margin-bottom:20px;">Eventos Cumplidos</h2>
            <div>${printContents}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  // Función para obtener la descripción corta de un evento
  const getDescripcionCorta = (evento: EventoAgenda): string => {
    if (typeof evento.descripcion === 'string' && evento.descripcion.trim() !== '') return evento.descripcion;
    if (typeof evento.detallesTexto === 'string' && evento.detallesTexto.trim() !== '') return evento.detallesTexto;
    if (typeof evento.detalles === 'object' && evento.detalles !== null && Object.keys(evento.detalles).length > 0) return JSON.stringify(evento.detalles);
    return 'Sin descripción';
  };

  const abrirModalCumplido = (eventoId: string) => {
    setCumplirEventoId(eventoId);
    setCumplirRegistradoPor('');
    setCumplirDetalles('');
    setCumplirError('');
  };

  const cerrarModalCumplido = () => {
    setCumplirEventoId(null);
    setCumplirRegistradoPor('');
    setCumplirDetalles('');
    setCumplirError('');
  };

  const guardarCumplido = async () => {
    if (!cumplirRegistradoPor.trim() || !cumplirDetalles.trim()) {
      setCumplirError('Por favor, completa todos los campos.');
      return;
    }
    try {
      
      // Actualizar el evento en el array de eventos del día seleccionado
      setEventosDiaSeleccionado(eventos => 
        eventos.map(evento => 
          evento._id === cumplirEventoId 
            ? { ...evento, estado: 'completado', registradoPor: cumplirRegistradoPor, detallesCumplimiento: cumplirDetalles }
            : evento
        )
      );

      // Actualizar el evento en el array de eventos del mes
      setEventos(eventos => 
        eventos.map(evento => 
          evento._id === cumplirEventoId 
            ? { ...evento, estado: 'completado', registradoPor: cumplirRegistradoPor, detallesCumplimiento: cumplirDetalles }
            : evento
        )
      );

      // Actualizar el evento en el array de eventos pendientes
      setEventosPendientes(eventos => 
        eventos.filter(evento => evento._id !== cumplirEventoId)
      );

      cerrarModalCumplido();
    } catch (error) {
      setCumplirError('Error al registrar cumplimiento.');
      console.error('Error al marcar evento como cumplido:', error);
    }
  };

  const abrirModalDetalles = (evento: EventoAgenda) => {
    setEventoSeleccionado(evento);
    setIsModalDetallesOpen(true);
  };

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
                      {getEventosDelDia(dia).length === 0 && (
                        <div className="text-xs text-gray-400 italic">Sin eventos</div>
                      )}
                      {getEventosDelDia(dia).slice(0, 2).map((evento, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded ${evento.estado === 'completado' ? 'bg-green-500' : getColorTipo(evento.tipo)} text-white truncate flex items-center`}
                          title={getDescripcionCorta(evento)}
                        >
                          {evento.estado === 'completado' && (
                            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {getDescripcionCorta(evento)}
                        </div>
                      ))}
                      {getEventosDelDia(dia).length > 2 && (
                        <div className="text-xs text-gray-500">+{getEventosDelDia(dia).length - 2} más...</div>
                      )}
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
            <button
              onClick={handlePrint}
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-semibold shadow-md"
            >
              Imprimir
            </button>
          </div>
          <div ref={printRef}>
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
                  const alerta = diasRestantes !== null && diasRestantes <= 3 && evento.estado !== 'completado';
                  return (
                    <li key={idx} className={`flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 evento ${evento.estado === 'completado' ? 'border-green-600 bg-green-50' : alerta ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'}`}>
                      <div>
                        <div className="font-semibold text-lg text-gray-800 flex items-center titulo">
                          {getDescripcionCorta(evento)}
                          {alerta && evento.estado !== 'completado' && (
                            <span title="¡Por vencerse!">
                              <AlertTriangle className="ml-2 text-red-500 animate-bounce" />
                            </span>
                          )}
                          {evento.estado === 'completado' && (
                            <span className="ml-2 text-green-700 font-bold">Cumplido</span>
                          )}
                        </div>
                        <div className="text-gray-600 text-sm">Lugar: {evento.lugar}</div>
                        <div className="text-gray-600 text-sm">Tipo: {evento.tipo}</div>
                      </div>
                      <div className="mt-2 md:mt-0 text-right">
                        <div className="text-gray-700 font-bold vencimiento">
                          {evento.fechaVencimiento && evento.fechaVencimiento !== 'sin vencimiento'
                            ? `Vence: ${new Date(evento.fechaVencimiento).toLocaleDateString('es-ES')}`
                            : 'Sin vencimiento'}
                        </div>
                        {diasRestantes !== null && (
                          <div className={`text-sm font-semibold ${alerta && evento.estado !== 'completado' ? 'text-red-600' : 'text-green-700'}`}>
                            {diasRestantes > 0
                              ? `Faltan ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`
                              : diasRestantes === 0
                              ? '¡Vence hoy!'
                              : 'Vencido'}
                          </div>
                        )}
                        {evento.estado !== 'completado' && (
                          <button
                            onClick={() => abrirModalCumplido(evento._id!)}
                            className="mt-2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                          >
                            Cumplido
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-10 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Eventos Cumplidos
            </h2>
            <button
              onClick={handlePrintCumplidos}
              className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition-colors font-semibold shadow-md"
            >
              Imprimir
            </button>
          </div>
          <div ref={printRefCumplidos}>
            {eventosCumplidos.length === 0 ? (
              <p className="text-gray-500">No hay eventos cumplidos.</p>
            ) : (
              <ul className="space-y-4">
                {eventosCumplidos.map((evento, idx) => (
                  <li key={idx} className="flex flex-col md:flex-row md:items-center justify-between border border-green-200 rounded-lg p-4 bg-green-50">
                    <div>
                      <div className="font-semibold text-lg text-gray-800 flex items-center titulo">
                        {getDescripcionCorta(evento)}
                        <span className="ml-2 text-green-700 font-bold">Cumplido</span>
                      </div>
                      <div className="text-gray-600 text-sm">Lugar: {evento.lugar}</div>
                      <div className="text-gray-600 text-sm">Tipo: {evento.tipo}</div>
                      <div className="text-green-700 text-sm mt-1">
                        <span className="font-semibold">Registrado por:</span> {evento.registradoPor}
                      </div>
                      <div className="text-green-700 text-sm">
                        <span className="font-semibold">Detalles del cumplimiento:</span> {evento.detallesCumplimiento}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 flex space-x-2">
                      <button
                        onClick={() => abrirModalDetalles(evento)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                      >
                        Detalles
                      </button>
                      <button
                        onClick={() => {
                          const printWindow = window.open('', '', 'height=800,width=1000');
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>Detalles del Evento - Inversiones Bonito Viento SAS</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; margin: 40px; }
                                    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
                                    .logo { height: 60px; }
                                    .empresa { font-size: 2rem; font-weight: bold; color: #14532d; }
                                    .fecha { font-size: 1rem; color: #555; }
                                    .evento { border: 1px solid #ccc; padding: 20px; border-radius: 8px; }
                                    .titulo { font-size: 1.2rem; font-weight: bold; color: #222; margin-bottom: 16px; }
                                    .campo { margin-bottom: 8px; }
                                    .label { font-weight: bold; color: #555; }
                                    .valor { color: #222; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <img src="/assets/images/logo.png" class="logo" alt="Logo" />
                                    <div class="empresa">INVERSIONES BONITO VIENTO SAS</div>
                                    <div class="fecha">${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                                  </div>
                                  <div class="evento">
                                    <div class="titulo">Detalles del Evento Cumplido</div>
                                    <div class="campo">
                                      <span class="label">Descripción:</span>
                                      <span class="valor"> ${evento.descripcion}</span>
                                    </div>
                                    <div class="campo">
                                      <span class="label">Tipo:</span>
                                      <span class="valor"> ${evento.tipo}</span>
                                    </div>
                                    <div class="campo">
                                      <span class="label">Lugar:</span>
                                      <span class="valor"> ${evento.lugar}</span>
                                    </div>
                                    <div class="campo">
                                      <span class="label">Fecha:</span>
                                      <span class="valor"> ${new Date(evento.fecha).toLocaleDateString('es-ES')}</span>
                                    </div>
                                    <div class="campo">
                                      <span class="label">Registrado por:</span>
                                      <span class="valor"> ${evento.registradoPor}</span>
                                    </div>
                                    <div class="campo">
                                      <span class="label">Detalles del cumplimiento:</span>
                                      <span class="valor"> ${evento.detallesCumplimiento}</span>
                                    </div>
                                  </div>
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                            printWindow.focus();
                            setTimeout(() => {
                              printWindow.print();
                              printWindow.close();
                            }, 500);
                          }
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                      >
                        Imprimir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
                <div key={index} className={`border rounded-lg p-4 ${evento.estado === 'completado' ? 'bg-green-50 border-green-200' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-sm text-white ${getColorTipo(evento.tipo)}`}>
                      {evento.tipo}
                    </span>
                    {evento.estado === 'completado' && (
                      <span className="text-sm text-green-600 font-semibold flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Cumplido
                      </span>
                    )}
                    {evento.fechaVencimiento && evento.estado !== 'completado' && (
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
                  {evento.estado === 'completado' && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-sm text-green-700">
                        <span className="font-semibold">Registrado por:</span> {evento.registradoPor}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        <span className="font-semibold">Detalles del cumplimiento:</span> {evento.detallesCumplimiento}
                      </p>
                    </div>
                  )}
                  {evento.estado !== 'completado' && (
                    <button
                      onClick={() => abrirModalCumplido(evento._id!)}
                      className="mt-3 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                    >
                      Marcar como cumplido
                    </button>
                  )}
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
                  value={nuevoEvento.detallesTexto}
                  onChange={(e) => setNuevoEvento({ ...nuevoEvento, detallesTexto: e.target.value })}
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

      {/* Modal de cumplimiento */}
      <Dialog open={!!cumplirEventoId} onClose={cerrarModalCumplido} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-2xl font-bold mb-4">Registrar Cumplimiento</Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Registrado por</label>
                <input
                  type="text"
                  value={cumplirRegistradoPor}
                  onChange={e => setCumplirRegistradoPor(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Detalles del cumplimiento</label>
                <textarea
                  value={cumplirDetalles}
                  onChange={e => setCumplirDetalles(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              {cumplirError && <div className="text-red-600 text-center font-semibold">{cumplirError}</div>}
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={cerrarModalCumplido}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCumplido}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Modal de detalles del evento */}
      <Dialog
        open={isModalDetallesOpen}
        onClose={() => setIsModalDetallesOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <Dialog.Title className="text-2xl font-bold mb-4">
              Detalles del Evento
            </Dialog.Title>
            {eventoSeleccionado && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-sm text-white ${getColorTipo(eventoSeleccionado.tipo)}`}>
                    {eventoSeleccionado.tipo}
                  </span>
                  <span className="text-sm text-green-600 font-semibold flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Cumplido
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{eventoSeleccionado.descripcion}</h3>
                  <p className="text-gray-600 mt-1">Lugar: {eventoSeleccionado.lugar}</p>
                  <p className="text-gray-600 mt-1">Fecha: {new Date(eventoSeleccionado.fecha).toLocaleDateString('es-ES')}</p>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-green-700">
                      <span className="font-semibold">Registrado por:</span> {eventoSeleccionado.registradoPor}
                    </p>
                    <p className="text-green-700 mt-1">
                      <span className="font-semibold">Detalles del cumplimiento:</span> {eventoSeleccionado.detallesCumplimiento}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalDetallesOpen(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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

export default AgendaScreen; 