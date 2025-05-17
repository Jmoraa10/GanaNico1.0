import axios from 'axios';

interface HealthResponse {
  status: string;
  message?: string;
  cors?: {
    origin: string;
    allowedDomains: string[];
  };
}

// Configuración de la URL base del backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://gananico1-0.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
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

    // Log de la petición
    console.log('🚀 Enviando petición:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      withCredentials: config.withCredentials,
      baseURL: config.baseURL
    });

    return config;
  },
  (error) => {
    console.error('❌ Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
API.interceptors.response.use(
  (response) => {
    // Log de la respuesta exitosa
    console.log('✅ Respuesta recibida:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log detallado del error
    console.error('❌ Error en la petición API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.config?.headers,
      responseHeaders: error.response?.headers,
      withCredentials: error.config?.withCredentials,
      baseURL: error.config?.baseURL
    });

    if (error.code === 'ERR_NETWORK') {
      console.error('Error de red. Detalles:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      });
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
    console.log('🔍 Verificando conexión con el backend...');
    
    // Intentar primero con /health
    try {
      const response = await API.get<HealthResponse>('/health');
      console.log('✅ Backend responde en /health:', response.data);
      return response.data;
    } catch (error) {
      console.log('⚠️ Error en /health, intentando con /api/health');
    }
    
    // Si falla, intentar con /api/health
    const response = await API.get<HealthResponse>('/api/health');
    console.log('✅ Backend responde en /api/health:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al conectar con el backend:', error);
    throw error;
  }
};

export default API;