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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Obtener el rol del usuario desde Firestore
          const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
          const userData = userDoc.data();
          
          console.log('Datos del usuario en Firestore:', userData);
          
          // Lista de emails que serán administradores por defecto
          const ADMIN_EMAILS = [
            'johanmora.jm@gmail.com',
            'mora.castro.raul@gmail.com'
          ];

          const userEmail = firebaseUser.email || '';
          const role = ADMIN_EMAILS.includes(userEmail) ? 'admin' : (userData?.role || 'capataz');
          
          console.log('Email del usuario:', userEmail);
          console.log('Rol asignado:', role);

          setUser({
            uid: firebaseUser.uid,
            email: userEmail,
            role: role
          });

          // Si el usuario es admin por email pero no en Firestore, actualizar Firestore
          if (ADMIN_EMAILS.includes(userEmail) && userData?.role !== 'admin') {
            await setDoc(doc(db, 'Users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: userEmail,
              role: 'admin',
              updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log('Rol actualizado a admin en Firestore');
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          // En caso de error, asignar rol por email
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
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 