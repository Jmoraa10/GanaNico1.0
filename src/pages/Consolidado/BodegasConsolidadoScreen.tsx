import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Home, X } from "lucide-react";
import { useFincas } from "../../hooks/useFincas";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BodegasConsolidadoScreen() {
  const navigate = useNavigate();
  const { fincas, loading, error } = useFincas();
  const [modal, setModal] = useState<null | { nombre: string; total: number; detalle: { finca: string; cantidad: number; esFaltante: boolean }[] }>(null);

  // Agrupar todos los items de todas las fincas por nombre
  const itemsMap: Record<string, { total: number; faltante: boolean; detalle: { finca: string; cantidad: number; esFaltante: boolean }[] }> = {};
  fincas.forEach(finca => {
    (["suministros", "veterinarios"] as (keyof typeof finca.bodega)[]).forEach((tipo) => {
      finca.bodega[tipo].forEach(item => {
        if (!itemsMap[item.nombre]) {
          itemsMap[item.nombre] = { total: 0, faltante: false, detalle: [] };
        }
        itemsMap[item.nombre].total += item.cantidad;
        if (item.esFaltante) itemsMap[item.nombre].faltante = true;
        itemsMap[item.nombre].detalle.push({ finca: finca.nombre, cantidad: item.cantidad, esFaltante: item.esFaltante });
      });
    });
  });
  const itemsList = Object.entries(itemsMap).map(([nombre, data]) => ({ nombre, ...data }));

  async function imprimirDetalleBodega({ nombre, total, detalle }: { nombre: string; total: number; detalle: { finca: string; cantidad: number; esFaltante: boolean }[] }) {
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
    doc.text(nombre, 10, 50);
    doc.setFontSize(12);
    doc.text(`Total: ${total}`, 10, 58);

    autoTable(doc, {
      startY: 65,
      head: [['Finca', 'Cantidad', 'Faltante']],
      body: detalle.map((d) => [d.finca, d.cantidad, d.esFaltante ? 'Sí' : 'No']),
      margin: { left: 10, right: 10 },
      styles: { fontSize: 11, cellPadding: 2 },
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      didParseCell: function (data) {
        if (data.row.index !== undefined && detalle[data.row.index]?.esFaltante && data.column.index === 2) {
          data.cell.styles.textColor = [220, 38, 38]; // rojo
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    doc.autoPrint();
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob, '_blank');
  }

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
            Consolidado de Bodegas
          </h2>
          <p className="text-green-800 text-lg text-center max-w-2xl mb-6">
            Aquí verás el resumen y análisis global de todas las bodegas de la empresa.
          </p>
        </div>
        {/* Lista de items */}
        <div className="flex-1 w-full max-w-3xl mx-auto px-4 pb-10">
          <ul className="space-y-6">
            {itemsList.length === 0 && (
              <li className="text-center text-2xl text-gray-400 py-16">No hay items registrados en las bodegas.</li>
            )}
            {itemsList.map(item => (
              <li
                key={item.nombre}
                className={`flex justify-between items-center px-8 py-6 rounded-2xl shadow-lg bg-white text-2xl font-bold tracking-wide cursor-pointer border-2 ${item.faltante ? 'border-red-500' : 'border-green-400'} hover:scale-105 transition-transform duration-200`}
                onClick={() => setModal(item)}
              >
                <span className={item.faltante ? 'text-red-700' : 'text-green-900'}>{item.nombre}</span>
                <span className={item.faltante ? 'text-red-700' : 'text-green-900'}>Total: {item.total}</span>
              </li>
            ))}
          </ul>
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
              <h3 className="text-2xl font-bold mb-4 text-center font-rio">{modal.nombre}</h3>
              <p className="text-center mb-2 font-semibold text-xl">Total: {modal.total}</p>
              <ul className="divide-y divide-green-200 mb-4">
                {modal.detalle.map((d) => (
                  <li key={d.finca} className={`py-3 flex justify-between items-center ${d.esFaltante ? 'text-red-700 font-bold' : 'text-green-900'}`}>
                    <span>{d.finca}</span>
                    <span>{d.cantidad} {d.esFaltante && <span className="ml-2 text-xs bg-red-200 px-2 py-1 rounded">Faltante</span>}</span>
                  </li>
                ))}
              </ul>
              {modal.detalle.length === 0 && (
                <p className="text-center text-gray-500">No hay este item en ninguna finca.</p>
              )}
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-xl transition-colors duration-300 shadow-md font-bold"
                onClick={() => imprimirDetalleBodega(modal)}
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