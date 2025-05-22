import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://gananico1-0.onrender.com/api';

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
  const userData = localStorage.getItem('user');
  if (!userData) {
    console.warn('No se encontró usuario en localStorage');
    return {};
  }
  
  try {
    const user = JSON.parse(userData);
    if (!user.token) {
      console.warn('No se encontró token en los datos del usuario');
      return {};
    }
    return { Authorization: `Bearer ${user.token}` };
  } catch (error) {
    console.error('Error al parsear datos del usuario:', error);
    return {};
  }
};

export const subastaService = {
  // Obtener todas las subastas
  getAllSubastas: async (): Promise<Subasta[]> => {
    try {
      const response = await axios.get(`${API_URL}/subastas`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener subastas:', error);
      throw error;
    }
  },

  // Obtener una subasta por ID
  getSubastaById: async (id: string): Promise<Subasta> => {
    try {
      const response = await axios.get(`${API_URL}/subastas/${id}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener subasta:', error);
      throw error;
    }
  },

  // Crear una nueva subasta
  createSubasta: async (subasta: Omit<Subasta, '_id' | 'usuarioId' | 'createdAt' | 'updatedAt'>): Promise<Subasta> => {
    try {
      const response = await axios.post(`${API_URL}/subastas`, subasta, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear subasta:', error);
      throw error;
    }
  },

  // Actualizar una subasta
  updateSubasta: async (id: string, subasta: Partial<Subasta>): Promise<Subasta> => {
    try {
      const response = await axios.put(`${API_URL}/subastas/${id}`, subasta, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar subasta:', error);
      throw error;
    }
  },

  // Eliminar una subasta
  deleteSubasta: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/subastas/${id}`, {
        headers: getAuthHeader()
      });
    } catch (error) {
      console.error('Error al eliminar subasta:', error);
      throw error;
    }
  }
}; 