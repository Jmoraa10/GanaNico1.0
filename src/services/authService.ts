import axios from 'axios';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import '../firebaseConfig';

interface LoginResponse {
  customToken: string;
}

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
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para manejar errores de autenticación
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar datos de usuario
      localStorage.removeItem('user');
      // Si la ruta contiene 'venta', mostrar diálogo en vez de redirigir
      const path = window.location.pathname.toLowerCase();
      if (path.includes('venta')) {
        window.dispatchEvent(new Event('tokenExpired'));
        return Promise.reject(error);
      }
      // Si no es página de venta, redirigir
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
    const response = await axios.post<LoginResponse>(
      'http://localhost:3000/api/auth/login',
      { email, password }
    );
    const customToken = response.data.customToken;

    const auth = getAuth();
    const userCredential = await signInWithCustomToken(auth, customToken);
    const idToken = await userCredential.user.getIdToken();

    // Guardar el token y los datos del usuario
    const userData = {
      token: idToken,
      email: userCredential.user.email,
      uid: userCredential.user.uid
    };
    localStorage.setItem('user', JSON.stringify(userData));

    return idToken;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
      const axiosError = error as { 
        isAxiosError: boolean; 
        response?: { status?: number; data?: unknown }; 
        message: string 
      };
      console.error('Error en el login:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
    } else {
      console.error('Error desconocido en login:', error);
    }
    throw new Error('Credenciales inválidas o error en el servidor');
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export default API;