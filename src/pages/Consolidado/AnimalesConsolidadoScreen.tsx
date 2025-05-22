import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Home, X } from "lucide-react";
import { useFincas } from "../../hooks/useFincas";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Definición de los grupos y subgrupos a mostrar
const ANIMAL_GROUPS = [
  {
    group: "machos",
    label: "Machos",
    color: "bg-yellow-100 border-yellow-400",
    subgroups: [
      { key: "levante", label: "Levante" },
      { key: "ceba", label: "Ceba" },
      { key: "criasMachos", label: "Crías Machos", isCrias: true },
      { key: "criasHembras", label: "Crías Hembras", isCrias: true },
    ],
  },
  {
    group: "hembras",
    label: "Hembras",
    color: "bg-yellow-100 border-yellow-400",
    subgroups: [
      { key: "levante", label: "Levante" },
      { key: "vientre", label: "Vientre" },
      { key: "preñadas", label: "Preñadas" },
      { key: "escoteras", label: "Escoteras" },
      { key: "paridas", label: "Paridas (Total)", isParidas: true },
      { key: "paridas.machos", label: "Crías Machos", isParidas: true, subKey: "machos" },
      { key: "paridas.hembras", label: "Crías Hembras", isParidas: true, subKey: "hembras" },
    ],
  },
  {
    group: "bufalos",
    label: "Búfalos Machos",
    color: "bg-blue-100 border-blue-400",
    subgroups: [
      { key: "machos.levante", label: "Levante" },
      { key: "machos.ceba", label: "Ceba" },
      { key: "machos.criasMachos", label: "Crías Machos", isCrias: true },
      { key: "machos.criasHembras", label: "Crías Hembras", isCrias: true },
    ],
  },
  {
    group: "bufalos",
    label: "Búfalas Hembras",
    color: "bg-blue-100 border-blue-400",
    subgroups: [
      { key: "hembras.levante", label: "Levante" },
      { key: "hembras.vientre", label: "Vientre" },
      { key: "hembras.preñadas", label: "Preñadas" },
      { key: "hembras.escoteras", label: "Escoteras" },
      { key: "hembras.paridas", label: "Paridas (Total)", isParidas: true },
      { key: "hembras.paridas.machos", label: "Crías Machos", isParidas: true, subKey: "machos" },
      { key: "hembras.paridas.hembras", label: "Crías Hembras", isParidas: true, subKey: "hembras" },
    ],
  },
  {
    group: "equinos",
    label: "Equinos",
    color: "bg-green-100 border-green-400",
    subgroups: [
      { key: "caballos", label: "Caballos" },
      { key: "yeguas", label: "Yeguas" },
      { key: "potros", label: "Potros/as" },
      { key: "mulas", label: "Mulas" },
      { key: "yeguasParidas", label: "Yeguas Paridas (Total)", isParidas: true },
      { key: "yeguasParidas.machos", label: "Crías Machos", isParidas: true, subKey: "machos" },
      { key: "yeguasParidas.hembras", label: "Crías Hembras", isParidas: true, subKey: "hembras" },
    ],
  },
  {
    group: "otros",
    label: "Otros",
    color: "bg-gray-100 border-gray-400",
    subgroups: [
      { key: "cabras", label: "Cabras" },
      { key: "peces", label: "Peces" },
      { key: "pollos", label: "Pollos" },
      { key: "cabrasParidas", label: "Cabras Paridas (Total)", isParidas: true },
      { key: "cabrasParidas.machos", label: "Crías Machos", isParidas: true, subKey: "machos" },
      { key: "cabrasParidas.hembras", label: "Crías Hembras", isParidas: true, subKey: "hembras" },
    ],
  },
];

