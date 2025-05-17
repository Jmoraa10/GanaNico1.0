import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFincaById } from '../services/fincaService';
import { getVentasByFinca } from '../services/ventaService';
import { MovimientoGanado, MovimientoBodega, Venta } from '../types/FincaTypes';
import { Truck, Package, DollarSign, Calendar, Info, Printer } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { imprimirMovimiento } from '../utils/printUtils';

interface Props {
  fincaId: string;
  movimientos: MovimientoGanado[];
  movimientosBodega?: MovimientoBodega[];
}

type PeriodoFiltro = '1d' | '1w' | '1m' | '1y' | 'all';

const HistorialMovimientos: React.FC<Props> = ({ fincaId, movimientos, movimientosBodega = [] }: Props) => {
  const navigate = useNavigate();
  const [fincaNombre, setFincaNombre] = useState<string>('');
  const [selectedMovimiento, setSelectedMovimiento] = useState<any>(null);
  const [isDetallesOpen, setIsDetallesOpen] = useState(false);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>('all');

  // Formateador de fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    async function fetchFincaNombre() {
      try {
        const { nombre } = await getFincaById(fincaId);
        setFincaNombre(nombre || '');
      } catch (e) {
        setFincaNombre('');
      }
    }
    fetchFincaNombre();
  }, [fincaId]);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const ventasData = await getVentasByFinca(fincaId);
        setVentas(ventasData);
      } catch (error) {
        console.error('Error al cargar ventas:', error);
        setVentas([]);
      }
    };
    fetchVentas();
  }, [fincaId]);

  const movimientosCombinados = useMemo(() => {
    const ventasNormalizadas = ventas.map((v: Venta) => ({
      ...v,
      _tipo: 'venta' as const,
      fecha: v.fecha ? new Date(v.fecha).toISOString() : new Date().toISOString(),
      estadisticas: v.estadisticas || {
        totalAnimales: 0,
        pesoTotal: 0,
        pesoPromedio: 0,
        valorPromedio: 0,
        valorTotal: 0
      },
      tipoAnimales: v.tipoAnimales || '',
      registradoPor: v.registradoPor || ''
    }));
    const todos = [
      ...movimientos.map(m => ({ ...m, _tipo: 'ganado' as const })),
      ...movimientosBodega.map(m => ({ ...m, _tipo: 'bodega' as const })),
      ...ventasNormalizadas
    ];
    return todos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [movimientos, movimientosBodega, ventas]);


  return (
    <div className="bg-white rounded-lg shadow p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Historial de Movimientos</h2>
        <div className="flex items-center gap-2">
          <Calendar className="text-gray-500" size={20} />
          <select
            value={periodoFiltro}
            onChange={(e) => setPeriodoFiltro(e.target.value as PeriodoFiltro)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">Todo el historial</option>
            <option value="1d">Último día</option>
            <option value="1w">Última semana</option>
            <option value="1m">Último mes</option>
            <option value="1y">Último año</option>
          </select>
        </div>
      </div>
      
      {/* Lista de movimientos */}
      <div className="mb-6">
        {movimientosCombinados.length === 0 ? (
          <p className="text-gray-500 italic">No hay movimientos registrados en este período.</p>
        ) : (
          <div className="space-y-4">
            {movimientosCombinados.map((movimiento, idx) => {
              return (
                <div key={('id' in movimiento ? movimiento.id : undefined) ?? movimiento.fecha ?? idx}>
                  <div className={`bg-white p-4 rounded-lg shadow mb-4 border-l-4 ${
                    movimiento._tipo === 'bodega'
                      ? 'border-blue-500'
                      : movimiento._tipo === 'venta'
                      ? 'border-yellow-500'
                      : 'border-green-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {movimiento._tipo === 'bodega' 
                            ? '📦 Movimiento de Bodega' 
                            : movimiento._tipo === 'venta'
                            ? '💰 Venta de Ganado'
                            : `${movimiento.tipo === 'ingreso' ? '➕' : '➖'} ${movimiento.tipo.toUpperCase()}`}
                        </p>
                        <p className="text-sm text-gray-600">{formatDate(movimiento.fecha)}</p>
                        <p className="text-sm text-gray-600">Registrado por: {movimiento.registradoPor}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {movimiento._tipo === 'ganado' && movimiento.tipo === 'ingreso' && (
                          <span className="text-sm text-gray-600">Procedencia: {movimiento.procedencia}</span>
                        )}
                        {movimiento._tipo === 'ganado' && movimiento.tipo === 'salida' && (
                          <span className="text-sm text-gray-600">Destino: {movimiento.destino}</span>
                        )}
                        {movimiento._tipo === 'venta' && (
                          <>
                            <span className="text-sm text-gray-600">Comprador: {movimiento.comprador ?? 'N/A'}</span>
                            <span className="text-sm text-gray-600">Destino: {movimiento.destino ?? 'N/A'}</span>
                            <span className="text-sm font-semibold text-yellow-600">
                              Valor Total: ${movimiento.estadisticas?.valorTotal?.toLocaleString() ?? 'N/A'}
                          </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-700">{movimiento.detalles}</p>
                    </div>
                    {/* Mostrar información de animales solo para movimientos de ganado y ventas */}
                    {(movimiento._tipo === 'ganado' || movimiento._tipo === 'venta') && movimiento.animales && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {movimiento._tipo === 'venta' ? (
                          <>
                            <div className="bg-yellow-50 p-2 rounded">
                              <span className="font-medium">Total Animales:</span> {movimiento.estadisticas?.totalAnimales?.toLocaleString() ?? '0'}
                            </div>
                            <div className="bg-yellow-50 p-2 rounded">
                              <span className="font-medium">Peso Total:</span> {movimiento.estadisticas?.pesoTotal?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0'} kg
                            </div>
                            <div className="bg-yellow-50 p-2 rounded">
                              <span className="font-medium">Peso Promedio:</span> {movimiento.estadisticas?.pesoPromedio?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0'} kg
                            </div>
                            <div className="bg-yellow-50 p-2 rounded">
                              <span className="font-medium">Valor por Kilo:</span> ${movimiento.valorPorKilo?.toLocaleString() ?? 'N/A'}
                            </div>
                          </>
                        ) : (
                          <>
                        {Object.values(movimiento.animales.machos).some(v => v > 0) && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Machos:</span> {movimiento.animales.machos.ceba + movimiento.animales.machos.levante}
                          </div>
                        )}
                        {Object.values(movimiento.animales.hembras).some(v => typeof v === 'number' && v > 0) && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Hembras:</span> {
                              movimiento.animales.hembras.levante +
                              movimiento.animales.hembras.vientre +
                              movimiento.animales.hembras.preñadas +
                              movimiento.animales.hembras.escoteras +
                              movimiento.animales.hembras.paridas.total
                            }
                          </div>
                        )}
                        {Object.values(movimiento.animales.equinos).some(v => typeof v === 'number' && v > 0) && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Equinos:</span> {
                              movimiento.animales.equinos.caballos +
                              movimiento.animales.equinos.yeguas +
                              movimiento.animales.equinos.potros +
                              movimiento.animales.equinos.mulas +
                              movimiento.animales.equinos.yeguasParidas.total
                            }
                          </div>
                        )}
                        {Object.values(movimiento.animales.otros).some(v => typeof v === 'number' && v > 0) && (
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Otros:</span> {
                              movimiento.animales.otros.cabras +
                              movimiento.animales.otros.peces +
                              movimiento.animales.otros.pollos +
                              movimiento.animales.otros.cabrasParidas.total
                            }
                          </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
  <button
    onClick={() => { setSelectedMovimiento(movimiento); setIsDetallesOpen(true); }}
    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
  >
    <Info size={16} />
    Detalles
  </button>
  <button
    onClick={async () => {
      await imprimirMovimiento({
        movimiento,
        fincaNombre: 'Finca',
        logoUrl: '/assets/images/Gitana-impresion.png',
        empresaNombre: 'INVERSIONES BONITO VIENTO SAS',
      });
    }}
    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
    title="Imprimir"
  >
    <Printer size={16} />
    Imprimir
  </button>
</div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => navigate(`/fincas/${fincaId}/movimientos/animales`)}
          className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
        >
          <Truck size={20} />
          <span>Movimientos de Animales</span>
        </button>
        <button
          onClick={() => navigate(`/fincas/${fincaId}/movimientos/bodega`)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          <Package size={20} />
          <span>Movimientos de Bodega</span>
        </button>
        <button
          onClick={() => navigate(`/fincas/${fincaId}/ventas-reporte`)}
          className="flex items-center justify-center gap-2 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition"
        >
          <DollarSign size={20} />
          <span>Registro de Ventas</span>
        </button>
      </div>

      {/* Modal de Detalles */}
      <Transition appear show={isDetallesOpen}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsDetallesOpen(false)}>
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 border-b pb-2"
                  >
                    Detalles del Movimiento
                  </Dialog.Title>
                  {selectedMovimiento && (
                    <div className="mt-4 space-y-4">
                      {/* Fecha fuera del bloque condicional para evitar duplicados */}
                      <div>
                        <span className="font-medium">Fecha:</span> {formatDate(selectedMovimiento.fecha)}
                      </div>
                      {selectedMovimiento._tipo === 'venta' ? (
                        <>
                          <div>
                            <span className="font-medium">Comprador:</span> {selectedMovimiento.comprador ?? 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Destino:</span> {selectedMovimiento.destino ?? 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Valor por Kilo:</span> ${selectedMovimiento.valorPorKilo?.toLocaleString() ?? 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Total Animales:</span> {selectedMovimiento.estadisticas?.totalAnimales?.toLocaleString() ?? '0'}
                          </div>
                          <div>
                            <span className="font-medium">Peso Total:</span> {selectedMovimiento.estadisticas?.pesoTotal?.toLocaleString('es-CO') ?? '0'} kg
                          </div>
                          <div>
                            <span className="font-medium">Peso Promedio:</span> {selectedMovimiento.estadisticas?.pesoPromedio?.toLocaleString('es-CO') ?? '0'} kg
                          </div>
                          <div>
                            <span className="font-medium">Valor Total:</span> ${selectedMovimiento.estadisticas?.valorTotal?.toLocaleString() ?? 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Tipo de Animales:</span> {selectedMovimiento.tipoAnimales || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Registrado por:</span> {selectedMovimiento.registradoPor || 'N/A'}
                          </div>
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium block mb-2">Detalles Adicionales:</span>
                            <p className="text-gray-700">{selectedMovimiento.detalles || 'Sin detalles adicionales'}</p>
                          </div>
                        </>
                      ) : selectedMovimiento._tipo === 'ganado' ? (
                        <>
                          <div>
                            <span className="font-medium">Tipo:</span> {selectedMovimiento.tipo.toUpperCase()}
                          </div>
                          {selectedMovimiento.tipo === 'ingreso' && selectedMovimiento.procedencia && (
                            <div><span className="font-medium">Procedencia:</span> {selectedMovimiento.procedencia}</div>
                          )}
                          {selectedMovimiento.tipo === 'salida' && selectedMovimiento.destino && (
                            <div><span className="font-medium">Destino:</span> {selectedMovimiento.destino}</div>
                          )}
                          <div>
                            <span className="font-medium">Registrado por:</span> {selectedMovimiento.registradoPor}
                          </div>
                          <div>
                            <span className="font-medium">Detalles:</span> {selectedMovimiento.detalles}
                          </div>
                        </>
                      ) : selectedMovimiento._tipo === 'bodega' ? (
                        <>
                          <div>
                            <span className="font-medium">Registrado por:</span> {selectedMovimiento.registradoPor}
                          </div>
                          <div>
                            <span className="font-medium">Detalles:</span> {selectedMovimiento.detalles}
                          </div>
                          {/* Snapshot de bodega */}
                          {selectedMovimiento.snapshotBodega ? (
                            <div className="mt-6">
                              <h4 className="font-semibold text-base mb-2 text-green-800">Productos en bodega al registrar</h4>
                              <div className="grid grid-cols-2 gap-6">
                                {/* Suministros */}
                                <div>
                                  <div className="font-bold text-green-700 mb-2 border-b border-green-200 pb-1">Suministros</div>
                                  <span className="text-gray-400">Sin detalles de suministros</span>
                                </div>
                                {/* Veterinarios */}
                                <div>
                                  <div className="font-bold text-red-700 mb-2 border-b border-red-200 pb-1">Veterinarios</div>
                                  <span className="text-gray-400">Sin detalles de veterinarios</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-6 text-sm text-gray-400">Sin snapshot de bodega registrado</div>
                          )}
                        </>
                      ) : null}
                      {selectedMovimiento._tipo === 'ganado' && selectedMovimiento.animales && (
                        <div className="mt-4">
                          <span className="font-medium block mb-2">Animales:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Machos */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="font-semibold text-green-800">Machos</span>
                              <ul className="ml-2 mt-1 text-sm">
                                <li>Ceba: <span className="font-bold">{selectedMovimiento.animales.machos?.ceba ?? 0}</span></li>
                                <li>Levante: <span className="font-bold">{selectedMovimiento.animales.machos?.levante ?? 0}</span></li>
                              </ul>
                            </div>
                            {/* Bufalos Machos */}
                            {selectedMovimiento.animales.bufalos && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <span className="font-semibold text-blue-800">Búfalos Machos</span>
                                <ul className="ml-2 mt-1 text-sm">
                                  <li>Ceba: <span className="font-bold">{selectedMovimiento.animales.bufalos.machos?.ceba ?? 0}</span></li>
                                  <li>Levante: <span className="font-bold">{selectedMovimiento.animales.bufalos.machos?.levante ?? 0}</span></li>
                                </ul>
                              </div>
                            )}
                            {/* Hembras */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="font-semibold text-pink-800">Hembras</span>
                              <ul className="ml-2 mt-1 text-sm">
                                <li>Levante: <span className="font-bold">{selectedMovimiento.animales.hembras?.levante ?? 0}</span></li>
                                <li>Vientre: <span className="font-bold">{selectedMovimiento.animales.hembras?.vientre ?? 0}</span></li>
                                <li>Preñadas: <span className="font-bold">{selectedMovimiento.animales.hembras?.preñadas ?? 0}</span></li>
                                <li>Escoteras: <span className="font-bold">{selectedMovimiento.animales.hembras?.escoteras ?? 0}</span></li>
                                <li>Paridas: <span className="font-bold">{selectedMovimiento.animales.hembras?.paridas?.total ?? 0}</span></li>
                              </ul>
                              {/* Crías de vacas paridas */}
                              {selectedMovimiento.animales.hembras?.paridas && (
                                <div className="ml-2 mt-2 text-xs bg-gray-100 rounded p-2">
                                  <span className="font-semibold">Crías de Vacas Paridas:</span>
                                  <ul className="ml-2 mt-1">
                                    <li>Machos: <span className="font-bold">{selectedMovimiento.animales.hembras.paridas.machos ?? 0}</span></li>
                                    <li>Hembras: <span className="font-bold">{selectedMovimiento.animales.hembras.paridas.hembras ?? 0}</span></li>
                                  </ul>
                                </div>
                              )}
                            </div>
                            {/* Bufalos Hembras */}
                            {selectedMovimiento.animales.bufalos && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <span className="font-semibold text-blue-600">Búfalas Hembras</span>
                                <ul className="ml-2 mt-1 text-sm">
                                  <li>Levante: <span className="font-bold">{selectedMovimiento.animales.bufalos.hembras?.levante ?? 0}</span></li>
                                  <li>Vientre: <span className="font-bold">{selectedMovimiento.animales.bufalos.hembras?.vientre ?? 0}</span></li>
                                  <li>Preñadas: <span className="font-bold">{selectedMovimiento.animales.bufalos.hembras?.preñadas ?? 0}</span></li>
                                  <li>Escoteras: <span className="font-bold">{selectedMovimiento.animales.bufalos.hembras?.escoteras ?? 0}</span></li>
                                  <li>Paridas: <span className="font-bold">{selectedMovimiento.animales.bufalos.hembras?.paridas?.total ?? 0}</span></li>
                                </ul>
                                {/* Crías de búfalas paridas */}
                                {selectedMovimiento.animales.bufalos.hembras?.paridas && (
                                  <div className="ml-2 mt-2 text-xs bg-blue-100 rounded p-2">
                                    <span className="font-semibold">Crías de Búfalas Paridas:</span>
                                    <ul className="ml-2 mt-1">
                                      <li>Machos: <span className="font-bold">{selectedMovimiento.animales.bufalos.hembras.paridas.machos ?? 0}</span></li>
                                      <li>Hembras: <span className="font-bold">{selectedMovimiento.animales.bufalos.hembras.paridas.hembras ?? 0}</span></li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Equinos */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="font-semibold text-yellow-800">Equinos</span>
                              <ul className="ml-2 mt-1 text-sm">
                                <li>Caballos: <span className="font-bold">{selectedMovimiento.animales.equinos?.caballos ?? 0}</span></li>
                                <li>Yeguas: <span className="font-bold">{selectedMovimiento.animales.equinos?.yeguas ?? 0}</span></li>
                                <li>Potros: <span className="font-bold">{selectedMovimiento.animales.equinos?.potros ?? 0}</span></li>
                                <li>Mulas: <span className="font-bold">{selectedMovimiento.animales.equinos?.mulas ?? 0}</span></li>
                                <li>Yeguas Paridas: <span className="font-bold">{selectedMovimiento.animales.equinos?.yeguasParidas?.total ?? 0}</span></li>
                              </ul>
                              {/* Crías de yeguas paridas */}
                              {selectedMovimiento.animales.equinos?.yeguasParidas && (
                                <div className="ml-2 mt-2 text-xs bg-gray-100 rounded p-2">
                                  <span className="font-semibold">Crías de Yeguas Paridas:</span>
                                  <ul className="ml-2 mt-1">
                                    <li>Machos: <span className="font-bold">{selectedMovimiento.animales.equinos.yeguasParidas.machos ?? 0}</span></li>
                                    <li>Hembras: <span className="font-bold">{selectedMovimiento.animales.equinos.yeguasParidas.hembras ?? 0}</span></li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          {/* Otros */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="font-semibold text-gray-800">Otros</span>
                              <ul className="ml-2 mt-1 text-sm">
                                <li>Cabras: <span className="font-bold">{selectedMovimiento.animales.otros?.cabras ?? 0}</span></li>
                                <li>Peces: <span className="font-bold">{selectedMovimiento.animales.otros?.peces ?? 0}</span></li>
                                <li>Pollos: <span className="font-bold">{selectedMovimiento.animales.otros?.pollos ?? 0}</span></li>
                                <li>Cabras Paridas: <span className="font-bold">{selectedMovimiento.animales.otros?.cabrasParidas?.total ?? 0}</span></li>
                              </ul>
                              {/* Crías de cabras paridas */}
                              {selectedMovimiento.animales.otros?.cabrasParidas && (
                                <div className="ml-2 mt-2 text-xs bg-gray-100 rounded p-2">
                                  <span className="font-semibold">Crías de Cabras Paridas:</span>
                                  <ul className="ml-2 mt-1">
                                    <li>Machos: <span className="font-bold">{selectedMovimiento.animales.otros.cabrasParidas.machos ?? 0}</span></li>
                                    <li>Hembras: <span className="font-bold">{selectedMovimiento.animales.otros.cabrasParidas.hembras ?? 0}</span></li>
                                  </ul>
                                </div>
                              )}
                                </div>
                              </div>
                            </div>
                          )}
                      {selectedMovimiento && selectedMovimiento._tipo === 'venta' && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Detalles de Animales Vendidos</h4>
                          <div className="max-h-[300px] overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso (kg)</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedMovimiento.animales.map((animal: any, index: number) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{animal.numero}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{animal.peso.toLocaleString('es-CO')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => setIsDetallesOpen(false)}
                      >
                        Cerrar
                      </button>
                      {/* Botón de impresión */}
                      <button
                        type="button"
                        className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                        onClick={async () => {
                          if (selectedMovimiento) {
                            await imprimirMovimiento({
                              movimiento: selectedMovimiento,
                              fincaNombre,
                              logoUrl: '/logo.png',
                              empresaNombre: 'INVERSIONES BONITO VIENTO SAS'
                            });
                          }
                        }}
                      >
                        Imprimir
                      </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default HistorialMovimientos;