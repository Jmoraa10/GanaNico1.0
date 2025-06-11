import { ViajeTransporte, ResumenViaje } from '../types/Transporte';
import { api } from '../config/api';

const BASE_URL = '/api/transportes';

export const transporteService = {
  async crearViaje(viaje: Omit<ViajeTransporte, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<ViajeTransporte> {
    const response = await api.post(BASE_URL, viaje);
    return response.data;
  },

  async actualizarViaje(id: string, viaje: Partial<ViajeTransporte>): Promise<ViajeTransporte> {
    const response = await api.put(`${BASE_URL}/${id}`, viaje);
    return response.data;
  },

  async eliminarViaje(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  async obtenerViajesEnCurso(): Promise<ViajeTransporte[]> {
    const response = await api.get(`${BASE_URL}/en-curso`);
    return response.data;
  },

  async obtenerViajesCulminados(): Promise<ViajeTransporte[]> {
    const response = await api.get(`${BASE_URL}/culminados`);
    return response.data;
  },

  async obtenerViaje(id: string): Promise<ViajeTransporte> {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  async marcarViajeCulminado(id: string, detallesFinalizacion: string): Promise<ViajeTransporte> {
    const response = await api.put(`${BASE_URL}/${id}`, {
      estado: 'CULMINADO',
      detallesFinalizacion
    });
    return response.data;
  },

  calcularResumenViaje(viaje: ViajeTransporte): ResumenViaje {
    const resumen: ResumenViaje = {
      totalAnimales: 0,
      resumenAnimales: {},
      totalSuministros: 0,
      totalGastos: 0,
      duracionViaje: 0
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

    // Calcular duración del viaje si está culminado
    if (viaje.estado === 'CULMINADO' && viaje.horaCulminacion) {
      const inicio = new Date(viaje.horaInicio);
      const fin = new Date(viaje.horaCulminacion);
      resumen.duracionViaje = Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60));
    }

    return resumen;
  }
}; 