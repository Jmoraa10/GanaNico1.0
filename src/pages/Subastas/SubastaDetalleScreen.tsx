import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, LogOut, ArrowLeft, MapPin, PlusCircle, Trash2, ChevronDown, Printer } from 'lucide-react';
import { subastaService, Subasta, Movimiento } from '../../services/subastaService';

const TIPO_OPCIONES = [
  { grupo: 'Bovinos', opciones: [
    { label: 'Machos Levante', value: 'ML' },
    { label: 'Machos Ceba', value: 'MC' },
    { label: 'Hembras Levante', value: 'HL' },
    { label: 'Hembra Vientre', value: 'HV' },
    { label: 'Vaca Escotera', value: 'VE' },
    { label: 'Vacas Paridas', value: 'VP' },
  ]},
  { grupo: 'Bufalinos', opciones: [
    { label: 'Machos Levante', value: 'ML' },
    { label: 'Machos Ceba', value: 'MC' },
    { label: 'Hembras Levante', value: 'HL' },
    { label: 'Hembra Vientre', value: 'HV' },
    { label: 'Vaca Escotera', value: 'VE' },
    { label: 'Vacas Paridas', value: 'VP' },
  ]},
];

const initialLinea = (): LineaType => ({
  fecha: new Date().toISOString().slice(0, 10),
  subastaNumero: '',
  grupo: 'Bovinos',
  tipo: '',
  tipoDetalle: { criasMacho: 0, criasHembra: 0 },
  cantidad: 0,
  pesoTotal: 0,
  valorBase: 0,
  porcentajeSubasta: 0,
  procedencia: '',
  destino: '',
});

interface PagoType {
  fecha: string;
  valor: number;
  descripcion: string;
}

const initialPago = (): PagoType => ({
  fecha: new Date().toISOString().slice(0, 10),
  valor: 0,
  descripcion: '',
});

interface LineaType {
  fecha: string;
  subastaNumero: string;
  grupo: 'Bovinos' | 'Bufalinos';
  tipo: string;
  tipoDetalle: {
    criasMacho: number;
    criasHembra: number;
  };
  cantidad: number;
  pesoTotal: number;
  valorBase: number;
  porcentajeSubasta: number;
  procedencia: string;
  destino: string;
}

function calcularLinea(linea: LineaType | Movimiento) {
  const cantidad = Number(linea.cantidad) || 0;
  const pesoTotal = Number(linea.pesoTotal) || 0;
  const valorBase = Number(linea.valorBase) || 0;
  const valorCobro = Number(linea.porcentajeSubasta) || 0;
  const pesoProm = cantidad > 0 ? pesoTotal / cantidad : 0;
  const valorTotal = pesoTotal * valorBase;
  const valorProm = cantidad > 0 ? valorTotal / cantidad : 0;
  const valorTotalMov = valorTotal - valorCobro;
  return { pesoProm, valorTotal, valorProm, valorTotalMov };
}

