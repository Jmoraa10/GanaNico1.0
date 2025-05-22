import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFinca } from '../hooks/useFincas';
import { MovimientoGanado } from '../types/FincaTypes';
import { FileText, ArrowLeft, Home, LogOut } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const MovimientosAnimales: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { finca, loading, error } = useFinca(id || '');
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoGanado | null>(null);
  const [isDetallesOpen, setIsDetallesOpen] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }
  if (error || !finca) {
    return <div className="p-4 text-red-600">Error al cargar los datos de la finca</div>;
  }
  const movimientosAnimales = finca.movimientosGanado || [];
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-rio">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-800">Movimientos de Animales</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/fincas/${id}`)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft size={18} /> Volver a Finca
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Home size={18} /> Ir a Home
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Movimientos de Animales - {finca.nombre}
        </h1>

        <div className="space-y-4">
          {movimientosAnimales.length === 0 ? (
            <p className="text-gray-500 italic">No hay movimientos de animales registrados.</p>
          ) : (
            movimientosAnimales.map((movimiento) => (
              <div key={movimiento.id} className="bg-white shadow rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {movimiento.tipo === 'ingreso' ? '➕' : '➖'} {movimiento.tipo.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(movimiento.fecha)}</p>
                    {movimiento.registradoPor && (
                      <p className="text-sm text-gray-600">Registrado por: {movimiento.registradoPor}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {movimiento.tipo === 'ingreso' && movimiento.procedencia && (
                      <span className="text-sm text-gray-600">
                        Procedencia: {movimiento.procedencia}
                      </span>
                    )}
                    {movimiento.tipo === 'salida' && movimiento.destino && (
                      <span className="text-sm text-gray-600">
                        Destino: {movimiento.destino}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-sm text-gray-700">{movimiento.detalles}</p>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedMovimiento(movimiento);
                      setIsDetallesOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <FileText size={16} />
                    Detalles
                  </button>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal de Detalles */}
        <Transition appear show={isDetallesOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsDetallesOpen(false)}>
            <Transition.Child
              as={Fragment}
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
                  as={Fragment}
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
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Fecha</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(selectedMovimiento.fecha)}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Tipo de Movimiento</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedMovimiento.tipo.toUpperCase()}
                          </p>
                        </div>

                        {selectedMovimiento.tipo === 'ingreso' && selectedMovimiento.procedencia && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Procedencia</h4>
                            <p className="mt-1 text-sm text-gray-900">{selectedMovimiento.procedencia}</p>
                          </div>
                        )}

                        {selectedMovimiento.tipo === 'salida' && selectedMovimiento.destino && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Destino</h4>
                            <p className="mt-1 text-sm text-gray-900">{selectedMovimiento.destino}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Detalles</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedMovimiento.detalles}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Registrado por</h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedMovimiento.registradoPor || 'No especificado'}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Animales</h4>
                          <div className="mt-2 grid grid-cols-2 gap-4">
                            {selectedMovimiento.animales && ((selectedMovimiento.animales.machos?.ceba ?? 0) > 0 || (selectedMovimiento.animales.machos?.levante ?? 0) > 0) && (
                              <div>
                                <span className="text-sm text-gray-500">Machos:</span>
                                <span className="ml-2 text-sm text-gray-900">
                                  Ceba: {selectedMovimiento.animales.machos.ceba ?? 0}, Levante: {selectedMovimiento.animales.machos.levante ?? 0}
                                </span>
                              </div>
                            )}
                            {selectedMovimiento.animales && ((selectedMovimiento.animales.hembras?.levante ?? 0) > 0 || (selectedMovimiento.animales.hembras?.vientre ?? 0) > 0 || (selectedMovimiento.animales.hembras?.preñadas ?? 0) > 0 || (selectedMovimiento.animales.hembras?.escoteras ?? 0) > 0 || (selectedMovimiento.animales.hembras?.paridas?.total ?? 0) > 0) && (
                              <div>
                                <span className="text-sm text-gray-500">Hembras:</span>
                                <span className="ml-2 text-sm text-gray-900">
                                  Levante: {selectedMovimiento.animales.hembras.levante ?? 0}, Vientre: {selectedMovimiento.animales.hembras.vientre ?? 0}, Preñadas: {selectedMovimiento.animales.hembras.preñadas ?? 0}, Escoteras: {selectedMovimiento.animales.hembras.escoteras ?? 0}, Paridas: {selectedMovimiento.animales.hembras.paridas?.total ?? 0}
                                </span>
                              </div>
                            )}
                            {/* Bufalos Machos */}
                            {selectedMovimiento.animales && selectedMovimiento.animales.bufalos && selectedMovimiento.animales.bufalos.machos && (selectedMovimiento.animales.bufalos.machos.ceba > 0 || selectedMovimiento.animales.bufalos.machos.levante > 0) && (
                              <div>
                                <span className="text-sm text-blue-800">Búfalos Machos:</span>
                                <span className="ml-2 text-sm text-gray-900">
                                  Ceba: {selectedMovimiento.animales.bufalos.machos.ceba ?? 0}, Levante: {selectedMovimiento.animales.bufalos.machos.levante ?? 0}
                                </span>
                              </div>
                            )}
                            {/* Bufalos Hembras */}
                            {selectedMovimiento.animales && selectedMovimiento.animales.bufalos && selectedMovimiento.animales.bufalos.hembras && (
                              (selectedMovimiento.animales.bufalos.hembras.levante > 0 ||
                                selectedMovimiento.animales.bufalos.hembras.vientre > 0 ||
                                selectedMovimiento.animales.bufalos.hembras.preñadas > 0 ||
                                selectedMovimiento.animales.bufalos.hembras.escoteras > 0 ||
                                (selectedMovimiento.animales.bufalos.hembras.paridas && selectedMovimiento.animales.bufalos.hembras.paridas.total > 0))
                              ) && (
                              <div>
                                <span className="text-sm text-blue-600">Búfalas Hembras:</span>
                                <span className="ml-2 text-sm text-gray-900">
                                  Levante: {selectedMovimiento.animales.bufalos.hembras.levante ?? 0}, Vientre: {selectedMovimiento.animales.bufalos.hembras.vientre ?? 0}, Preñadas: {selectedMovimiento.animales.bufalos.hembras.preñadas ?? 0}, Escoteras: {selectedMovimiento.animales.bufalos.hembras.escoteras ?? 0}, Paridas: {selectedMovimiento.animales.bufalos.hembras.paridas?.total ?? 0}
                                </span>
                              </div>
                            )}
                            {selectedMovimiento.animales && ((selectedMovimiento.animales.equinos?.caballos ?? 0) > 0 || (selectedMovimiento.animales.equinos?.yeguas ?? 0) > 0 || (selectedMovimiento.animales.equinos?.potros ?? 0) > 0 || (selectedMovimiento.animales.equinos?.mulas ?? 0) > 0 || (selectedMovimiento.animales.equinos?.yeguasParidas?.total ?? 0) > 0) && (
                              <div>
                                <span className="text-sm text-gray-500">Equinos:</span>
                                <span className="ml-2 text-sm text-gray-900">
                                  Caballos: {selectedMovimiento.animales.equinos.caballos ?? 0}, Yeguas: {selectedMovimiento.animales.equinos.yeguas ?? 0}, Potros: {selectedMovimiento.animales.equinos.potros ?? 0}, Mulas: {selectedMovimiento.animales.equinos.mulas ?? 0}, Yeguas Paridas: {selectedMovimiento.animales.equinos.yeguasParidas?.total ?? 0}
                                </span>
                              </div>
                            )}
                            {selectedMovimiento.animales && ((selectedMovimiento.animales.otros?.cabras ?? 0) > 0 || (selectedMovimiento.animales.otros?.peces ?? 0) > 0 || (selectedMovimiento.animales.otros?.pollos ?? 0) > 0 || (selectedMovimiento.animales.otros?.cabrasParidas?.total ?? 0) > 0) && (
                              <div>
                                <span className="text-sm text-gray-500">Otros:</span>
                                <span className="ml-2 text-sm text-gray-900">
                                  Cabras: {selectedMovimiento.animales.otros.cabras ?? 0}, Peces: {selectedMovimiento.animales.otros.peces ?? 0}, Pollos: {selectedMovimiento.animales.otros.pollos ?? 0}, Cabras Paridas: {selectedMovimiento.animales.otros.cabrasParidas?.total ?? 0}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => setIsDetallesOpen(false)}
                      >
                        Cerrar
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
};

export default MovimientosAnimales; 