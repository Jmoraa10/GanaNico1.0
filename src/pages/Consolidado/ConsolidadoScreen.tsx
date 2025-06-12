import React from 'react';
import { useNavigate } from "react-router-dom";
import { LogOut, Home, Truck } from "lucide-react";
import { Hammer, Warehouse } from "lucide-react";
import { Gavel } from "lucide-react";

const cardData = [
  {
    title: "ANIMALES",
    icon: <span className="text-[32px]">🐄</span>,
    path: '/consolidado/animales',
    description: "Resumen de movimientos de animales",
    allowedRoles: ['admin', 'capataz']
  },
  {
    title: "SUBASTAS",
    icon: <Gavel className="w-8 h-8" />,
    path: '/consolidado/subastas',
    description: "Resumen de subastas",
    allowedRoles: ['admin']
  },
  {
    title: "BODEGAS",
    icon: <Warehouse className="w-8 h-8" />,
    path: '/consolidado/bodegas',
    description: "Resumen de bodegas",
    allowedRoles: ['admin', 'capataz']
  },
  {
    title: "CAMIONEROS",
    icon: <Truck className="w-8 h-8" />,
    path: '/consolidado/camioneros',
    description: "Resumen de viajes de transporte",
    allowedRoles: ['admin', 'camionero']
  }
];

const ConsolidadoScreen: React.FC = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') || '';

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
        {/* Título principal */}
        <div className="flex flex-col items-center mt-6 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-2 text-center font-rio">
            Consolidado de Datos
          </h2>
          <p className="text-green-800 text-lg text-center max-w-2xl mb-6">
            Accede a los reportes y análisis consolidados de animales, subastas, bodegas y transportes de la empresa.
          </p>
        </div>
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto px-6 py-8">
          {cardData.map((card) => (
            <div
              key={card.title}
              className={`bg-white bg-opacity-90 border-2 border-green-700 rounded-2xl p-8 shadow-lg flex flex-col items-center w-full min-h-[260px] mb-4 md:mb-0 hover:scale-105 transition-transform duration-200 ${card.allowedRoles.includes(userRole) ? 'cursor-pointer' : ''}`}
              onClick={() => card.allowedRoles.includes(userRole) && navigate(card.path)}
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
};

export default ConsolidadoScreen; 