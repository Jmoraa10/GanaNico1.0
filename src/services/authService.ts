import axios from 'axios';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import '../firebaseConfig';

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

export const login = async (email: string, password: string): Promise<string> => {
  try {
    console.log('Iniciando proceso de login con Firebase...');
    const auth = getAuth();
    console.log('Auth instance obtenida');
    
    console.log('Intentando autenticar con Firebase...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Usuario autenticado con Firebase:', userCredential.user.email);
    
    console.log('Obteniendo token de Firebase...');
    const idToken = await userCredential.user.getIdToken();
    console.log('Token obtenido de Firebase');

    const userData = {
      token: idToken,
      email: userCredential.user.email,
      uid: userCredential.user.uid
    };
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('Datos de usuario guardados en localStorage');

    return idToken;
  } catch (error: any) {
    console.error('Error detallado en login:', {
      code: error.code,
      message: error.message,
      fullError: error
    });
    
    if (error.code === 'auth/user-not-found') {
      throw new Error('No existe una cuenta con este correo electrónico');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Contraseña incorrecta');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Credenciales inválidas. Por favor, verifica tu correo y contraseña');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos fallidos. Por favor, intenta más tarde');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Error de conexión. Por favor, verifica tu conexión a internet');
    } else {
      throw new Error(`Error al iniciar sesión: ${error.message}`);
    }
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('idToken');
};

export default API;