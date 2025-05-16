import React, { useState, useMemo, useEffect } from 'react';
import SessionExpireDialog from '../components/SessionExpireDialog';
import { useSessionExpire } from '../hooks/useSessionExpire';
import { useParams, useNavigate } from 'react-router-dom';
import { getFincaById } from '../services/fincaService'; // Asegúrate que estas rutas sean correctas
import { crearVenta } from '../services/ventaService';   // Asegúrate que estas rutas sean correctas

const COLUMN_SIZE = 10;
const COLUMNS_PER_ROW = 5; // 5 columnas por fila

interface AnimalData {
  numero: number;
  peso: number;
}

const LOCAL_STORAGE_KEY = 'ventaGanadoDraft';

const VentaGanado: React.FC = () => {
  const { expireDialogOpen, setExpireDialogOpen } = useSessionExpire('user', 55); // 55 minutos antes de expirar

  // Handler para reiniciar página (logout forzado o por expiración)
  // Ya NO borra el draft de venta, solo elimina el usuario
  const handleRelogin = () => {
    localStorage.removeItem('user');
    // El draft de venta NO se borra, así al recargar se restauran los datos
    window.location.reload();
  };

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fincaNombre, setFincaNombre] = useState('');
  const [fecha] = useState(() => new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }));
  const [comprador, setComprador] = useState('');
  const [destino, setDestino] = useState('');
  const [registradoPor, setRegistradoPor] = useState('');
  const [tipoAnimales, setTipoAnimales] = useState('');
  const [detalles, setDetalles] = useState('');
  const [valorPorKilo, setValorPorKilo] = useState<number>(0);
  const [animales, setAnimales] = useState<AnimalData[][]>(
    Array.from({ length: COLUMNS_PER_ROW }, (_, colIdx) =>
      Array.from({ length: COLUMN_SIZE }, (_, rowIdx) => ({
        numero: colIdx * COLUMN_SIZE + rowIdx + 1,
        peso: 0
      }))
    )
  );

  // Recuperar datos guardados al montar
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          setComprador(parsed.comprador || '');
          setDestino(parsed.destino || '');
          setRegistradoPor(parsed.registradoPor || '');
          setTipoAnimales(parsed.tipoAnimales || '');
          setDetalles(parsed.detalles || '');
          setValorPorKilo(parsed.valorPorKilo || 0);
          setAnimales(parsed.animales || animales);
        }
      } catch (e) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    // eslint-disable-next-line
  }, []);

  // Guardar automáticamente cada vez que cambian los datos relevantes
  useEffect(() => {
    const draft = {
      comprador,
      destino,
      registradoPor,
      tipoAnimales,
      detalles,
      valorPorKilo,
      animales,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
  }, [comprador, destino, registradoPor, tipoAnimales, detalles, valorPorKilo, animales]);

  // Prevenir recarga accidental (F5, cerrar pestaña, etc.) si hay datos no guardados
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (draft) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const estadisticas = useMemo(() => {
    const animalesConPeso = animales.flat().filter(animal => animal.peso > 0);
    const totalAnimales = animalesConPeso.length;
    const pesoTotal = animalesConPeso.reduce((sum, animal) => sum + animal.peso, 0);
    const pesoPromedio = totalAnimales > 0 ? pesoTotal / totalAnimales : 0;
    const valorPromedio = pesoPromedio * valorPorKilo;
    const valorTotal = pesoTotal * valorPorKilo;

    return {
      totalAnimales,
      pesoTotal,
      pesoPromedio,
      valorPromedio,
      valorTotal
    };
  }, [animales, valorPorKilo]);

  React.useEffect(() => {
    const fetchFinca = async () => {
      if (!id) return;
      try {
        const finca = await getFincaById(id);
        setFincaNombre(finca.nombre || 'Nombre de Finca no encontrado');
      } catch (error) {
        console.error("Error fetching finca:", error);
        setFincaNombre('Error al cargar nombre de finca');
      }
    };
    fetchFinca();
  }, [id]);

  const handleNumeroChange = (colIdx: number, rowIdx: number, value: string) => {
    const newAnimales = animales.map((col, cIdx) =>
      cIdx === colIdx ? col.map((animal, rIdx) =>
        rIdx === rowIdx ? { ...animal, numero: Number(value) || 0 } : animal
      ) : col
    );
    setAnimales(newAnimales);
  };

  const handlePesoChange = (colIdx: number, rowIdx: number, value: string) => {
    const newAnimales = animales.map((col, cIdx) =>
      cIdx === colIdx ? col.map((animal, rIdx) =>
        rIdx === rowIdx ? { ...animal, peso: value === '' ? 0 : Number(value) || 0 } : animal
      ) : col
    );
    setAnimales(newAnimales);
  };

  const handleAddColumn = () => {
    const totalRecorridos = animales.length * COLUMN_SIZE;
    const newColumn = Array.from({ length: COLUMN_SIZE }, (_, rowIdx) => ({
      numero: totalRecorridos + rowIdx + 1,
      peso: 0
    }));
    setAnimales([...animales, newColumn]);
  };

  const getColSum = (col: AnimalData[]) => col.reduce((acc, animal) => acc + animal.peso, 0);

  const columnasPorFilas = [];
  for (let i = 0; i < animales.length; i += COLUMNS_PER_ROW) {
    columnasPorFilas.push(animales.slice(i, i + COLUMNS_PER_ROW));
  }

  const handleRegistrarVenta = async () => {
    try {
      if (!id) {
        alert('Error: No se encontró el ID de la finca');
        return;
      }
      if (!comprador.trim()) {
        alert('Por favor, ingrese el nombre del comprador');
        return;
      }
      if (!destino.trim()) {
        alert('Por favor, ingrese el destino');
        return;
      }
      if (!registradoPor.trim()) {
        alert('Por favor, ingrese quién registra la venta');
        return;
      }
      if (!tipoAnimales.trim()) {
        alert('Por favor, ingrese el tipo de animales');
        return;
      }
      if (valorPorKilo <= 0) {
        alert('Por favor, ingrese un valor por kilo válido');
        return;
      }
      const animalesConPeso = animales.flat().filter(animal => animal.peso > 0);
      if (animalesConPeso.length === 0) {
        alert('Por favor, ingrese al menos un animal con peso');
        return;
      }

      const ventaData = {
        fincaId: id,
        comprador: comprador.trim(),
        destino: destino.trim(),
        registradoPor: registradoPor.trim(),
        tipoAnimales: tipoAnimales.trim(),
        detalles: detalles.trim(),
        valorPorKilo,
        fecha: new Date().toISOString(),
        animales: animalesConPeso,
        estadisticas,
        movimientosAnimales: [{
          tipo: 'salida',
          cantidad: estadisticas.totalAnimales,
          motivo: 'Venta de ganado',
          detalles: `Venta de ${estadisticas.totalAnimales} animales a ${comprador.trim()}`
        }],
        movimientosBodega: [] // Asumiendo que es un array vacío si no hay movimientos de bodega
      };

      await crearVenta(ventaData);
      // Limpiar el borrador guardado SOLO cuando la venta es exitosa
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      alert('Venta registrada exitosamente!');
      navigate(`/fincas/${id}`);
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      alert('Error al registrar la venta. Por favor, intente nuevamente.');
    }
  };

  return (
    <>
      <SessionExpireDialog
        open={expireDialogOpen}
        onClose={() => setExpireDialogOpen(false)}
        onRelogin={handleRelogin}
      />
      <div
      className="min-h-screen bg-gray-100 p-2 md:p-6"
      style={{
        backgroundImage: "url('/assets/images/ventas.png')", // ¡Verifica esta ruta!
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(255,255,255,0.65)', // Ligero aumento en opacidad para mejor contraste
        backdropFilter: 'blur(3px)', // Ligero aumento en blur
        zIndex: 0,
        pointerEvents: 'none',
      }} />
      <div className="relative z-10 max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-4 md:p-8"> {/* Aumentado max-w y padding */}

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-rio text-yellow-700 mb-2">INVERSIONES BONITO VIENTO SAS</h1>
          <h2 className="text-xl sm:text-2xl font-rio text-gray-800">{fincaNombre}</h2>
          <p className="text-md sm:text-lg text-gray-600">{fecha}</p>
        </div>

        <div className="mb-8 p-4 md:p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl shadow-md">
          <h3 className="text-xl sm:text-2xl font-rio text-center text-yellow-800 mb-6">
            VENTA EN FINCA
          </h3>
          <div className="flex flex-row flex-wrap justify-around gap-x-6 gap-y-4"> {/* Mejorado para responsividad */}
            <div className="flex flex-col w-full sm:w-auto sm:min-w-[250px] md:flex-1 md:max-w-xs">
              <label className="font-bold text-gray-700 mb-1">Comprador:</label>
              <input
                type="text"
                value={comprador}
                onChange={e => setComprador(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Nombre del comprador"
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto sm:min-w-[250px] md:flex-1 md:max-w-xs">
              <label className="font-bold text-gray-700 mb-1">Destino:</label>
              <input
                type="text"
                value={destino}
                onChange={e => setDestino(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="¿Hacia dónde va el ganado?"
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto sm:min-w-[250px] md:flex-1 md:max-w-xs">
              <label className="font-bold text-gray-700 mb-1">Registrado por:</label>
              <input
                type="text"
                value={registradoPor}
                onChange={e => setRegistradoPor(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Nombre de quien registra"
              />
            </div>
            <div className="flex flex-col w-full sm:w-auto sm:min-w-[250px] md:flex-1 md:max-w-xs">
              <label className="font-bold text-gray-700 mb-1">Tipo de Animales:</label>
              <input
                type="text"
                value={tipoAnimales}
                onChange={e => setTipoAnimales(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Ej: Novillos, Vacas, etc."
              />
            </div>
          </div>
          <div className="mt-6">
            <label className="font-bold text-gray-700">Detalles Adicionales:</label>
            <textarea
              value={detalles}
              onChange={e => setDetalles(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Ingrese cualquier detalle adicional relevante"
              rows={3}
            />
          </div>
        </div>

        <div className="mb-8 border-2 border-gray-200 rounded-lg p-2 md:p-4 bg-white shadow-md">
          <div className="flex flex-col gap-6">
            {columnasPorFilas.map((fila, filaIdx) => (
              <div key={filaIdx} className="w-full overflow-x-auto"> {/* overflow-x-auto para scroll si es necesario en pantallas pequeñas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {fila.map((col, colIdx) => (
                    <div key={colIdx} className="border border-gray-300 rounded-lg p-3 bg-yellow-50 flex flex-col gap-2 shadow">
                      <div className="text-center font-semibold text-yellow-800 mb-1 text-sm">
                        Columna {((filaIdx * COLUMNS_PER_ROW) + colIdx) * COLUMN_SIZE + 1} - {((filaIdx * COLUMNS_PER_ROW) + colIdx) * COLUMN_SIZE + COLUMN_SIZE}
                      </div>
                      {col.map((animal, rowIdx) => (
                        <div key={rowIdx} className="flex gap-2 items-center">
                          <input
                            type="number"
                            min={0}
                            value={animal.numero || ''}
                            onChange={e => handleNumeroChange((filaIdx * COLUMNS_PER_ROW) + colIdx, rowIdx, e.target.value)}
                            className="min-w-0 flex-1 border border-gray-200 rounded px-2 py-1 text-center text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="No."
                          />
                          <input
                            type="number"
                            min={0}
                            value={animal.peso || ''}
                            onChange={e => handlePesoChange((filaIdx * COLUMNS_PER_ROW) + colIdx, rowIdx, e.target.value)}
                            className="min-w-0 flex-1 border border-gray-200 rounded px-2 py-1 text-center text-sm sm:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
                            placeholder="Peso"
                          />
                        </div>
                      ))}
                      <div className="mt-2 text-lg text-center font-bold text-gray-700 bg-gray-100 rounded py-1 px-2">
                        Suma: {getColSum(col).toLocaleString('es-CO')} kg
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleAddColumn}
                className="px-5 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-150 ease-in-out shadow hover:shadow-md"
              >
                Agregar Más Animales (Columna)
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg shadow-md">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Total Animales</h3>
            <p className="text-2xl font-bold text-blue-600">{estadisticas.totalAnimales.toLocaleString('es-CO')}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Peso Total (kg)</h3>
            <p className="text-2xl font-bold text-green-600">{estadisticas.pesoTotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Peso Promedio (kg)</h3>
            <p className="text-2xl font-bold text-purple-600">{estadisticas.pesoPromedio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Valor Promedio ($)</h3>
            <p className="text-2xl font-bold text-yellow-600">${estadisticas.valorPromedio.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-600">Valor Total ($)</h3>
            <p className="text-2xl font-bold text-red-600">${estadisticas.valorTotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 bg-yellow-100 rounded-lg shadow flex flex-col items-center justify-center"> {/* Color de fondo más suave */}
            <label className="text-md font-bold text-yellow-800 mb-2">Valor por kilo o base ($):</label>
            <input
              type="number"
              min={0}
              value={valorPorKilo || ''}
              onChange={e => setValorPorKilo(Number(e.target.value) || 0)}
              className="w-32 md:w-36 border-2 border-yellow-400 rounded px-3 py-2 text-center text-lg focus:ring-2 focus:ring-yellow-600 focus:border-yellow-600"
              placeholder="0"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full md:w-auto px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-150 ease-in-out shadow hover:shadow-md order-2 md:order-1"
          >
            Cancelar
          </button>
          <button
            onClick={handleRegistrarVenta}
            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150 ease-in-out shadow hover:shadow-md order-1 md:order-2"
          >
            Registrar Venta
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default VentaGanado;