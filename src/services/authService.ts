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

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
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
  
  try {
    const parsedData = JSON.parse(userData) as UserData;
    if (!parsedData.token) {
      throw new Error('Token no encontrado');
    }
    return parsedData.token;
  } catch (error) {
    localStorage.clear();
    throw new Error('Error al obtener el token');
  }
};

export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const response = await api.get<HealthResponse>('/health');
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
    // Primero intentamos autenticar con Firebase
    const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
    
    // Obtenemos el token de Firebase
    const token = await userCredential.user.getIdToken();
    
    if (!token) {
      throw new Error('No se pudo obtener el token de Firebase');
    }
    
    // Configuramos el token en las cabeceras de la API
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Verificamos la conexión con el backend
    const response = await api.get('/auth/verify');
    
    // Si la verificación es exitosa, retornamos los datos del usuario
    if (response.data.authenticated) {
      const userData = {
        email: userCredential.user.email || '',
        token: token,
        uid: userCredential.user.uid
      };

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      return { user: userData };
    }
    
    throw new Error('Error de autenticación con el backend');
  } catch (error: any) {
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
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    return true;
  } catch (error) {
    throw new Error('Error al cerrar sesión');
  }
};

export const checkAuth = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return false;
    
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/auth/verify');
    return response.data.authenticated;
  } catch (error) {
    return false;
  }
};

export default api;