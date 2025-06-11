import { transportApi } from './api';
import { ViajeTransporte, ResumenViaje } from '../types/Transporte';

export const transporteService = {
  async crearViaje(viaje: Omit<ViajeTransporte, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<ViajeTransporte> {
    const response = await transportApi.crearViaje(viaje);
    return response.data;
  },

  async actualizarViaje(id: string, viaje: Partial<ViajeTransporte>): Promise<ViajeTransporte> {
    const response = await transportApi.actualizarViaje(id, viaje);
    return response.data;
  },

  async eliminarViaje(id: string): Promise<void> {
    await transportApi.eliminarViaje(id);
  },

  async obtenerViajesEnCurso(): Promise<ViajeTransporte[]> {
    const response = await transportApi.obtenerViajesEnCurso();
    return response.data;
  },

  async obtenerViajesCulminados(): Promise<ViajeTransporte[]> {
    const response = await transportApi.obtenerViajesCulminados();
    return response.data;
  },

  async obtenerViaje(id: string): Promise<ViajeTransporte> {
    const response = await transportApi.obtenerViaje(id);
    return response.data;
  },

  calcularResumenViaje(viaje: ViajeTransporte): ResumenViaje {
    const resumen: ResumenViaje = {
      totalAnimales: 0,
      resumenAnimales: {},
      totalSuministros: 0,
      totalGastos: 0,
    };

    // Calcular totales de animales
    if (viaje.animales) {
      viaje.animales.forEach(animal => {
        resumen.totalAnimales += animal.cantidad;
        resumen.resumenAnimales[animal.tipo] = (resumen.resumenAnimales[animal.tipo] || 0) + animal.cantidad;
      });
    }

    // Calcular totales de suministros
    if (viaje.suministros) {
      resumen.totalSuministros = viaje.suministros.reduce((total, suministro) => total + suministro.cantidad, 0);
    }

    // Calcular totales de gastos
    resumen.totalGastos = viaje.gastos.diesel + viaje.gastos.peajes + viaje.gastos.viaticos;

    return resumen;
  }
}; 