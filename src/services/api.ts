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
  timeout: 15000, // 15 segundos de timeout
  validateStatus: (status) => status >= 200 && status < 500 // Aceptar todos los status codes excepto errores del servidor
});

// Interceptor para requests
API.interceptors.request.use(
  (config) => {
    // Agregar timestamp para evitar caché
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => {
    console.error('Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detallado del error
    console.error('Error en la petición API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.config?.headers
    });

    if (error.code === 'ERR_NETWORK') {
      throw new Error('No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.');
    }

    if (error.response?.status === 401) {
      throw new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
    }

    if (error.response?.status === 403) {
      throw new Error('No tiene permisos para realizar esta acción.');
    }

    // Si hay un mensaje de error del servidor, usarlo
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('Error al procesar la solicitud. Por favor, intente nuevamente.');
  }
);

// Función para probar la conectividad
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