import { ViajeTransporte, ResumenViaje } from '../types/Transporte';
import { api } from '../config/api.js';

const BASE_URL = '/transportes';

export const transporteService = {
  async crearViaje(viaje: Omit<ViajeTransporte, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<ViajeTransporte> {
    const response = await api.post(`${BASE_URL}/crear`, viaje);
    return response.data;
  },

  async actualizarViaje(id: string, viaje: Partial<ViajeTransporte>): Promise<ViajeTransporte> {
    const response = await api.put(`${BASE_URL}/actualizar/${id}`, viaje);
    return response.data;
  },

  async eliminarViaje(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/eliminar/${id}`);
  },

  async obtenerViajes(): Promise<ViajeTransporte[]> {
    const response = await api.get(`${BASE_URL}/todos`);
    return response.data;
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
    const response = await api.get(`${BASE_URL}/detalle/${id}`);
    return response.data;
  },

  async obtenerResumen(): Promise<ResumenViaje> {
    const response = await api.get(`${BASE_URL}/resumen/total`);
    return response.data;
  }
}; 