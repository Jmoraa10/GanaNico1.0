import React from 'react';
import { BodegaItem } from '../types/FincaTypes';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertaFaltantesProps {
  items: BodegaItem[];
  titulo?: string;
  onMarcarComoComprado: (nombre: string) => void;
  className?: string;
}

const AlertaFaltantes: React.FC<AlertaFaltantesProps> = ({ items, titulo = 'Faltantes', onMarcarComoComprado, className = '' }) => {
  const faltantes = items.filter(item => item.esFaltante);

  if (faltantes.length === 0) return null;

  return (
    <div className={`bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6 shadow-lg ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="text-red-500" size={24} />
        <h3 className="text-xl font-bold text-red-700">{titulo} Pendientes</h3>
      </div>
      <div className="bg-white rounded-lg border border-red-200 p-3">
        <ul className="space-y-3">
          {faltantes.map((item) => (
            <li key={item.nombre} className="flex items-center justify-between p-2 rounded-lg hover:bg-red-50 transition">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-500" size={18} />
                <span className="font-medium text-red-700">{item.nombre}</span>
              </div>
              <button
                onClick={() => onMarcarComoComprado(item.nombre)}
                className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-1 px-3 rounded-lg transition"
                aria-label={`Marcar ${item.nombre} como comprado`}
              >
                <CheckCircle2 size={16} />
                Marcar como comprado
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AlertaFaltantes; 