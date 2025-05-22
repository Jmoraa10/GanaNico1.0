import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut, PlusCircle, MapPin } from 'lucide-react';
import { subastaService, Subasta } from '../../services/subastaService';

const SubastasScreen: React.FC = () => {
  const navigate = useNavigate();
  const [subastas, setSubastas] = useState<Subasta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newSubasta, setNewSubasta] = useState({
    nombre: '',
    ubicacion: ''
  });

  useEffect(() => {
    loadSubastas();
  }, []);

  const loadSubastas = async () => {
    try {
      const data = await subastaService.getAllSubastas();
      setSubastas(data);
    } catch (err) {
      setError('Error al cargar las subastas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubasta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subasta = await subastaService.createSubasta({
        ...newSubasta,
        historialMovimientos: []
      });
      setSubastas([...subastas, subasta]);
      setShowForm(false);
      setNewSubasta({ nombre: '', ubicacion: '' });
      navigate(`/subastas/${subasta._id}`);
    } catch (err) {
      setError('Error al crear la subasta');
      console.error('Error:', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Cargando subastas...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center p-6 font-rio"
      style={{
        backgroundImage: "url('/assets/images/subasta.png')",
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(255,255,255,0.7)',
      }}
    >
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 bg-opacity-90">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Home size={18} /> Home
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusCircle size={18} /> Nueva Subasta
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-blue-800">Nueva Subasta</h2>
              <form onSubmit={handleCreateSubasta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={newSubasta.nombre}
                    onChange={(e) => setNewSubasta({ ...newSubasta, nombre: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                  <input
                    type="text"
                    value={newSubasta.ubicacion}
                    onChange={(e) => setNewSubasta({ ...newSubasta, ubicacion: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Crear Subasta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subastas.map((subasta) => (
            <div
              key={subasta._id}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate(`/subastas/${subasta._id}`)}
            >
              <h3 className="text-xl font-bold text-blue-900 mb-2">{subasta.nombre}</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span>{subasta.ubicacion}</span>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Creada: {new Date(subasta.createdAt || '').toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubastasScreen; 