import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string | null;
  role: 'admin' | 'capataz' | 'camionero';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    setLoading(true);
    setUser(null);
    localStorage.removeItem('user');
    console.log('[AuthContext] Limpieza inicial de localStorage y user');

    unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('[AuthContext] onAuthStateChanged:', firebaseUser);
      if (firebaseUser && firebaseUser.email) {
        try {
          const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
          const userData = userDoc.data();
          const ADMIN_EMAILS = [
            'johanmora.jm@gmail.com',
            'mora.castro.raul@gmail.com'
          ];
          const userEmail = firebaseUser.email;
          let role: 'admin' | 'capataz' | 'camionero';
          if (ADMIN_EMAILS.includes(userEmail)) {
            role = 'admin';
          } else if (userData?.role) {
            role = userData.role;
          } else {
            role = 'capataz'; // Rol por defecto
          }
          const newUser = {
            uid: firebaseUser.uid,
            email: userEmail,
            role: role,
            name: userData?.name
          };
          // Guardar en localStorage solo si tenemos un token válido
          const token = await firebaseUser.getIdToken();
          if (token) {
            localStorage.setItem('user', JSON.stringify({
              uid: firebaseUser.uid,
              email: userEmail,
              token: token,
              role: role,
              name: userData?.name
            }));
            setUser(newUser);
            console.log('[AuthContext] Usuario seteado:', newUser);
          } else {
            setUser(null);
            localStorage.removeItem('user');
            console.log('[AuthContext] Token inválido, usuario removido');
          }
          if (ADMIN_EMAILS.includes(userEmail) && userData?.role !== 'admin') {
            await setDoc(doc(db, 'Users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: userEmail,
              role: 'admin',
              name: userData?.name,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (error) {
          console.error('[AuthContext] Error al obtener datos del usuario:', error);
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
        console.log('[AuthContext] No hay usuario autenticado, localStorage limpiado');
      }
      setLoading(false);
      console.log('[AuthContext] Loading:', false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 