function getValueFromPath(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

async function imprimirDetalleAnimal({ label, total, detalle }: { label: string; total: number; detalle: { finca: string; cantidad: number }[] }) {
  const doc = new jsPDF();
  const fechaImpresion = new Date().toLocaleString('es-CO');
  const empresaNombre = 'INVERSIONES BONITO VIENTO SAS';
  const logoUrl = window.location.origin + '/assets/images/logo.png';

  // Logo
  let imgData: string | undefined;
  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const reader = new FileReader();
    imgData = await new Promise<string>((resolve) => {
      reader.onload = function (e) { resolve(e.target?.result as string); };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    imgData = undefined;
  }

  // Encabezado
  if (imgData) {
    doc.addImage(imgData, 'PNG', 10, 10, 30, 30);
  }
  doc.setFontSize(16);
  doc.text(empresaNombre, 50, 20);
  doc.setFontSize(12);
  doc.text(`Fecha impresión: ${fechaImpresion}`, 50, 28);
  doc.setFontSize(13);
  doc.text(label, 10, 50);
  doc.setFontSize(12);
  doc.text(`Total: ${total}`, 10, 58);

  autoTable(doc, {
    startY: 65,
    head: [['Finca', 'Cantidad']],
    body: detalle.map((d) => [d.finca, d.cantidad]),
    margin: { left: 10, right: 10 },
    styles: { fontSize: 11, cellPadding: 2 },
    headStyles: { fillColor: [34, 197, 94], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  // Mostrar el diálogo de impresión en vez de descargar
  doc.autoPrint();
  const pdfBlob = doc.output('bloburl');
  window.open(pdfBlob, '_blank');
}

export default function AnimalesConsolidadoScreen() {
  const navigate = useNavigate();
  const { fincas, loading, error } = useFincas();
  const [modal, setModal] = useState<null | { label: string; total: number; detalle: { finca: string; cantidad: number }[] }>(null);

  // Calcular totales globales y por finca para cada subgrupo
  const animalTotals: { key: string; label: string; total: number; detalle: { finca: string; cantidad: number }[]; color: string }[] = [];

  ANIMAL_GROUPS.forEach(({ group, label, subgroups, color }) => {
    subgroups.forEach((sub) => {
      let total = 0;
      const detalle: { finca: string; cantidad: number }[] = [];
      fincas.forEach((finca) => {
        let cantidad = 0;
        const grupoAnimales = finca.animales[group as keyof typeof finca.animales];
        if ((sub as any).isParidas) {
          // Paridas es un objeto con .total o .machos/.hembras
          if ((sub as any).subKey) {
            const paridas = getValueFromPath(grupoAnimales, sub.key.split('.').slice(0, -1).join('.'));
            cantidad = paridas?.[(sub as any).subKey] ?? 0;
          } else {
            const paridas = getValueFromPath(grupoAnimales, sub.key);
            cantidad = paridas?.total ?? 0;
          }
        } else {
          cantidad = getValueFromPath(grupoAnimales, sub.key) ?? 0;
        }
        if (cantidad > 0) {
          detalle.push({ finca: finca.nombre, cantidad });
        }
        total += cantidad;
      });
      animalTotals.push({ key: `${group}.${sub.key}`, label: `${label} - ${sub.label}`, total, detalle, color });
    });
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
            Consolidado Global de Animales
          </h2>
          <p className="text-green-800 text-lg text-center max-w-2xl mb-6">
            Haz clic en cualquier tipo de animal para ver el desglose por finca.
          </p>
        </div>
        {/* Cards de animales */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 pb-10">
          {animalTotals.map((item) => (
            <div
              key={item.key}
              className={`${item.color} border-2 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer`}
              onClick={() => item.total > 0 && setModal(item)}
            >
              <h3 className="text-lg font-bold text-green-800 mb-2 text-center font-rio">
                {item.label}
              </h3>
              <p className="text-3xl font-extrabold text-green-900 mb-1">{item.total}</p>
              <p className="text-green-700 text-sm">Total en todas las fincas</p>
            </div>
          ))}
        </div>
        {/* Modal de detalle por finca */}
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
                {modal.detalle.map((d) => (
                  <li key={d.finca} className="py-2 flex justify-between items-center">
                    <span className="font-medium text-green-900">{d.finca}</span>
                    <span className="font-bold text-green-700">{d.cantidad}</span>
                  </li>
                ))}
              </ul>
              {modal.detalle.length === 0 && (
                <p className="text-center text-gray-500">No hay animales de este tipo en ninguna finca.</p>
              )}
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl transition-colors duration-300 shadow-md font-bold"
                onClick={() => imprimirDetalleAnimal(modal)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18v4h12v-4M6 14h12M6 10h12" /></svg>
                Imprimir
              </button>
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