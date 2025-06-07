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
    const checkInitialAuth = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          setUser(null);
          setLoading(false);
          return;
        }

        const parsedData = JSON.parse(userData);
        if (!parsedData.token) {
          localStorage.removeItem('user');
          setUser(null);
          setLoading(false);
          return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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

              setUser({
                uid: firebaseUser.uid,
                email: userEmail,
                role: role
              });

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
            localStorage.removeItem('user');
            setUser(null);
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error en la verificación inicial:', error);
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
      }
    };

    checkInitialAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 