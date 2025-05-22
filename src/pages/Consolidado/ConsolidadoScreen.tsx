import { useNavigate } from "react-router-dom";
import { LogOut, Home } from "lucide-react";
import { Hammer, Warehouse } from "lucide-react";

const cardData = [
  {
    title: "ANIMALES",
    description: "REGISTRO TOTAL DE FINCAS",
    action: true,
    icon: <span className="text-[80px] mb-4">🐄</span>,
  },
  {
    title: "SUBSTAS",
    description: "DATOS ACTUALIZADOS DE SUBASTAS",
    action: true,
    icon: <Hammer size={80} className="text-blue-700 mb-4" />,
  },
  {
    title: "BODEGAS",
    description: "INVENTARIO GENERAL",
    action: true,
    icon: <Warehouse size={80} className="text-yellow-700 mb-4" />,
  },
];

export default function ConsolidadoScreen() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen overflow-hidden font-rio">
      {/* Imagen de fondo */}
      <div 
        className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-90 z-0"
        style={{ 
          backgroundImage: `url('/assets/images/consolidado.png')`,
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Capa de difuminado */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      {/* Contenido principal */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-4">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-xl transition-colors duration-300 shadow-md"
          >
            <Home size={20} />
            Volver a Home
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
        {/* Título principal */}
        <div className="flex flex-col items-center mt-6 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-2 text-center font-rio">
            Consolidado de Datos
          </h2>
          <p className="text-green-800 text-lg text-center max-w-2xl mb-6">
            Accede a los reportes y análisis consolidados de animales, subastas y bodegas de la empresa.
          </p>
        </div>
        {/* Cards */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 justify-center items-center px-4 pb-10">
          {cardData.map((card) => (
            <div
              key={card.title}
              className={`bg-white bg-opacity-90 border-2 border-green-700 rounded-2xl p-8 shadow-lg flex flex-col items-center w-full max-w-xs min-h-[260px] mb-4 md:mb-0 hover:scale-105 transition-transform duration-200 ${card.action ? 'cursor-pointer' : ''}`}
              onClick={card.title === 'ANIMALES' ? () => navigate('/consolidado/animales') : card.title === 'SUBSTAS' ? () => navigate('/consolidado/subastas') : card.title === 'BODEGAS' ? () => navigate('/consolidado/bodegas') : undefined}
            >
              {card.icon}
              <h3 className="text-2xl font-bold text-green-800 mb-2 text-center font-rio">
                {card.title}
              </h3>
              <p className="text-center text-green-700 text-lg font-semibold">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 