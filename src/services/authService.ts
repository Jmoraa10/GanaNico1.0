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
    console.log('🔴 Error en interceptor:', error.response?.status);
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función para obtener el token de autenticación
export const getAuthToken = async (): Promise<string> => {
  console.log('🔍 Buscando token en localStorage...');
  const userData = localStorage.getItem('user');
  console.log('📦 Datos encontrados en localStorage:', userData);
  
  if (!userData) {
    throw new Error('No hay sesión activa');
  }
  
  try {
    const parsedData = JSON.parse(userData) as UserData;
    console.log('🔑 Token parseado:', parsedData);
    
    if (!parsedData.token) {
      throw new Error('Token no encontrado');
    }
    return parsedData.token;
  } catch (error) {
    console.error('❌ Error al parsear token:', error);
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
  console.log('🚀 Iniciando proceso de login...');
  try {
    // Primero intentamos autenticar con Firebase
    console.log('🔥 Autenticando con Firebase...');
    const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
    console.log('✅ Autenticación Firebase exitosa:', userCredential.user.uid);
    
    // Obtenemos el token de Firebase
    console.log('🔑 Obteniendo token de Firebase...');
    const token = await userCredential.user.getIdToken();
    console.log('✅ Token obtenido:', token ? 'Sí' : 'No');
    
    if (!token) {
      throw new Error('No se pudo obtener el token de Firebase');
    }
    
    // Configuramos el token en las cabeceras de la API
    console.log('🔧 Configurando token en headers...');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Verificamos la conexión con el backend
    console.log('🔄 Verificando con backend...');
    const response = await api.get('/auth/verify');
    console.log('✅ Respuesta del backend:', response.data);
    
    // Si la verificación es exitosa, retornamos los datos del usuario
    if (response.data.authenticated) {
      const userData = {
        email: userCredential.user.email || '',
        token: token,
        uid: userCredential.user.uid
      };
      console.log('✅ Datos de usuario preparados:', userData);
      return { user: userData };
    }
    
    throw new Error('Error de autenticación con el backend');
  } catch (error: any) {
    console.error('❌ Error en login:', error);
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
  console.log('🚪 Iniciando proceso de logout...');
  try {
    await signOut(getAuth());
    console.log('✅ Firebase logout exitoso');
    localStorage.clear();
    console.log('🧹 LocalStorage limpiado');
    delete api.defaults.headers.common['Authorization'];
    console.log('🔑 Headers de autorización eliminados');
    return true;
  } catch (error) {
    console.error('❌ Error en logout:', error);
    throw new Error('Error al cerrar sesión');
  }
};

export const checkAuth = async () => {
  console.log('🔍 Verificando autenticación...');
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log('❌ No se encontró token');
      return false;
    }
    
    console.log('✅ Token encontrado, verificando con backend...');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get('/auth/verify');
    console.log('✅ Respuesta de verificación:', response.data);
    return response.data.authenticated;
  } catch (error) {
    console.error('❌ Error en checkAuth:', error);
    return false;
  }
};

export default api;