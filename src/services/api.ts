import axios from 'axios';

interface HealthResponse {
  status: string;
  message?: string;
}

// Configuración de la URL base del backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://inversiones-bonitoviento-sas.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Interceptor para manejar errores
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición API:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Ejemplo de función para probar la conectividad
export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const response = await API.get<HealthResponse>('/health');
    return response.data;
  } catch (error) {
    console.error('Error al conectar con el backend:', error);
    throw error;
  }
};

export default API;