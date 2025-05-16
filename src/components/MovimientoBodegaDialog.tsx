import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { MovimientoBodega } from '../types/FincaTypes';

import { Bodega } from '../types/FincaTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movimiento: Omit<MovimientoBodega, 'id'>) => void;
  bodegaActual?: Bodega;
}

const MovimientoBodegaDialog: React.FC<Props> = ({ isOpen, onClose, onSave, bodegaActual }) => {
  const [registradoPor, setRegistradoPor] = useState('');
  const [detalles, setDetalles] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Obtener la hora local en formato yyyy-MM-ddTHH:mm
      const now = new Date();
      const tzOffset = now.getTimezoneOffset() * 60000;
      const localISO = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
      setFecha(localISO);
      setRegistradoPor('');
      setDetalles('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registradoPor.trim() || !detalles.trim()) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    // Guardar la fecha local en formato ISO
    const fechaLocal = new Date(fecha).toISOString();
    onSave({
      fecha: fechaLocal,
      registradoPor: registradoPor.trim(),
      detalles: detalles.trim(),
    });
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
                <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 mb-4">
                  Registro de movimientos de bodega
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora</label>
                    <input
                      type="datetime-local"
                      value={fecha}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registrado por</label>
                    <input
                      type="text"
                      value={registradoPor}
                      onChange={e => setRegistradoPor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Nombre de quien registra"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Detalles del movimiento</label>
                    <textarea
                      value={detalles}
                      onChange={e => setDetalles(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Describa el movimiento realizado"
                      required
                    />
                  </div>

                  {/* Productos actuales en bodega */}
                  {bodegaActual && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-base mb-2 text-green-800">Productos actuales en bodega</h4>
                      <div className="grid grid-cols-2 gap-6">
                        {/* Suministros */}
                        <div>
                          <div className="font-bold text-green-700 mb-2 border-b border-green-200 pb-1">Suministros</div>
                          {bodegaActual.suministros.length === 0 ? (
                            <div className="text-gray-400 text-sm">Sin productos</div>
                          ) : (
                            <ul className="space-y-1">
                              {bodegaActual.suministros.map((item: import('../types/FincaTypes').BodegaItem, idx: number) => (
                                <li key={idx} className="flex justify-between text-sm">
                                  <span>{item.nombre}</span>
                                  <span className="font-mono">{item.cantidad}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {/* Veterinarios */}
                        <div>
                          <div className="font-bold text-red-700 mb-2 border-b border-red-200 pb-1">Veterinarios</div>
                          {bodegaActual.veterinarios.length === 0 ? (
                            <div className="text-gray-400 text-sm">Sin productos</div>
                          ) : (
                            <ul className="space-y-1">
                              {bodegaActual.veterinarios.map((item: import('../types/FincaTypes').BodegaItem, idx: number) => (
                                <li key={idx} className="flex justify-between text-sm">
                                  <span>{item.nombre}</span>
                                  <span className="font-mono">{item.cantidad}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                      Guardar movimiento
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MovimientoBodegaDialog; 