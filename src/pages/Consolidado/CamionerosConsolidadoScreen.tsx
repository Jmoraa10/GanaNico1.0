import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Home, X, DollarSign } from "lucide-react";
import { transporteService } from "../../services/transporteService";
import { ViajeTransporte } from "../../types/Transporte";

const CARDS: { key: keyof Resumen; label: string; color: string; icon: JSX.Element | null }[] = [
  { 
    key: "total", 
    label: "Total de Viajes", 
    color: "bg-blue-100 border-blue-400 text-blue-900",
    icon: null
  },
  { 
    key: "gastos", 
    label: "Total de Gastos", 
    color: "bg-green-100 border-green-400 text-green-900",
    icon: <DollarSign size={24} className="mb-2" />
  }
];

type ResumenTotal = {
  total: number;
  detalle: {
    fecha: string;
    camionero: string;
    trayecto: string;
  }[];
};

type ResumenGastos = {
  total: number;
  detalle: {
    concepto: string;
    total: number;
  }[];
};

type Resumen = {
  total: ResumenTotal;
  gastos: ResumenGastos;
};

export default function CamionerosConsolidadoScreen() {
  const navigate = useNavigate();
  const [viajes, setViajes] = useState<ViajeTransporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | {
    key: keyof Resumen;
    label: string;
    detalle: any[];
    total: number;
  }>(null);

  useEffect(() => {
    transporteService.obtenerViajes()
      .then(setViajes)
      .catch(() => setError("Error al cargar viajes"))
      .finally(() => setLoading(false));
  }, []);

  // Calcular totales globales y gastos
  const resumen: Resumen = {
    total: {
      total: viajes.length,
      detalle: viajes.map(viaje => ({
        fecha: new Date(viaje.horaInicio).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        camionero: viaje.camionero,
        trayecto: `${viaje.origen} → ${viaje.destino}`
      }))
    },
    gastos: {
      total: viajes.reduce((total, viaje) => 
        total + viaje.gastos.diesel + viaje.gastos.peajes + viaje.gastos.viaticos, 0),
      detalle: [
        {
          concepto: 'Diesel',
          total: viajes.reduce((total, viaje) => total + viaje.gastos.diesel, 0)
        },
        {
          concepto: 'Peajes',
          total: viajes.reduce((total, viaje) => total + viaje.gastos.peajes, 0)
        },
        {
          concepto: 'Viáticos',
          total: viajes.reduce((total, viaje) => total + viaje.gastos.viaticos, 0)
        }
      ]
    }
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

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
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 px-4 pb-10">
          {CARDS.map(card => (
            <div
              key={card.key}
              className={`${card.color} border-2 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer`}
              onClick={() => setModal({ 
                key: card.key, 
                label: card.label, 
                detalle: resumen[card.key].detalle, 
                total: resumen[card.key].total 
              })}
            >
              {card.icon}
              <h3 className="text-lg font-bold mb-2 text-center font-rio">{card.label}</h3>
              <p className="text-2xl font-extrabold mb-1">
                {card.key === 'gastos' ? formatearMoneda(resumen[card.key].total) : resumen[card.key].total}
              </p>
              <p className="text-gray-700 text-sm">
                {card.key === 'gastos' ? 'Total de gastos' : 'Total de viajes'}
              </p>
            </div>
          ))}
        </div>
        {/* Modal de detalle */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                onClick={() => setModal(null)}
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold text-green-800 mb-4 text-center font-rio">{modal.label}</h3>
              <p className="text-green-700 text-center mb-4 font-semibold">
                {modal.key === 'gastos' ? formatearMoneda(modal.total) : `Total: ${modal.total}`}
              </p>
              <div className="max-h-[60vh] overflow-y-auto">
                {modal.key === 'total' ? (
                  <ul className="divide-y divide-green-200">
                    {modal.detalle.map((d, index) => (
                      <li key={index} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-green-900">{d.camionero}</span>
                          <span className="text-sm text-gray-600">{d.fecha}</span>
                          <span className="text-sm text-blue-600">{d.trayecto}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="divide-y divide-green-200">
                    {modal.detalle.map((gasto, index) => (
                      <li key={index} className="py-3 flex justify-between items-center">
                        <span className="font-medium text-green-900">{gasto.concepto}</span>
                        <span className="font-bold text-green-700">{formatearMoneda(gasto.total)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {modal.detalle.length === 0 && (
                <p className="text-center text-gray-500">No hay datos disponibles.</p>
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