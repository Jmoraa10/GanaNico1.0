import axios from 'axios';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import '../firebaseConfig';
import api from './api';

interface HealthResponse {
  status: string;
  message?: string;
}

interface UserData {
  token: string;
  email: string;
  uid: string;
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://inversiones-bonitoviento-sas.onrender.com/api',
});

// Interceptor para manejar errores de autenticación
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la petición API:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('idToken');
      const path = window.location.pathname.toLowerCase();
      if (path.includes('venta')) {
        window.dispatchEvent(new Event('tokenExpired'));
        return Promise.reject(error);
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función para obtener el token de autenticación
export const getAuthToken = async (): Promise<string> => {
  const userData = localStorage.getItem('user');
  if (!userData) {
    throw new Error('No hay sesión activa');
  }
  const { token } = JSON.parse(userData) as UserData;
  return token;
};

export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const response = await API.get<HealthResponse>('/health');
    return response.data;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
      const axiosError = error as { 
        isAxiosError: boolean; 
        response?: { status?: number; data?: unknown }; 
        message: string 
      };
      console.error('Error en el backend:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
    } else {
      console.error('Error desconocido:', error);
    }
    throw new Error('No se pudo conectar con el backend');
  }
};

export const login = async (email: string, password: string) => {
  try {
    console.log('Iniciando proceso de login...');
    
    // Primero intentamos autenticar con Firebase
    const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
    console.log('Autenticación con Firebase exitosa');
    
    // Obtenemos el token de Firebase
    const token = await userCredential.user.getIdToken();
    console.log('Token obtenido exitosamente');
    
    // Configuramos el token en las cabeceras de la API
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Verificamos la conexión con el backend
    try {
      const response = await api.get('/auth/verify');
      console.log('Verificación con backend exitosa:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error al verificar con el backend:', error);
      throw new Error('Error al conectar con el servidor. Por favor, intente más tarde.');
    }
  } catch (error: any) {
    console.error('Error en el proceso de login:', error);
    
    // Manejo específico de errores de Firebase
    switch (error.code) {
      case 'auth/invalid-credential':
        throw new Error('Credenciales inválidas. Por favor, verifique su email y contraseña.');
      case 'auth/user-disabled':
        throw new Error('Esta cuenta ha sido deshabilitada. Contacte al administrador.');
      case 'auth/user-not-found':
        throw new Error('No existe una cuenta con este email.');
      case 'auth/wrong-password':
        throw new Error('Contraseña incorrecta.');
      case 'auth/too-many-requests':
        throw new Error('Demasiados intentos fallidos. Por favor, intente más tarde.');
      default:
        throw new Error('Error al iniciar sesión. Por favor, intente nuevamente.');
    }
  }
};

export const logout = async () => {
  try {
    await signOut(getAuth());
    delete api.defaults.headers.common['Authorization'];
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw new Error('Error al cerrar sesión');
  }
};

export const checkAuth = async () => {
  try {
    const response = await api.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    return false;
  }
};

export default API;