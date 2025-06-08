import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface User {
  uid: string;
  email: string | null;
  role: 'admin' | 'capataz';
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
    let unsubscribe: () => void;

    const initializeAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
              const userData = userDoc.data();
              
              const ADMIN_EMAILS = [
                'johanmora.jm@gmail.com',
                'mora.castro.raul@gmail.com'
              ];

              const userEmail = firebaseUser.email || '';
              const role = ADMIN_EMAILS.includes(userEmail) ? 'admin' : (userData?.role || 'capataz');

              const newUser = {
                uid: firebaseUser.uid,
                email: userEmail,
                role: role
              };

              setUser(newUser);

              if (ADMIN_EMAILS.includes(userEmail) && userData?.role !== 'admin') {
                await setDoc(doc(db, 'Users', firebaseUser.uid), {
                  uid: firebaseUser.uid,
                  email: userEmail,
                  role: 'admin',
                  updatedAt: new Date().toISOString()
                }, { merge: true });
              }
            } catch (error) {
              console.error('Error al obtener datos del usuario:', error);
              const userEmail = firebaseUser.email || '';
              const ADMIN_EMAILS = [
                'johanmora.jm@gmail.com',
                'mora.castro.raul@gmail.com'
              ];
              setUser({
                uid: firebaseUser.uid,
                email: userEmail,
                role: ADMIN_EMAILS.includes(userEmail) ? 'admin' : 'capataz'
              });
            }
          } else {
            setUser(null);
            localStorage.removeItem('user');
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error en la inicialización de autenticación:', error);
        setUser(null);
        localStorage.removeItem('user');
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 