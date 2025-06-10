import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFincaById } from '../services/fincaService';
import { getVentasByFinca } from '../services/ventaService';
import { Venta } from '../types/FincaTypes';
import { ArrowLeft, Home, DollarSign } from 'lucide-react';
import { useLogout } from '../hooks/useLogout';

const VentaReporte: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fincaNombre, setFincaNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const logout = useLogout();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // Obtener información de la finca
        const finca = await getFincaById(id);
        setFincaNombre(finca.nombre || '');

        // Obtener ventas específicas de la finca
        const ventasData = await getVentasByFinca(id);
        setVentas(ventasData);
      } catch (error) {
        // console.error('Error al cargar datos:', error);
        setVentas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-yellow-800 flex items-center gap-2">
            <DollarSign size={28} /> Reporte de Ventas
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              <ArrowLeft size={18} /> Volver
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Home size={18} /> Home
            </button>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Finca: <span className="text-gray-900">{fincaNombre}</span></h3>
        
        {loading ? (
          <div className="text-center text-gray-500 py-10">Cargando ventas...</div>
        ) : ventas.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No hay ventas registradas para esta finca.</div>
        ) : (
          <div className="space-y-4">
            {ventas.map((venta) => (
              <div key={venta._id} className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-yellow-800 text-lg">Venta #{venta._id?.slice(-6) || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Fecha: {new Date(venta.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm text-gray-600">Comprador: <span className="font-semibold">{venta.comprador}</span></p>
                    <p className="text-sm text-gray-600">Destino: <span className="font-semibold">{venta.destino}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700">Valor por kilo: <span className="font-bold text-yellow-700">${venta.valorPorKilo?.toLocaleString('es-CO')}</span></p>
                    <p className="text-sm text-gray-700">Valor total: <span className="font-bold text-yellow-700">${venta.estadisticas?.valorTotal?.toLocaleString('es-CO')}</span></p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="bg-yellow-100 p-2 rounded">
                    <span className="font-medium">Total Animales:</span> {venta.estadisticas?.totalAnimales?.toLocaleString('es-CO') ?? '0'}
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <span className="font-medium">Peso Total:</span> {venta.estadisticas?.pesoTotal?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0'} kg
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <span className="font-medium">Peso Promedio:</span> {venta.estadisticas?.pesoPromedio?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0'} kg
                  </div>
                  <div className="bg-yellow-100 p-2 rounded">
                    <span className="font-medium">Valor Promedio:</span> ${venta.estadisticas?.valorPromedio?.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0'}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">Registrado por:</span> {venta.registradoPor ?? 'N/A'}
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  <span className="font-medium">Detalles:</span> {venta.detalles ?? 'Sin detalles'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={logout}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default VentaReporte; 