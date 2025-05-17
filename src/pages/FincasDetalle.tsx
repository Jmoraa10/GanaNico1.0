// src/pages/FincasDetalle.tsx
import React from 'react';
// Eliminamos 'Animales' ya que no se usa directamente como tipo principal
import { Finca, Bodega, BodegaItem, Animales as AnimalesType, Paridas } from '../types/FincaTypes';
import { Edit } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import HistorialMovimientos from '../components/HistorialMovimientos';

interface Props {
  finca: Finca;
  onUpdate: (finca: Finca) => void;
  onOpenMovimientoDialog: () => void;
}

// --- Funciones Auxiliares ---

// Función para calcular el total de animales en un grupo específico
const calcularTotalPorGrupo = (
    grupo: AnimalesType['machos'] | AnimalesType['hembras'] | AnimalesType['equinos'] | AnimalesType['otros'] | AnimalesType['bufalos'] | undefined
): number => {
    if (!grupo) return 0;
    let total = 0;
    for (const key in grupo) {
        if (Object.prototype.hasOwnProperty.call(grupo, key)) {
            const value = grupo[key as keyof typeof grupo];
            if (typeof value === 'number') {
                total += value;
            } else if (typeof value === 'object' && value !== null && 'total' in value && typeof value.total === 'number') {
                total += value.total;
            }
        }
    }
    return total;
};

// --- Componentes Internos para Mejorar Estructura ---

// Componente para mostrar un contador de animales específico
const AnimalCountCard: React.FC<{ title: string; value: number | undefined }> = ({ title, value }) => (
  <div className="bg-white border-2 border-green-600 rounded-xl shadow-lg p-4 text-center">
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-xl font-semibold text-green-800">{value ?? 0}</p>
  </div>
);

// Componente para mostrar contadores de crías
const CriasCountCard: React.FC<{ title: string; crias: Paridas | undefined }> = ({ title, crias }) => (
  <div className="bg-white border-2 border-green-600 rounded-xl shadow-lg p-4 text-center mb-4">
    <h3 className="text-xl font-semibold text-green-700 mb-4 font-rio text-center">{title}</h3>
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">Total</p>
        <p className="text-2xl font-bold text-green-700">{crias?.total ?? 0}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Machos</p>
        <p className="text-2xl font-bold text-green-700">{crias?.machos ?? 0}</p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Hembras</p>
        <p className="text-2xl font-bold text-green-700">{crias?.hembras ?? 0}</p>
      </div>
    </div>
  </div>
);

// Componente para una sección de animales (Machos, Hembras, etc.) con total y botón de edición
const AnimalSection: React.FC<{
    title: string;
    total: number;
    children: React.ReactNode
}> = ({ title, total, children }) => {
    return (
      <div className="bg-white border-2 border-green-600 rounded-xl shadow-lg p-4 relative">
        <h3 className="text-xl font-semibold text-green-700 mb-4 font-rio flex justify-between items-center">
          {title}
          <span className="text-base bg-green-100 text-green-800 px-3 py-1 rounded-full">
            Total: {total}
          </span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {children}
        </div>
      </div>
    );
};


