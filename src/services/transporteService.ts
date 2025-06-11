import { ViajeTransporte, ResumenViaje } from '../types/Transporte';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const transporteService = {
  async crearViaje(viaje: Omit<ViajeTransporte, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<ViajeTransporte> {
    const response = await axios.post(`${API_URL}/transporte`, viaje);
    return response.data;
  },

  async actualizarViaje(id: string, viaje: Partial<ViajeTransporte>): Promise<void> {
    await axios.put(`${API_URL}/transporte/${id}`, viaje);
  },

  async eliminarViaje(id: string): Promise<void> {
    await axios.delete(`${API_URL}/transporte/${id}`);
  },

  async obtenerViajesEnCurso(): Promise<ViajeTransporte[]> {
    const response = await axios.get(`${API_URL}/transporte/estado/EN_CURSO`);
    return response.data;
  },

  async obtenerViajesCulminados(): Promise<ViajeTransporte[]> {
    const response = await axios.get(`${API_URL}/transporte/estado/CULMINADO`);
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