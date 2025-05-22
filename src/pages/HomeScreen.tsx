import { motion } from "framer-motion";
import { Tractor, Hammer, BarChart, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomeScreen() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "LAS FINCAS",
      icon: <Tractor size={40} className="text-white" />,
      path: "/fincas",
      description: "HERMOSA EMPRESA FAMILIAR",
    },
    {
      title: "SUBASTAS",
      icon: <Hammer size={40} className="text-white" />,
      path: "/subastas",
      description: "Gestión de subastas de ganado",
    },
    {
      title: "Consolidado de Datos",
      icon: <BarChart size={40} className="text-white" />,
      path: "/consolidado",
      description: "Reportes y análisis completos",
    },
  ];

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
          onClick={() => {
            localStorage.removeItem("idToken");
            navigate("/login");
          }}
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
