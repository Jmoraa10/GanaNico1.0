import axios from 'axios';

interface HealthResponse {
  status: string;
  message?: string;
}

// Configuración de la URL base del backend
const API = axios.create({
  baseURL: 'http://localhost:3000/api', // Asegúrate de que esta URL coincida con tu backend
});

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

// Interceptor para manejar expiración de sesión
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Excluir las páginas de ventas de la redirección automática
      const path = window.location.pathname.toLowerCase();
      if (path.includes('venta')) {
        window.dispatchEvent(new Event('tokenExpired'));
        return Promise.reject(error);
      }
      // Para el resto de páginas, sí redirige
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;