const Linea = ({ linea, onChange, onRemove, tipo }: { 
  linea: LineaType; 
  onChange: (l: LineaType) => void; 
  onRemove: () => void; 
  tipo: 'venta' | 'compra' 
}) => {
  const { pesoProm, valorTotal, valorProm, valorTotalMov } = calcularLinea(linea);
  const isVacasParidas = linea.tipo === 'VP';
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 w-full">
        <input type="date" className="border rounded px-2 py-1 w-full" value={linea.fecha} onChange={e => onChange({ ...linea, fecha: e.target.value })} />
        <input type="text" className="border rounded px-2 py-1 w-full" placeholder="Subasta N°" value={linea.subastaNumero} onChange={e => onChange({ ...linea, subastaNumero: e.target.value })} />
        <div className="flex flex-col">
          <select className="border rounded px-2 py-1 w-full" value={linea.grupo} onChange={e => onChange({ ...linea, grupo: e.target.value as 'Bovinos' | 'Bufalinos', tipo: '' })}>
            {TIPO_OPCIONES.map(opt => <option key={opt.grupo} value={opt.grupo}>{opt.grupo}</option>)}
          </select>
          <div className="relative mt-1">
            <select className="border rounded px-2 py-1 w-full" value={linea.tipo} onChange={e => onChange({ ...linea, tipo: e.target.value })}>
              <option value="">Tipo</option>
              {TIPO_OPCIONES.find(g => g.grupo === linea.grupo)?.opciones.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        {isVacasParidas && (
          <div className="flex flex-row gap-2 items-center">
            <input type="number" min="0" className="border rounded px-2 py-1 w-full" placeholder="Crias M" value={linea.tipoDetalle.criasMacho} onChange={e => onChange({ ...linea, tipoDetalle: { ...linea.tipoDetalle, criasMacho: Number(e.target.value) } })} />
            <input type="number" min="0" className="border rounded px-2 py-1 w-full" placeholder="Crias H" value={linea.tipoDetalle.criasHembra} onChange={e => onChange({ ...linea, tipoDetalle: { ...linea.tipoDetalle, criasHembra: Number(e.target.value) } })} />
          </div>
        )}
        <input type="number" min="0" className="border rounded px-2 py-1 w-full" placeholder="Cant." value={linea.cantidad} onChange={e => onChange({ ...linea, cantidad: Number(e.target.value) })} />
        <input type="number" min="0" className="border rounded px-2 py-1 w-full" placeholder="P.Total" value={linea.pesoTotal} onChange={e => onChange({ ...linea, pesoTotal: Number(e.target.value) })} />
        <input type="number" className="border rounded px-2 py-1 w-full bg-gray-100" placeholder="P.Prom" value={pesoProm.toFixed(2)} readOnly />
        <input type="number" min="0" className="border rounded px-2 py-1 w-full" placeholder="V.Base" value={linea.valorBase} onChange={e => onChange({ ...linea, valorBase: Number(e.target.value) })} />
        <input type="number" className="border rounded px-2 py-1 w-full bg-gray-100" placeholder="V.Total" value={valorTotal.toFixed(2)} readOnly />
        <input type="number" className="border rounded px-2 py-1 w-full bg-gray-100" placeholder="V.Prom" value={valorProm.toFixed(2)} readOnly />
        <input type="number" min="0" className="border rounded px-2 py-1 w-full" placeholder="Valor Cobro Subasta" value={linea.porcentajeSubasta} onChange={e => onChange({ ...linea, porcentajeSubasta: Number(e.target.value) })} />
        <input type="number" className="border rounded px-2 py-1 w-full bg-gray-100" placeholder="Valor Total" value={valorTotalMov.toFixed(2)} readOnly />
        {tipo === 'venta' ? (
          <input type="text" className="border rounded px-2 py-1 w-full" placeholder="Procedencia" value={linea.procedencia} onChange={e => onChange({ ...linea, procedencia: e.target.value })} />
        ) : (
          <input type="text" className="border rounded px-2 py-1 w-full" placeholder="Destino" value={linea.destino} onChange={e => onChange({ ...linea, destino: e.target.value })} />
        )}
      </div>
      <div className="flex justify-end mt-2">
        <button className="text-red-600 hover:text-red-800" onClick={onRemove}><Trash2 size={20} /></button>
      </div>
    </div>
  );
};

const Card = ({ title, children, color }: { title: string; children: React.ReactNode; color: string }) => (
  <div className={`rounded-2xl shadow-lg p-6 flex flex-col gap-3 bg-${color}-50 border-t-4 border-${color}-400 w-full`} style={{ minHeight: 180 }}>
    <h2 className={`text-lg font-bold text-${color}-700 mb-2`}>{title}</h2>
    <div className="flex-1 flex flex-col gap-2">{children}</div>
  </div>
);

const SubastaDetalleScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [subasta, setSubasta] = useState<Subasta | null>(null);
  const [ventaDraft, setVentaDraft] = useState<LineaType>(initialLinea());
  const [compraDraft, setCompraDraft] = useState<LineaType>(initialLinea());
  const [pagoDraft, setPagoDraft] = useState<PagoType>(initialPago());
  const [detalleMovimiento, setDetalleMovimiento] = useState<Movimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubasta = async () => {
      try {
        if (id) {
          const data = await subastaService.getSubastaById(id);
          setSubasta(data);
        }
      } catch (err) {
        setError('Error al cargar la subasta');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSubasta();
  }, [id]);

  // Actualizar subasta (guardar y redirigir)
  const handleActualizarSubasta = async () => {
    if (!subasta || !subasta._id) return;
    try {
      await subastaService.updateSubasta(subasta._id, subasta);
      alert('Subasta actualizada correctamente');
      navigate('/subastas');
    } catch (err) {
      setError('Error al actualizar la subasta');
      console.error('Error:', err);
    }
  };

  // Guardar venta individual
  const handleGuardarVenta = async () => {
    if (!ventaDraft || !ventaDraft.tipo || !subasta || !subasta._id) return;
    try {
      const movimiento: Movimiento = {
        ...ventaDraft,
        tipoMovimiento: 'venta',
        fechaRegistro: new Date().toISOString(),
        valor: 0,
        descripcion: ''
      };
      const historialMovimientos = [
        ...(subasta.historialMovimientos || []),
        movimiento
      ];
      const updated = await subastaService.updateSubasta(subasta._id, { historialMovimientos });
      setSubasta(updated);
      setVentaDraft(initialLinea());
    } catch (err) {
      setError('Error al guardar la venta');
      console.error('Error:', err);
    }
  };

  // Guardar compra individual
  const handleGuardarCompra = async () => {
    if (!compraDraft || !compraDraft.tipo || !subasta || !subasta._id) return;
    try {
      const movimiento: Movimiento = {
        ...compraDraft,
        tipoMovimiento: 'compra',
        fechaRegistro: new Date().toISOString(),
        valor: 0,
        descripcion: ''
      };
      const historialMovimientos = [
        ...(subasta.historialMovimientos || []),
        movimiento
      ];
      const updated = await subastaService.updateSubasta(subasta._id, { historialMovimientos });
      setSubasta(updated);
      setCompraDraft(initialLinea());
    } catch (err) {
      setError('Error al guardar la compra');
      console.error('Error:', err);
    }
  };

  // Guardar pago individual
  const handleGuardarPago = async () => {
    if (!pagoDraft || !pagoDraft.valor || !subasta || !subasta._id) return;
    try {
      const movimiento: Movimiento = {
        fecha: pagoDraft.fecha,
        subastaNumero: '',
        grupo: 'Bovinos',
        tipo: 'Pago',
        tipoDetalle: { criasMacho: 0, criasHembra: 0 },
        cantidad: 0,
        pesoTotal: 0,
        valorBase: 0,
        porcentajeSubasta: 0,
        procedencia: '',
        destino: '',
        tipoMovimiento: 'pago',
        valor: pagoDraft.valor,
        descripcion: pagoDraft.descripcion,
        fechaRegistro: new Date().toISOString()
      };
      const historialMovimientos = [
        ...(subasta.historialMovimientos || []),
        movimiento
      ];
      const updated = await subastaService.updateSubasta(subasta._id, { historialMovimientos });
      setSubasta(updated);
      setPagoDraft(initialPago());
    } catch (err) {
      setError('Error al guardar el pago');
      console.error('Error:', err);
    }
  };

  const handleImprimir = (movimiento: Movimiento) => {
    const ventana = window.open('', '_blank');
    if (!ventana) return;

    const fecha = new Date().toLocaleDateString('es-CO');
    const hora = new Date().toLocaleTimeString('es-CO');

    const contenido = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Movimiento de Subasta</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo {
              max-width: 150px;
              margin-bottom: 10px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
            }
            .info-section {
              margin: 20px 0;
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/assets/images/logo.png" alt="Logo" class="logo">
            <div class="title">Bonito Viento</div>
            <div class="subtitle">Sistema de Gestión Ganadera</div>
          </div>

          <div class="info-section">
            <div class="info-row">
              <span class="info-label">Tipo de Movimiento:</span>
              <span>${movimiento.tipoMovimiento?.toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Fecha:</span>
              <span>${new Date(movimiento.fechaRegistro).toLocaleString('es-CO')}</span>
            </div>
            ${movimiento.tipoMovimiento === 'pago' ? `
              <div class="info-row">
                <span class="info-label">Valor del Pago:</span>
                <span>$${Number(movimiento.valor).toLocaleString('es-CO')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Descripción:</span>
                <span>${movimiento.descripcion}</span>
              </div>
            ` : `
              <div class="info-row">
                <span class="info-label">Subasta N°:</span>
                <span>${movimiento.subastaNumero}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tipo:</span>
                <span>${movimiento.tipo}</span>
              </div>
              ${movimiento.tipoMovimiento === 'venta' ? `
                <div class="info-row">
                  <span class="info-label">Procedencia:</span>
                  <span>${movimiento.procedencia}</span>
                </div>
              ` : ''}
              ${movimiento.tipoMovimiento === 'compra' ? `
                <div class="info-row">
                  <span class="info-label">Destino:</span>
                  <span>${movimiento.destino}</span>
                </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Cantidad:</span>
                <span>${movimiento.cantidad}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Peso Total:</span>
                <span>${movimiento.pesoTotal}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Peso Promedio:</span>
                <span>${calcularLinea(movimiento).pesoProm.toLocaleString('es-CO')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Valor Base:</span>
                <span>${movimiento.valorBase}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Valor Cobro Subasta:</span>
                <span>${movimiento.porcentajeSubasta}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Valor Total:</span>
                <span>$${calcularLinea(movimiento).valorTotal.toLocaleString('es-CO')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Valor Promedio:</span>
                <span>$${calcularLinea(movimiento).valorProm.toLocaleString('es-CO')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Valor Total Movimiento:</span>
                <span>$${calcularLinea(movimiento).valorTotalMov.toLocaleString('es-CO')}</span>
              </div>
              ${movimiento.tipo === 'VP' ? `
                <div class="info-row">
                  <span class="info-label">Crías Macho:</span>
                  <span>${movimiento.tipoDetalle?.criasMacho || 0}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Crías Hembra:</span>
                  <span>${movimiento.tipoDetalle?.criasHembra || 0}</span>
                </div>
              ` : ''}
            `}
          </div>

          <div class="footer">
            <div>Documento generado el ${fecha} a las ${hora}</div>
            <div>Bonito Viento - Sistema de Gestión Ganadera</div>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Imprimir
            </button>
          </div>
        </body>
      </html>
    `;

    ventana.document.write(contenido);
    ventana.document.close();
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Cargando subasta...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!subasta) return <div className="p-8 text-center text-gray-600">Subasta no encontrada</div>;

  const nombre = subasta.nombre;
  const ubicacion = subasta.ubicacion;

  // Calcular totales
  const totalVentas = (subasta.historialMovimientos || [])
    .filter((m: any) => m.tipoMovimiento === 'venta')
    .reduce((acc: number, l: any) => acc + calcularLinea(l).valorTotalMov, 0);

  const totalCompras = (subasta.historialMovimientos || [])
    .filter((m: any) => m.tipoMovimiento === 'compra')
    .reduce((acc: number, l: any) => acc + calcularLinea(l).valorTotalMov, 0);

  const totalPagos = (subasta.historialMovimientos || [])
    .filter((m: any) => m.tipoMovimiento === 'pago')
    .reduce((acc: number, l: any) => acc + (Number(l.valor) || 0), 0);

  const totalCobro = (subasta.historialMovimientos || [])
    .reduce((acc: number, l: any) => acc + (Number(l.porcentajeSubasta) || 0), 0);

  const balance = totalVentas + totalPagos - (totalCompras + totalCobro);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center p-6 font-rio"
      style={{
        backgroundImage: "url('/assets/images/subasta.png')",
        backgroundBlendMode: 'overlay',
        backgroundColor: 'rgba(255,255,255,0.7)',
      }}
    >
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6 bg-opacity-90">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/subastas')}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <ArrowLeft size={18} /> Volver a Subastas
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Home size={18} /> Home
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleActualizarSubasta}
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-bold shadow"
            >
              Actualizar Subasta
            </button>
          </div>
        </div>
        {/* Encabezado de la subasta */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2">{nombre}</h1>
          <div className="flex items-center justify-center gap-2 text-lg text-blue-700 mb-2">
            <MapPin size={20} />
            <span>{ubicacion}</span>
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <Card title="Ventas" color="blue">
            <div className="flex flex-col gap-2">
              {/* Draft de nueva venta */}
              <Linea
                linea={ventaDraft}
                onChange={setVentaDraft}
                onRemove={() => setVentaDraft(initialLinea())}
                tipo="venta"
              />
              <button
                className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold mt-2 border border-blue-600 px-3 py-1 rounded"
                onClick={handleGuardarVenta}
              >
                <PlusCircle size={20} /> Guardar Venta
              </button>
            </div>
            <div className="text-right text-blue-800 font-bold mt-2">Total Ventas: ${totalVentas.toLocaleString('es-CO')}</div>
          </Card>

          <Card title="Compras" color="green">
            <div className="flex flex-col gap-2">
              {/* Draft de nueva compra */}
              <Linea
                linea={compraDraft}
                onChange={setCompraDraft}
                onRemove={() => setCompraDraft(initialLinea())}
                tipo="compra"
              />
              <button
                className="flex items-center gap-2 text-green-700 hover:text-green-900 font-semibold mt-2 border border-green-600 px-3 py-1 rounded"
                onClick={handleGuardarCompra}
              >
                <PlusCircle size={20} /> Guardar Compra
              </button>
            </div>
            <div className="text-right text-green-800 font-bold mt-2">Total Compras: ${totalCompras.toLocaleString('es-CO')}</div>
          </Card>

          <Card title="Pagos o Abonos" color="purple">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="date"
                  className="border rounded px-2 py-1 w-full"
                  value={pagoDraft.fecha}
                  onChange={e => setPagoDraft({ ...pagoDraft, fecha: e.target.value })}
                />
                <input
                  type="number"
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Valor"
                  value={pagoDraft.valor}
                  onChange={e => setPagoDraft({ ...pagoDraft, valor: Number(e.target.value) })}
                />
                <input
                  type="text"
                  className="border rounded px-2 py-1 w-full"
                  placeholder="Descripción"
                  value={pagoDraft.descripcion}
                  onChange={e => setPagoDraft({ ...pagoDraft, descripcion: e.target.value })}
                />
              </div>
              <button
                className="flex items-center gap-2 text-purple-700 hover:text-purple-900 font-semibold mt-2 border border-purple-600 px-3 py-1 rounded"
                onClick={handleGuardarPago}
              >
                <PlusCircle size={20} /> Guardar Pago
              </button>
            </div>
            <div className="text-right text-purple-800 font-bold mt-2">Total Pagos: ${totalPagos.toLocaleString('es-CO')}</div>
          </Card>

          <Card title="Cobro de Subasta" color="yellow">
            <div className="text-2xl font-semibold text-yellow-800">${totalCobro.toLocaleString('es-CO')}</div>
            <div className="text-sm text-yellow-600">Suma de los valores de cobro de subasta de todas las ventas y compras.</div>
          </Card>

          <Card title="Balance" color="gray">
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>${balance.toLocaleString('es-CO')}</div>
            <div className="text-sm text-gray-600">Balance = Ventas + Pagos - (Compras + Cobro de Subasta)</div>
          </Card>
        </div>
        {/* Historial de movimientos de subasta */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Movimientos de Subasta</h2>
          <div className="bg-gray-50 rounded-lg p-4 shadow-inner">
            {(subasta.historialMovimientos || []).length === 0 ? (
              <p className="text-gray-500 italic">No hay movimientos registrados aún.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {subasta.historialMovimientos.map((mov: any, idx: number) => (
                  <li key={idx} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <span className={`font-bold ${mov.tipoMovimiento === 'venta' ? 'text-blue-700' : mov.tipoMovimiento === 'compra' ? 'text-green-700' : 'text-purple-700'}`}>{mov.tipoMovimiento?.toUpperCase()}</span>
                      <span className="ml-2 text-gray-700">{mov.tipo || (mov.tipoMovimiento === 'pago' ? 'Pago' : '')}</span>
                      <span className="ml-2 text-gray-500 text-xs">{new Date(mov.fechaRegistro).toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm items-center">
                      {mov.tipoMovimiento === 'pago' ? (
                        <>
                          <span>Valor: <b>${Number(mov.valor).toLocaleString('es-CO')}</b></span>
                          <span>Descripción: <b>{mov.descripcion}</b></span>
                        </>
                      ) : (
                        <>
                          <span>Subasta N°: <b>{mov.subastaNumero}</b></span>
                          <span>Cant: <b>{mov.cantidad}</b></span>
                          <span>P.Total: <b>{mov.pesoTotal}</b></span>
                          <span>V.Base: <b>{mov.valorBase}</b></span>
                          <span>Valor Cobro Subasta: <b>{mov.porcentajeSubasta}</b></span>
                          <span>Valor Total: <b>{calcularLinea(mov).valorTotalMov.toLocaleString('es-CO')}</b></span>
                          {mov.tipoMovimiento === 'venta' && mov.procedencia && (
                            <span>Procedencia: <b>{mov.procedencia}</b></span>
                          )}
                          {mov.tipoMovimiento === 'compra' && mov.destino && (
                            <span>Destino: <b>{mov.destino}</b></span>
                          )}
                        </>
                      )}
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 border border-blue-300"
                          onClick={() => setDetalleMovimiento(mov)}
                        >
                          Detalles
                        </button>
                        <button
                          className="px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300"
                          onClick={() => handleImprimir(mov)}
                        >
                          <Printer size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Modal de detalles de movimiento */}
        {detalleMovimiento && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                onClick={() => setDetalleMovimiento(null)}
              >
                <span className="text-lg">✕</span>
              </button>
              <h2 className="text-2xl font-bold mb-4 text-blue-800">Detalles del Movimiento</h2>
              <div className="space-y-2">
                <div><b>Tipo de Movimiento:</b> {detalleMovimiento.tipoMovimiento?.toUpperCase()}</div>
                <div><b>Fecha:</b> {new Date(detalleMovimiento.fechaRegistro).toLocaleString('es-CO')}</div>
                
                {detalleMovimiento.tipoMovimiento === 'pago' ? (
                  <>
                    <div><b>Valor del Pago:</b> ${Number(detalleMovimiento.valor).toLocaleString('es-CO')}</div>
                    <div><b>Descripción:</b> {detalleMovimiento.descripcion}</div>
                  </>
                ) : (
                  <>
                    <div><b>Subasta N°:</b> {detalleMovimiento.subastaNumero}</div>
                    <div><b>Tipo:</b> {detalleMovimiento.tipo}</div>
                    {detalleMovimiento.tipoMovimiento === 'venta' && (
                      <div><b>Procedencia:</b> {detalleMovimiento.procedencia}</div>
                    )}
                    {detalleMovimiento.tipoMovimiento === 'compra' && (
                      <div><b>Destino:</b> {detalleMovimiento.destino}</div>
                    )}
                    <div><b>Cantidad:</b> {detalleMovimiento.cantidad}</div>
                    <div><b>Peso Total:</b> {detalleMovimiento.pesoTotal}</div>
                    <div><b>Peso Promedio:</b> {calcularLinea(detalleMovimiento).pesoProm.toLocaleString('es-CO')}</div>
                    <div><b>Valor Base:</b> {detalleMovimiento.valorBase}</div>
                    <div><b>Valor Cobro Subasta:</b> {detalleMovimiento.porcentajeSubasta}</div>
                    <div><b>Valor Total:</b> {calcularLinea(detalleMovimiento).valorTotal.toLocaleString('es-CO')}</div>
                    <div><b>Valor Promedio:</b> {calcularLinea(detalleMovimiento).valorProm.toLocaleString('es-CO')}</div>
                    <div><b>Valor Total Movimiento:</b> {calcularLinea(detalleMovimiento).valorTotalMov.toLocaleString('es-CO')}</div>
                    {detalleMovimiento.tipo === 'VP' && (
                      <div>
                        <b>Crías Macho:</b> {detalleMovimiento.tipoDetalle?.criasMacho || 0} <br />
                        <b>Crías Hembra:</b> {detalleMovimiento.tipoDetalle?.criasHembra || 0}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubastaDetalleScreen; 