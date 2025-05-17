import axios from 'axios';
import { getAuthToken } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://gananico1-0.onrender.com/api';

// Función auxiliar para hacer solicitudes autenticadas
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  const config = {
    url,
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers as Record<string, string> || {})
    },
    data: options.body ? JSON.parse(options.body as string) : undefined
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.mensaje || 'Error en la solicitud');
    }
    throw error;
  }
};

export const crearVenta = async (ventaData: any) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/ventas`, {
      method: 'POST',
      body: JSON.stringify(ventaData)
    });
    return response;
  } catch (error) {
    console.error('Error al crear la venta:', error);
    throw error;
  }
};

export const getVentasByFinca = async (fincaId: string) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/ventas/finca/${fincaId}`);
    return response;
  } catch (error) {
    console.error('Error al obtener las ventas:', error);
    throw error;
  }
};

export const getVentaById = async (id: string) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/ventas/${id}`);
    return response;
  } catch (error) {
    console.error('Error al obtener la venta:', error);
    throw error;
  }
}; 