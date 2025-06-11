import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import api from './api';

// Lista de emails que serán administradores por defecto
const ADMIN_EMAILS = [
  'johanmora.jm@gmail.com',
  'mora.castro.raul@gmail.com'
];

interface HealthResponse {
  status: string;
  message?: string;
}

interface UserData {
  token: string;
  email: string;
  uid: string;
  role: 'admin' | 'capataz';
}

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar datos de autenticación
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      // Redirigir al login
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Obtenemos el token de Firebase
    const token = await userCredential.user.getIdToken();
    
    if (!token) {
      throw new Error('No se pudo obtener el token de Firebase');
    }
    
    // Configuramos el token en las cabeceras de la API
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
      // Verificamos la conexión con el backend
      const response = await api.get('/auth/verify');
      
      // Si la verificación es exitosa, retornamos los datos del usuario
      if (response.data.authenticated) {
        const userEmail = userCredential.user.email || '';
        const isAdmin = ADMIN_EMAILS.includes(userEmail);
        
        try {
          // Verificar si el usuario existe en Firestore
          const userDocRef = doc(db, 'Users', userCredential.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          let role: 'admin' | 'capataz' = 'capataz';
          
          if (isAdmin) {
            role = 'admin';
            // Si es admin, actualizar el documento
            await setDoc(userDocRef, {
              uid: userCredential.user.uid,
              email: userEmail,
              role: 'admin',
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } else if (userDoc.exists()) {
            // Si no es admin pero existe el documento, usar el rol existente
            role = userDoc.data().role || 'capataz';
          } else {
            // Si no existe el documento, crear uno nuevo con rol capataz
            await setDoc(userDocRef, {
              uid: userCredential.user.uid,
              email: userEmail,
              role: 'capataz',
              createdAt: new Date().toISOString()
            }, { merge: true });
          }

          const userData: UserData = {
            email: userEmail,
            token: token,
            uid: userCredential.user.uid,
            role: role
          };

          // Guardar en localStorage
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('[authService] Usuario guardado en localStorage:', userData);
          
          return { user: userData };
        } catch (firestoreError) {
          console.error('[authService] Error al manejar el documento de usuario:', firestoreError);
          // Si falla Firestore, aún permitimos el login con rol por defecto
          const userData: UserData = {
            email: userEmail,
            token: token,
            uid: userCredential.user.uid,
            role: isAdmin ? 'admin' : 'capataz'
          };
          localStorage.setItem('user', JSON.stringify(userData));
          return { user: userData };
        }
      }
    } catch (apiError) {
      console.error('[authService] Error al verificar con el backend:', apiError);
      // Si falla la verificación con el backend, aún permitimos el login
      const userData: UserData = {
        email: userCredential.user.email || '',
        token: token,
        uid: userCredential.user.uid,
        role: ADMIN_EMAILS.includes(userCredential.user.email || '') ? 'admin' : 'capataz'
      };
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
        console.error('[authService] Error de autenticación:', error);
        throw new Error('Error al iniciar sesión. Por favor, intente nuevamente.');
    }
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    return true;
  } catch (error) {
    throw new Error('Error al cerrar sesión');
  }
};

export const checkAuth = async () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return false;
    
    const parsedData = JSON.parse(userData);
    if (!parsedData.token) return false;
    
    // Configurar el token en las cabeceras
    api.defaults.headers.common['Authorization'] = `Bearer ${parsedData.token}`;
    
    // Verificar el token con el backend
    const response = await api.get('/auth/verify');
    return response.data.authenticated;
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
    // Si hay error, limpiar el localStorage y retornar false
    localStorage.removeItem('user');
    return false;
  }
};

export const updateUserRole = async (userId: string, newRole: 'admin' | 'capataz') => {
  try {
    const userDocRef = doc(db, 'Users', userId);
    await setDoc(userDocRef, {
      role: newRole
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error al actualizar el rol del usuario:', error);
    throw new Error('No se pudo actualizar el rol del usuario');
  }
};

export const createUserInFirestore = async (uid: string, data: { email: string; name: string; phone: string; role: string; }) => {
  await setDoc(doc(db, 'Users', uid), {
    uid,
    ...data,
    createdAt: new Date().toISOString(),
  }, { merge: true });
};

export const sendPasswordReset = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const getLastSignIn = async (uid: string) => {
  // Se debe obtener desde Firebase Auth, no Firestore
  // Esto requiere privilegios de admin en backend, pero aquí solo retornamos null
  return null;
};

export default api;