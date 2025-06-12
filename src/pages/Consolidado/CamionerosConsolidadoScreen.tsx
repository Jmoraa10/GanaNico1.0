import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Home, X } from "lucide-react";
import { transporteService } from "../../services/transporteService";
import { ViajeTransporte } from "../../types/Transporte";

const CARDS = [
  { key: "total", label: "Total de Viajes", color: "bg-blue-100 border-blue-400 text-blue-900" },
  { key: "enCurso", label: "Viajes en Curso", color: "bg-yellow-100 border-yellow-400 text-yellow-900" },
  { key: "culminados", label: "Viajes Culminados", color: "bg-green-100 border-green-400 text-green-900" },
  { key: "pendientes", label: "Viajes Pendientes", color: "bg-red-100 border-red-400 text-red-900" },
];

export default function CamionerosConsolidadoScreen() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<ViajeTransporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { key: string; label: string; detalle: { viaje: string; estado: string }[]; total: number }>(null);

  useEffect(() => {
    transporteService.obtenerViajes()
      .then(setViajes)
      .catch(() => setError("Error al cargar viajes"))
      .finally(() => setLoading(false));
  }, []);

  // Calcular totales globales y por estado
  const resumen: Record<string, { total: number; detalle: { viaje: string; estado: string }[] }> = {
    total: { total: viajes.length, detalle: [] },
    enCurso: { total: 0, detalle: [] },
    culminados: { total: 0, detalle: [] },
    pendientes: { total: 0, detalle: [] },
  };

  viajes.forEach(viaje => {
    // Agregar al detalle del total
    resumen.total.detalle.push({
      viaje: `Viaje ${viaje._id}`,
      estado: viaje.estado
    });

    // Agregar al detalle del estado correspondiente
    if (viaje.estado === 'EN_CURSO') {
      resumen.enCurso.total++;
      resumen.enCurso.detalle.push({
        viaje: `Viaje ${viaje._id}`,
        estado: viaje.estado
      });
    } else if (viaje.estado === 'CULMINADO') {
      resumen.culminados.total++;
      resumen.culminados.detalle.push({
        viaje: `Viaje ${viaje._id}`,
        estado: viaje.estado
      });
    } else {
      resumen.pendientes.total++;
      resumen.pendientes.detalle.push({
        viaje: `Viaje ${viaje._id}`,
        estado: viaje.estado
      });
    }
  });

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
        <div className="flex flex-col md:flex-row justify-between items-center px-6 pt-4 gap-4">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-xl transition-colors duration-300 shadow-md"
          >
            <Home size={20} />
            Regresar a Home
          </button>
          <button
            onClick={() => navigate("/consolidado")}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-xl transition-colors duration-300 shadow-md"
          >
            <Home size={20} />
            Regresar a Consolidados
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
        {/* Título */}
        <div className="flex flex-col items-center mt-6 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-green-900 mb-2 text-center font-rio">
            Consolidado de Transportes
          </h2>
          <p className="text-green-800 text-lg text-center max-w-2xl mb-6">
            Aquí verás el resumen y análisis global de todos los viajes de transporte.
          </p>
        </div>
        {/* Cards de resumen */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-4 pb-10">
          {CARDS.map(card => (
            <div
              key={card.key}
              className={`${card.color} border-2 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer`}
              onClick={() => setModal({ key: card.key, label: card.label, detalle: resumen[card.key].detalle, total: resumen[card.key].total })}
            >
              <h3 className="text-lg font-bold mb-2 text-center font-rio">{card.label}</h3>
              <p className="text-2xl font-extrabold mb-1">{resumen[card.key].total}</p>
              <p className="text-gray-700 text-sm">Total de viajes</p>
            </div>
          ))}
        </div>
        {/* Modal de detalle */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                onClick={() => setModal(null)}
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center font-rio">{modal.label}</h3>
              <p className="text-green-700 text-center mb-2 font-semibold">Total: {modal.total}</p>
              <ul className="divide-y divide-green-200 mb-4">
                {modal.detalle.map((d, index) => (
                  <li key={index} className="py-2 flex justify-between items-center">
                    <span className="font-medium text-green-900">{d.viaje}</span>
                    <span className="font-bold text-green-700">{d.estado}</span>
                  </li>
                ))}
              </ul>
              {modal.detalle.length === 0 && (
                <p className="text-center text-gray-500">No hay viajes en este estado.</p>
              )}
            </div>
          </div>
        )}
        {/* Loading y error */}
        {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-xl shadow-lg p-8 text-green-800 font-bold">Cargando consolidado...</div>
          </div>
        )}
        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-xl shadow-lg p-8 text-red-700 font-bold">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
} 