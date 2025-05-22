import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Home, X } from "lucide-react";
import { subastaService, Subasta, Movimiento } from "../../services/subastaService";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CARDS = [
  { key: "ventas", label: "Ventas", color: "bg-blue-100 border-blue-400 text-blue-900" },
  { key: "compras", label: "Compras", color: "bg-green-100 border-green-400 text-green-900" },
  { key: "pagos", label: "Pagos o Abonos", color: "bg-purple-100 border-purple-400 text-purple-900" },
  { key: "cobros", label: "Cobros de Subasta", color: "bg-yellow-100 border-yellow-400 text-yellow-900" },
  { key: "balance", label: "Balance", color: "bg-gray-100 border-gray-400 text-gray-900" },
];

function calcularLinea(linea: any) {
  const pesoTotal = Number(linea.pesoTotal) || 0;
  const valorBase = Number(linea.valorBase) || 0;
  const valorCobro = Number(linea.porcentajeSubasta) || 0;
  const valorTotal = pesoTotal * valorBase;
  const valorTotalMov = valorTotal - valorCobro;
  return { valorTotalMov };
}

async function imprimirDetalleSubasta({ label, total, detalle }: { label: string; total: number; detalle: { subasta: string; valor: number }[] }) {
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
  doc.text(`Total: $${total.toLocaleString('es-CO')}`, 10, 58);

  autoTable(doc, {
    startY: 65,
    head: [['Subasta', 'Valor']],
    body: detalle.map((d) => [d.subasta, `$${d.valor.toLocaleString('es-CO')}`]),
    margin: { left: 10, right: 10 },
    styles: { fontSize: 11, cellPadding: 2 },
    headStyles: { fillColor: [34, 197, 94], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  doc.autoPrint();
  const pdfBlob = doc.output('bloburl');
  window.open(pdfBlob, '_blank');
}

export default function SubastasConsolidadoScreen() {
  const navigate = useNavigate();
  const [subastas, setSubastas] = useState<Subasta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<null | { key: string; label: string; detalle: { subasta: string; valor: number }[]; total: number }>(null);

  useEffect(() => {
    subastaService.getAllSubastas()
      .then(setSubastas)
      .catch(() => setError("Error al cargar subastas"))
      .finally(() => setLoading(false));
  }, []);

  // Calcular totales globales y por subasta
  const resumen: Record<string, { total: number; detalle: { subasta: string; valor: number }[] }> = {
    ventas: { total: 0, detalle: [] },
    compras: { total: 0, detalle: [] },
    pagos: { total: 0, detalle: [] },
    cobros: { total: 0, detalle: [] },
    balance: { total: 0, detalle: [] },
  };

  subastas.forEach((sub) => {
    let ventas = 0, compras = 0, pagos = 0, cobros = 0;
    (sub.historialMovimientos || []).forEach((mov: Movimiento) => {
      if (mov.tipoMovimiento === "venta") ventas += calcularLinea(mov).valorTotalMov;
      if (mov.tipoMovimiento === "compra") compras += calcularLinea(mov).valorTotalMov;
      if (mov.tipoMovimiento === "pago") pagos += Number(mov.valor) || 0;
      cobros += Number(mov.porcentajeSubasta) || 0;
    });
    const balance = ventas + pagos - (compras + cobros);
    resumen.ventas.total += ventas;
    resumen.compras.total += compras;
    resumen.pagos.total += pagos;
    resumen.cobros.total += cobros;
    resumen.balance.total += balance;
    resumen.ventas.detalle.push({ subasta: sub.nombre, valor: ventas });
    resumen.compras.detalle.push({ subasta: sub.nombre, valor: compras });
    resumen.pagos.detalle.push({ subasta: sub.nombre, valor: pagos });
    resumen.cobros.detalle.push({ subasta: sub.nombre, valor: cobros });
    resumen.balance.detalle.push({ subasta: sub.nombre, valor: balance });
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
            Consolidado de Subastas
          </h2>
          <p className="text-green-800 text-lg text-center max-w-2xl mb-6">
            Aquí verás el resumen y análisis global de todas las subastas realizadas en la empresa.
          </p>
        </div>
        {/* Cards de resumen */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-4 pb-10">
          {CARDS.map(card => (
            <div
              key={card.key}
              className={`${card.color} border-2 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer`}
              onClick={() => setModal({ key: card.key, label: card.label, detalle: resumen[card.key].detalle, total: resumen[card.key].total })}
            >
              <h3 className="text-lg font-bold mb-2 text-center font-rio">{card.label}</h3>
              <p className="text-2xl font-extrabold mb-1">${resumen[card.key].total.toLocaleString('es-CO')}</p>
              <p className="text-gray-700 text-sm">Total global</p>
            </div>
          ))}
        </div>
        {/* Modal de detalle por subasta */}
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                onClick={() => setModal(null)}
              >
                <X size={24} />
              </button>
              <h3 className="text-xl font-bold mb-4 text-center font-rio">{modal.label}</h3>
              <p className="text-center mb-2 font-semibold">Total: ${modal.total.toLocaleString('es-CO')}</p>
              <ul className="divide-y divide-green-200 mb-4">
                {modal.detalle.map((d) => (
                  <li key={d.subasta} className="py-2 flex justify-between items-center">
                    <span className="font-medium">{d.subasta}</span>
                    <span className="font-bold">${d.valor.toLocaleString('es-CO')}</span>
                  </li>
                ))}
              </ul>
              {modal.detalle.length === 0 && (
                <p className="text-center text-gray-500">No hay datos de este tipo en ninguna subasta.</p>
              )}
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl transition-colors duration-300 shadow-md font-bold"
                onClick={() => imprimirDetalleSubasta(modal)}
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