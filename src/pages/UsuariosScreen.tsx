import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, LogOut } from 'lucide-react';

const UsuariosScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-between items-center px-6 pt-4">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-xl transition-colors duration-300 shadow-md"
        >
          <Home size={20} />
          Regresar a Home
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("idToken");
            navigate("/login");
          }}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition-colors duration-300 shadow-md"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-800 mb-6">Gestión de Usuarios</h1>
        <p className="text-gray-600">Esta funcionalidad está en desarrollo.</p>
      </div>
    </div>
  );
};

export default UsuariosScreen; 