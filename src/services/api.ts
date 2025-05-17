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
  withCredentials: true,
  timeout: 10000 // 10 segundos de timeout
});

// Interceptor para manejar errores
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Error de red al conectar con el backend:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      });
      throw new Error('No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.');
    }

    if (error.response?.status === 401) {
      console.error('Error de autenticación:', error.response.data);
      throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    }

    console.error('Error en la petición API:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
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