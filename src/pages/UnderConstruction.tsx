import { motion } from "framer-motion";
import { Construction, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UnderConstruction() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-32 h-32 mx-auto"
          >
            <Construction size={128} className="text-green-600" />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-green-800 mb-4"
        >
          Pastoreando código... (las vacas son lentas para programar)
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl text-gray-600 mb-8"
        >
          Le pedimos ayuda a una gallina... y aún está picoteando el código
        </motion.p>

        <div className="flex items-center justify-center gap-4 mb-8">
          <Clock size={24} className="text-green-600 animate-spin-slow" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600"
          >
            Disponible cuando las vacas vuelen (spoiler: ya entrenamos una)
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-300 cursor-pointer"
          onClick={() => navigate('/home')}
        >
          ¡Sálvese quien pueda! (Volver al inicio)
        </motion.div>
      </motion.div>
    </div>
  );
}
