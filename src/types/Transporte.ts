export type TipoAnimal = 
  | 'MACHO_CEBA'
  | 'MACHO_LEVANTE'
  | 'HEMBRA_LEVANTE'
  | 'HEMBRA_VIENTRE'
  | 'VACA_ESCOTERA'
  | 'VACA_PARIDA'
  | 'BUFALO_MACHO'
  | 'BUFALO_HEMBRA';

export type TipoCarga = 'ANIMALES' | 'SUMINISTROS';

export interface AnimalTransporte {
  tipo: TipoAnimal;
  cantidad: number;
}

export interface SuministroTransporte {
  descripcion: string;
  cantidad: number;
  unidad: string;
}

export interface GastoTransporte {
  diesel: number;
  peajes: number;
  viaticos: number;
}

export interface ViajeTransporte {
  _id?: string;
  camionero: string;
  placaCamion: string;
  origen: string;
  destino: string;
  tipoCarga: TipoCarga;
  animales?: AnimalTransporte[];
  suministros?: SuministroTransporte[];
  gastos: GastoTransporte;
  detallesAdicionales?: string;
  detallesFinalizacion?: string;
  horaInicio: Date;
  estado: 'EN_CURSO' | 'CULMINADO';
  horaCulminacion?: Date;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  resumen?: ResumenViaje;
}

export interface ResumenViaje {
  totalAnimales: number;
  resumenAnimales: { [key in TipoAnimal]?: number };
  totalSuministros: number;
  totalGastos: number;
  duracionViaje?: number;
} 