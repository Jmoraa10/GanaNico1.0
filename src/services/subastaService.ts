import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Subasta {
  _id?: string;
  nombre: string;
  ubicacion: string;
  historialMovimientos: Movimiento[];
  usuarioId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Movimiento {
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
  procedencia?: string;
  destino?: string;
  tipoMovimiento: 'venta' | 'compra' | 'pago';
  valor?: number;
  descripcion?: string;
  fechaRegistro: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const subastaService = {
  // Obtener todas las subastas
  getAllSubastas: async (): Promise<Subasta[]> => {
    const response = await axios.get(`${API_URL}/subastas`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Obtener una subasta por ID
  getSubastaById: async (id: string): Promise<Subasta> => {
    const response = await axios.get(`${API_URL}/subastas/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Crear una nueva subasta
  createSubasta: async (subasta: Omit<Subasta, '_id' | 'usuarioId' | 'createdAt' | 'updatedAt'>): Promise<Subasta> => {
    const response = await axios.post(`${API_URL}/subastas`, subasta, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Actualizar una subasta
  updateSubasta: async (id: string, subasta: Partial<Subasta>): Promise<Subasta> => {
    const response = await axios.put(`${API_URL}/subastas/${id}`, subasta, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Eliminar una subasta
  deleteSubasta: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/subastas/${id}`, {
      headers: getAuthHeader()
    });
  }
}; 