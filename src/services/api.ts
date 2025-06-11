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
  timeout: 15000
});

// Interceptor para requests
API.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const { token } = JSON.parse(userData);
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar timestamp para evitar caché
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.');
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('idToken');
      window.location.href = '/login';
      return Promise.reject(new Error('Su sesión ha expirado. Por favor, inicie sesión nuevamente.'));
    }

    if (error.response?.status === 403) {
      throw new Error('No tiene permisos para realizar esta acción.');
    }

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

// Transport endpoints
export const transportApi = {
  crearViaje: (data: any) => API.post('/transportes', data),
  obtenerViajes: () => API.get('/transportes'),
  obtenerViajesEnCurso: () => API.get('/transportes/en-curso'),
  obtenerViajesCulminados: () => API.get('/transportes/culminados'),
  obtenerViaje: (id: string) => API.get(`/transportes/${id}`),
  actualizarViaje: (id: string, data: any) => API.put(`/transportes/${id}`, data),
  eliminarViaje: (id: string) => API.delete(`/transportes/${id}`),
};

export default API;