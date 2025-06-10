import { motion } from "framer-motion";
import { Tractor, Hammer, BarChart, LogOut, Calendar, Truck, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLogout } from '../hooks/useLogout';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logout = useLogout();

  console.log('Usuario actual en HomeScreen:', user);

  const allCards = [
    {
      title: "LAS FINCAS",
      icon: <Tractor size={40} className="text-white" />,
      path: "/fincas",
      description: "HERMOSA EMPRESA FAMILIAR",
      allowedRoles: ['admin', 'capataz']
    },
    {
      title: "SUBASTAS",
      icon: <Hammer size={40} className="text-white" />,
      path: "/subastas",
      description: "Gestión de subastas de ganado",
      allowedRoles: ['admin']
    },
    {
      title: "Consolidado de Datos",
      icon: <BarChart size={40} className="text-white" />,
      path: "/consolidado",
      description: "Reportes y análisis completos",
      allowedRoles: ['admin']
    },
    {
      title: "AGENDA",
      icon: <Calendar size={40} className="text-white" />,
      path: "/agenda",
      description: "Gestión de eventos y actividades",
      allowedRoles: ['admin']
    },
    {
      title: "CAMIONEROS",
      icon: <Truck size={40} className="text-white" />,
      path: "/camioneros",
      description: "Gestión de transportistas",
      allowedRoles: ['admin']
    },
  ];

  // Agregar la card de Crear Usuario solo para admin
  if (user?.role === 'admin') {
    allCards.push({
      title: "CREAR USUARIO",
      icon: <UserPlus size={40} className="text-white" />,
      path: "/create-user",
      description: "Registrar un nuevo usuario en el sistema",
      allowedRoles: ['admin']
    });
  }

  // Filtrar las cards según el rol del usuario
  const cards = allCards.filter(card => {
    const hasAccess = card.allowedRoles.includes(user?.role || 'capataz');
    console.log(`Card ${card.title}: ${hasAccess ? 'visible' : 'oculta'} para rol ${user?.role}`);
    return hasAccess;
  });

  console.log('Cards filtradas:', cards);

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex flex-col justify-between font-rio"
      style={{
        backgroundImage: "url('/homescreen.png')",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-4">
        <h1 className="text-2xl md:text-3xl font-rio text-green-900">
          EMPRESA GANADERA FAMILIAR
        </h1>
        <motion.button
          onClick={logout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl transition-colors duration-300 shadow-md"
          whileHover={{ scale: 1.05 }}
        >
          <LogOut size={20} />
          Cerrar sesión
        </motion.button>
      </div>

      {/* Título principal */}
      <div className="w-full text-center mt-4 px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-rio text-green-800 drop-shadow-md"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          INVERSIONES BONITO VIENTO SAS
        </motion.h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto px-6 py-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            className="bg-green-900 bg-opacity-40 border-4 border-green-800 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.2, duration: 0.5 }}
            onClick={() => navigate(card.path)}
          >
            <div className="mb-4 p-3 rounded-full bg-green-800">{card.icon}</div>
            <h3 className="text-xl font-bold font-rio text-white text-center mb-2">
              {card.title}
            </h3>
            <p className="text-center text-white">{card.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
