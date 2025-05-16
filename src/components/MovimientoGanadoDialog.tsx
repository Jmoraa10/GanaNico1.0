import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MovimientoGanado } from '../types/FincaTypes';
import { Fragment } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movimiento: Omit<MovimientoGanado, 'id'>) => void;
  initialData?: {
    tipo: 'ingreso' | 'salida';
    cantidad: number;
    detalles: string;
    animales: {
      machos: number;
      hembras: number;
      equinos: number;
      otros: number;
      bufalos: number; // Agregamos bufalos aquí
    };
    registradoPor?: string;
  };
}

const MovimientoGanadoDialog: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [tipo, setTipo] = useState<'ingreso' | 'salida'>('ingreso');
  const [cantidad, setCantidad] = useState(1);
  const [detalles, setDetalles] = useState('');
  const [procedencia, setProcedencia] = useState('');
  const [destino, setDestino] = useState('');
  const [registradoPor, setRegistradoPor] = useState('');

  useEffect(() => {
    if (initialData) {
      setTipo(initialData.tipo);
      setCantidad(initialData.cantidad);
      setDetalles(initialData.detalles || '');
      // No establecer registradoPor desde initialData
      setRegistradoPor('');
      // Limpiar campos cuando cambia initialData
      setProcedencia('');
      setDestino('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!detalles.trim()) {
      alert('Por favor, ingrese los detalles del movimiento');
      return;
    }

    if (!registradoPor.trim()) {
      alert('Por favor, ingrese quién registra el movimiento');
      return;
    }

    if (tipo === 'ingreso' && !procedencia.trim()) {
      alert('Por favor, ingrese la procedencia');
      return;
    }

    if (tipo === 'salida' && !destino.trim()) {
      alert('Por favor, ingrese el destino');
      return;
    }

    // Crear el objeto de movimiento con todos los campos requeridos
    const movimientoData = {
      fecha: new Date().toISOString(),
      tipo,
      cantidad,
      detalles: detalles.trim(),
      procedencia: tipo === 'ingreso' ? procedencia.trim() : 'N/A',
      destino: tipo === 'salida' ? destino.trim() : 'N/A',
      registradoPor: registradoPor.trim(),
      animales: {
        machos: {
          ceba: initialData?.animales.machos || 0,
          levante: initialData?.animales.machos || 0
        },
        hembras: {
          levante: initialData?.animales.hembras || 0,
          vientre: initialData?.animales.hembras || 0,
          preñadas: 0,
          escoteras: 0,
          paridas: {
            total: 0,
            machos: 0,
            hembras: 0
          }
        },
        equinos: {
          caballos: initialData?.animales.equinos || 0,
          yeguas: 0,
          potros: 0,
          mulas: 0,
          yeguasParidas: {
            total: 0,
            machos: 0,
            hembras: 0
          }
        },
        otros: {
          cabras: initialData?.animales.otros || 0,
          peces: 0,
          pollos: 0,
          cabrasParidas: {
            total: 0,
            machos: 0,
            hembras: 0
          }
        },
        bufalos: {
          machos: {
            ceba: initialData?.animales.bufalos || 0,
            levante: initialData?.animales.bufalos || 0
          },
          hembras: {
            levante: initialData?.animales.bufalos || 0,
            vientre: 0,
            preñadas: 0,
            escoteras: 0,
            paridas: {
              total: 0,
              machos: 0,
              hembras: 0
            }
          }
        }
      }
    };

    onSave(movimientoData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Registrar Movimiento
                </Dialog.Title>
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Movimiento
                      </label>
                      <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as 'ingreso' | 'salida')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="ingreso">Ingreso</option>
                        <option value="salida">Salida</option>
                      </select>
                    </div>

                    {tipo === 'ingreso' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Procedencia
                        </label>
                        <input
                          type="text"
                          value={procedencia}
                          onChange={(e) => setProcedencia(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ingrese la procedencia"
                          required
                        />
                      </div>
                    )}

                    {tipo === 'salida' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destino
                        </label>
                        <input
                          type="text"
                          value={destino}
                          onChange={(e) => setDestino(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ingrese el destino"
                          required
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registrado por
                      </label>
                      <input
                        type="text"
                        value={registradoPor}
                        onChange={(e) => setRegistradoPor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Nombre de quien registra"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Detalles del Movimiento
                      </label>
                      <textarea
                        value={detalles}
                        onChange={(e) => setDetalles(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Ingrese los detalles del movimiento"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Guardar
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MovimientoGanadoDialog; 