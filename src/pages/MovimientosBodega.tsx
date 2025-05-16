import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Finca, MovimientoBodega } from '../types/FincaTypes';
import { getFincaById } from '../services/fincaService';
import { ArrowLeft, Home, LogOut } from 'lucide-react';

const MovimientosBodega: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState<MovimientoBodega[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovimientos = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const finca: Finca = await getFincaById(id);
        setMovimientos(finca.movimientosBodega || []);
      } catch (err) {
        setError('Error al cargar los movimientos de bodega');
      } finally {
        setLoading(false);
      }
    };
    fetchMovimientos();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-800">Movimientos de Bodega</h1>
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
        {loading ? (
          <p className="text-blue-700 font-semibold">Cargando movimientos...</p>
        ) : error ? (
          <p className="text-red-600 font-semibold">{error}</p>
        ) : movimientos.length === 0 ? (
          <p className="text-gray-500 italic">No hay movimientos de bodega registrados.</p>
        ) : (
          <div className="space-y-4">
            {movimientos.slice().sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map((mov, idx) => (
              <div key={mov.id || mov.fecha || idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-800">{formatDate(mov.fecha)}</span>
                  <span className="text-sm text-gray-600">Registrado por: {mov.registradoPor}</span>
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Detalles:</span> {mov.detalles}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovimientosBodega; 