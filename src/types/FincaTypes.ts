// src/types/FincaTypes.ts

// Interfaces para Animales (estas parecen estar bien)
export interface Paridas {
  total: number;
  machos: number;
  hembras: number;
  [key: string]: number; // Permite otras claves numéricas si es necesario
}

export interface Hembras {
  levante: number;
  vientre: number;
  preñadas: number;
  escoteras: number;
  paridas: Paridas;
  [key: string]: number | Paridas; // Permite otras claves si es necesario
}

// Estructura para crías (reutilizable)
export interface Crias {
  total: number;
  machos: number;
  hembras: number;
  [key: string]: number; // Permite otras claves numéricas si es necesario
}

export interface Machos {
  ceba: number;
  levante: number;
  [key: string]: number; // Permite otras claves si es necesario
}

export interface Equinos {
  caballos: number;
  yeguas: number;
  potros: number; // Asumo que potros/potrancas van acá
  mulas: number;
  yeguasParidas?: Crias; // Añadimos opcionalmente yeguas paridas
  [key: string]: number | Crias | undefined; // Ajustamos la firma de índice
}

export interface Otros {
  cabras: number;
  peces: number;
  pollos: number;
  cabrasParidas: Paridas;
  [key: string]: number | Paridas; // Ajustamos la firma de índice
}

export interface Bufalos {
  machos: {
    ceba: number;
    levante: number;
  };
  hembras: {
    levante: number;
    vientre: number;
    preñadas: number;
    escoteras: number;
    paridas: Paridas;
  };
}

export interface Animales {
  hembras: Hembras;
  machos: Machos;
  equinos: Equinos;
  otros: Otros;
  bufalos: Bufalos; // Se agrega la propiedad bufalos
}

// Interfaces para Bodega (Unificadas y Corregidas)
// Usaremos BodegaItem como el tipo estándar para los elementos de la bodega.
export interface BodegaItem {
  nombre: string;
  cantidad: number;
  esFaltante: boolean; // Nuevo campo para marcar items pendientes
}

// Definición única de Bodega con claves en minúscula
export interface Bodega {
  suministros: BodegaItem[];
  veterinarios: BodegaItem[];
}

// Tipo para el seguimiento de movimientos de ganado
export interface MovimientoGanado {
  id?: string;
  _id?: string;
  fecha: string;
  tipo: 'ingreso' | 'salida';
  cantidad: number;
  detalles: string;
  procedencia: string;
  destino: string;
  registradoPor: string;
  animales: {
    machos: {
      ceba: number;
      levante: number;
    };
    hembras: {
      levante: number;
      vientre: number;
      preñadas: number;
      escoteras: number;
      paridas: {
        total: number;
        machos: number;
        hembras: number;
      };
    };
    equinos: {
      caballos: number;
      yeguas: number;
      potros: number;
      mulas: number;
      yeguasParidas: {
        total: number;
        machos: number;
        hembras: number;
      };
    };
    otros: {
      cabras: number;
      peces: number;
      pollos: number;
      cabrasParidas: {
        total: number;
        machos: number;
        hembras: number;
      };
    };
    bufalos: {
      machos: {
        ceba: number;
        levante: number;
      };
      hembras: {
        levante: number;
        vientre: number;
        preñadas: number;
        escoteras: number;
        paridas: Paridas;
      };
    };
  };
}

// Tipo para el seguimiento de movimientos de bodega
export interface MovimientoBodega {
  id?: string;
  fecha: string; // ISO string
  registradoPor: string;
  detalles: string;
  snapshotBodega?: Bodega; // Estado de la bodega en el momento del movimiento
}



// Tipo para el seguimiento de ventas
export interface Venta {
  _id?: string;
  finca: string;
  fecha: string;
  comprador: string;
  destino: string;
  registradoPor: string;
  tipoAnimales: string;
  detalles: string;
  valorPorKilo: number;
  animales: Array<{
    numero: number;
    peso: number;
  }>;
  estadisticas: {
    totalAnimales: number;
    pesoTotal: number;
    pesoPromedio: number;
    valorPromedio: number;
    valorTotal: number;
  };
  movimientosAnimales: Array<{
    tipo: string;
    cantidad: number;
    motivo: string;
    detalles: string;
  }>;
  movimientosBodega: Array<{
    tipo: string;
    producto: string;
    cantidad: number;
    motivo: string;
  }>;
  estado: string;
}

// Interfaz Principal Finca
export interface Finca {
  _id?: string; // ID de MongoDB
  id?: string; // ID alternativo
  nombre: string;
  capataz: string;
  ubicacion: string;
  hectareas: number;
  animales: Animales;
  bodega: Bodega;
  movimientosGanado: MovimientoGanado[]; // Nuevo campo para el historial
  movimientosBodega?: MovimientoBodega[]; // Historial de movimientos de bodega
  ventas?: Venta[]; // Historial de ventas
  createdAt?: string;
  updatedAt?: string;
}

// Tipo para el formulario, omitiendo campos generados automáticamente
export type FincaFormData = Omit<Finca, 'id' | '_id' | 'createdAt' | 'updatedAt'>;