// Componente para una sección de la bodega (Suministros, Veterinarios)
const BodegaSection: React.FC<{
  title: string;
  items: BodegaItem[];
  sectionKey: keyof Bodega;
  onQuantityChange: (section: keyof Bodega, nombre: string, delta: number) => void;
  onMarcarComoFaltante: (section: keyof Bodega, nombre: string) => void;
  onMarcarComoComprado: (section: keyof Bodega, nombre: string) => void;
}> = ({ title, items, sectionKey, onQuantityChange, onMarcarComoFaltante, onMarcarComoComprado }) => {
  return (
    <div className="bg-white border-2 border-green-600 rounded-xl shadow-lg p-4 mb-4">
      <h3 className="text-xl font-semibold text-green-700 mb-4 font-rio">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.nombre}
            className={`p-4 rounded-lg border ${
              item.esFaltante ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-800">{item.nombre}</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onQuantityChange(sectionKey, item.nombre, -1)}
                  className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  -
                </button>
                <span className="font-bold">{item.cantidad}</span>
                <button
                  onClick={() => onQuantityChange(sectionKey, item.nombre, 1)}
                  className="px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {item.esFaltante ? (
                <button
                  onClick={() => onMarcarComoComprado(sectionKey, item.nombre)}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Marcar como comprado
                </button>
              ) : (
                <button
                  onClick={() => onMarcarComoFaltante(sectionKey, item.nombre)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Marcar como faltante
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Componente Principal FincaDetalle ---

const FincaDetalle: React.FC<Props> = ({ finca, onUpdate, onOpenMovimientoDialog }) => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const fincaId = id || '';


  // --- Manejadores para la Bodega ---
  const handleQuantityChange = (
    section: keyof Bodega,
    nombre: string,
    delta: number
  ) => {
    const updatedFinca: Finca = {
      ...finca,
      bodega: {
        ...finca.bodega,
        [section]: finca.bodega[section].map((item) =>
          item.nombre === nombre
            ? { ...item, cantidad: Math.max(0, item.cantidad + delta) }
            : item
        ),
      },
    };
    onUpdate(updatedFinca);
    onOpenMovimientoDialog();
  };

  // --- Placeholders para añadir nuevos items (Bodega) ---
  // @ts-ignore
  const handleAddSuministro = () => {
    const nombre = prompt("Nombre del nuevo suministro:");
    if (nombre) {
        const nuevoItem: BodegaItem = { nombre, cantidad: 1, esFaltante: false };
        const updatedFinca: Finca = {
            ...finca,
            bodega: {
                ...finca.bodega,
                suministros: [...finca.bodega.suministros, nuevoItem]
            }
        };
        onUpdate(updatedFinca);
    }
  };

  // @ts-ignore
  const handleAddVeterinario = () => {
    const nombre = prompt("Nombre del nuevo producto veterinario:");
    if (nombre) {
        const nuevoItem: BodegaItem = { nombre, cantidad: 1, esFaltante: false };
        const updatedFinca: Finca = {
            ...finca,
            bodega: {
                ...finca.bodega,
                veterinarios: [...finca.bodega.veterinarios, nuevoItem]
            }
        };
        onUpdate(updatedFinca);
    }
  };

   // Manejador para el botón "Editar Animales" (redirige a edición)
   const handleAddOtroAnimalClick = () => {
       navigate(`/fincas/editar/${fincaId}`);
   };

  // En el componente principal FincaDetalle, agregar los nuevos manejadores:
  const handleMarcarComoFaltante = (section: keyof Bodega, nombre: string) => {
    // Verificar si el item ya existe
    const itemExistente = finca.bodega[section].find(item => item.nombre === nombre);
    
    if (itemExistente) {
      // Si existe, cambiar su estado de faltante
      const updatedFinca: Finca = {
        ...finca,
        bodega: {
          ...finca.bodega,
          [section]: finca.bodega[section].map((item) =>
            item.nombre === nombre
              ? { ...item, esFaltante: !item.esFaltante }
              : item
          ),
        },
      };
      onUpdate(updatedFinca);
    } else {
      // Si no existe, crear un nuevo item como faltante
      const nuevoItem: BodegaItem = { nombre, cantidad: 0, esFaltante: true };
      const updatedFinca: Finca = {
        ...finca,
        bodega: {
          ...finca.bodega,
          [section]: [...finca.bodega[section], nuevoItem],
        },
      };
      onUpdate(updatedFinca);
    }
    onOpenMovimientoDialog();
  };

  const handleMarcarComoComprado = (section: keyof Bodega, nombre: string) => {
    const updatedFinca: Finca = {
      ...finca,
      bodega: {
        ...finca.bodega,
        [section]: finca.bodega[section].map((item) =>
          item.nombre === nombre
            ? { ...item, esFaltante: false }
            : item
        ),
      },
    };
    onUpdate(updatedFinca);
    onOpenMovimientoDialog();
  };

  // --- Cálculo de totales por grupo de animales ---
  // @ts-ignore
  const totalMachos = calcularTotalPorGrupo(finca.animales?.machos);
  // @ts-ignore
  const totalHembras = calcularTotalPorGrupo(finca.animales?.hembras);
  // @ts-ignore
  const totalBufalos = calcularTotalPorGrupo(finca.animales?.bufalos);
  const totalEquinos = calcularTotalPorGrupo(finca.animales?.equinos);
  const totalOtros = calcularTotalPorGrupo(finca.animales?.otros);


  // --- Renderizado ---
  return (
    <div className="space-y-8">

      {/* Sección de Información General */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 font-rio">{finca.nombre}</h2>
        <p className="text-gray-600">
          <span className="font-semibold">Capataz:</span> {finca.capataz}
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">Ubicación:</span> {finca.ubicacion}
        </p>
         <p className="text-gray-600">
          <span className="font-semibold">Hectáreas:</span> {finca.hectareas}
        </p>
      </div>

      {/* --- Sección de Animales --- */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 font-rio">Animales</h2>

        {/* Contenedor para poner Machos y Hembras uno al lado del otro en pantallas grandes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Grupo Machos */}
            <div className="bg-green-100 border-2 border-green-600 rounded-xl shadow-lg p-4">
  <h3 className="text-xl font-semibold text-green-800 mb-4 font-rio">Machos</h3>
  <div className="grid grid-cols-2 gap-3">
    <AnimalCountCard title="Levante" value={finca.animales?.machos?.levante ?? 0} />
    <AnimalCountCard title="Ceba" value={finca.animales?.machos?.ceba ?? 0} />
  </div>
</div>

            {/* Grupo Hembras */}
            <div className="bg-green-100 border-2 border-green-600 rounded-xl shadow-lg p-4">
  <h3 className="text-xl font-semibold text-green-800 mb-4 font-rio">Hembras</h3>
  <div className="grid grid-cols-2 gap-3">
    <AnimalCountCard title="Levante" value={finca.animales?.hembras?.levante ?? 0} />
    <AnimalCountCard title="Vientre" value={finca.animales?.hembras?.vientre ?? 0} />
    <AnimalCountCard title="Preñadas" value={finca.animales?.hembras?.preñadas ?? 0} />
    <AnimalCountCard title="Escoteras" value={finca.animales?.hembras?.escoteras ?? 0} />
  </div>
</div>
        </div>

        {/* Sección de Crías de Vacas */}
        <div className="mb-6">
            <CriasCountCard title="Vacas Paridas" crias={finca.animales?.hembras?.paridas} />
        </div>

        {/* Sección de Búfalos */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 font-rio">Búfalos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Card Machos */}
            <div className="bg-green-100 border-2 border-green-600 rounded-xl shadow-lg p-4">
              <h3 className="text-xl font-semibold text-green-800 mb-4 font-rio">Búfalos Machos</h3>
              <div className="grid grid-cols-2 gap-3">
                <AnimalCountCard title="Levante" value={finca.animales?.bufalos?.machos?.levante ?? 0} />
                <AnimalCountCard title="Ceba" value={finca.animales?.bufalos?.machos?.ceba ?? 0} />
              </div>
            </div>
            {/* Card Hembras */}
            <div className="bg-green-100 border-2 border-green-600 rounded-xl shadow-lg p-4">
              <h3 className="text-xl font-semibold text-green-800 mb-4 font-rio">Búfalas Hembras</h3>
              <div className="grid grid-cols-2 gap-3">
                <AnimalCountCard title="Levante" value={finca.animales?.bufalos?.hembras?.levante ?? 0} />
                <AnimalCountCard title="Vientre" value={finca.animales?.bufalos?.hembras?.vientre ?? 0} />
                <AnimalCountCard title="Preñadas" value={finca.animales?.bufalos?.hembras?.preñadas ?? 0} />
                <AnimalCountCard title="Escoteras" value={finca.animales?.bufalos?.hembras?.escoteras ?? 0} />
              </div>
            </div>
          </div>
          {/* Card de Paridas */}
          <CriasCountCard 
            title="Búfalas Paridas" 
            crias={finca.animales?.bufalos?.hembras?.paridas} 
          />
        </div>

              
        {/* Grupo Equinos */}
        <div className="mb-6">
            <AnimalSection title="Equinos" total={totalEquinos}>
                <AnimalCountCard title="Caballos" value={finca.animales.equinos.caballos} />
                <AnimalCountCard title="Yeguas" value={finca.animales.equinos.yeguas} />
                <AnimalCountCard title="Potros/as" value={finca.animales.equinos.potros} />
                <AnimalCountCard title="Mulas" value={finca.animales.equinos.mulas} />
            </AnimalSection>
        </div>

        {/* Sección de Crías de Yeguas */}
        <div className="mb-6">
            <CriasCountCard title="Yeguas Paridas" crias={finca.animales?.equinos?.yeguasParidas} />
        </div>

        {/* Grupo Otros */}
        <div className="mb-6">
            <AnimalSection title="Otros" total={totalOtros}>
                <AnimalCountCard title="Cabras" value={finca.animales.otros.cabras} />
                <AnimalCountCard title="Peces" value={finca.animales.otros.peces} />
                <AnimalCountCard title="Pollos" value={finca.animales.otros.pollos} />
            </AnimalSection>
        </div>

        {/* Sección de Crías de Cabras */}
        <div className="mb-6">
            <CriasCountCard title="Cabras Paridas" crias={finca.animales?.otros?.cabrasParidas} />
        </div>

        {/* Botón para editar animales */}
        <div className="flex justify-center mt-6">
            <button
                onClick={handleAddOtroAnimalClick}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow transition"
                title="Agregar o editar otros tipos de animales"
            >
                <Edit size={16} /> Editar Animales
            </button>
        </div>
      </div>

      {/* --- Sección de Bodega --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="2xl font-semibold text-gray-700 font-rio">Bodega</h2>
          <button
            onClick={() => navigate(`/fincas/${fincaId}/bodega/editar`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={20} />
            Editar Bodega
          </button>
        </div>
        <BodegaSection
          title="Suministros"
          items={finca.bodega.suministros}
          sectionKey="suministros"
          onQuantityChange={handleQuantityChange}
          onMarcarComoFaltante={handleMarcarComoFaltante}
          onMarcarComoComprado={handleMarcarComoComprado}
        />
        <BodegaSection
          title="Productos Veterinarios"
          items={finca.bodega.veterinarios}
          sectionKey="veterinarios"
          onQuantityChange={handleQuantityChange}
          onMarcarComoFaltante={handleMarcarComoFaltante}
          onMarcarComoComprado={handleMarcarComoComprado}
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={() => navigate(`/fincas/${fincaId}/bodega/editar`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={20} />
            Editar Bodega
          </button>
        </div>
      </div>

      {/* Historial de Movimientos */}
      <HistorialMovimientos 
        fincaId={finca.id || finca._id || ''}
        movimientos={finca.movimientosGanado || []} 
        movimientosBodega={finca.movimientosBodega || []}
      />
    </div>
  );
};

export default FincaDetalle;