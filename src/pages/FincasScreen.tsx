import { useNavigate } from "react-router-dom";
import { useFincas } from "../hooks/useFincas";
import { calcularTotalAnimales } from "../services/fincaService";
// @ts-ignore
import { Tractor, LogOut, Plus, Home, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useLogout } from '../hooks/useLogout';

const FincasScreen: React.FC = () => {
  const navigate = useNavigate();
  const { fincas, loading, error, deleteFinca } = useFincas();
  useAuth();
  const logout = useLogout();


  // @ts-ignore
  const handleDeleteFinca = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar esta finca?')) {
      try {
        await deleteFinca(id);
      } catch (error) {
        console.error('Error al eliminar la finca:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-green-700 font-semibold animate-pulse">
          ya casi socio ...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden font-rio">
      {/* Imagen de fondo con posicionamiento fijo */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-90 z-0"
        style={{ 
          backgroundImage: `url('/assets/images/listafincas.png')`,
          backgroundAttachment: 'fixed'
        }}
      />
  
      {/* Contenido principal */}
      <div className="relative z-10 w-full min-h-screen p-4 md:p-6">
        {/* Encabezado y botones */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-rio text-green-800 mb-4 md:mb-0 flex items-center gap-2">
            <Tractor className="text-green-700 w-8 h-8" />
            FINCAS RAUL MORA Y FAMILIA
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow transition"
            >
              <Home size={18} /> Regresar a Home
            </button>
            
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl shadow transition"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
  
        {/* Contenedor tipo vidrio SOLO para los cards */}
        <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-inner ring-1 ring-white/30 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fincas.map((finca) => {
              const fincaId = finca._id || finca.id;
              if (!fincaId) return null;
  
              return (
                <motion.div
                  key={fincaId}
                  className="relative bg-white/70 backdrop-blur-sm border border-green-300/40 rounded-2xl shadow-md hover:shadow-lg transition p-6 cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div onClick={() => navigate(`/fincas/${fincaId}`)}>
                    <h2 className="text-xl font-bold text-green-800">{finca.nombre}</h2>
                    <p className="text-gray-700">
                      <strong>Capataz:</strong> {finca.capataz}
                    </p>
                    <p className="text-gray-700">
                      <strong>Ubicación:</strong> {finca.ubicacion}
                    </p>
                    <p className="text-gray-700">
                      <strong>Hectáreas:</strong> {finca.hectareas}
                    </p>
                    <p className="text-gray-700">
                      <strong>Total animales:</strong>{" "}
                      {calcularTotalAnimales(finca.animales)}
                    </p>
                  </div>
                  {/* Botón de eliminar finca oculto temporalmente */}
{/*
<button
  onClick={(e) => handleDeleteFinca(fincaId, e)}
  className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 transition-colors"
>
  <X size={16} />
</button>
*/}
                  
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    {/* Botón flotante para agregar finca */}
    <button
  onClick={() => navigate("/fincas/nueva")}
  className="fixed bottom-8 right-8 z-50 bg-transparent rounded-full w-14 h-14 flex items-center justify-center text-4xl hover:bg-gray-100 transition-all duration-300 border-none shadow-none"
  title="Agregar nueva finca"
  style={{ color: '#222', background: 'none', boxShadow: 'none', border: 'none', padding: 0 }}
>
  <Plus size={40} strokeWidth={2.5} />
</button>
  </div>
  );
};

export default FincasScreen;
