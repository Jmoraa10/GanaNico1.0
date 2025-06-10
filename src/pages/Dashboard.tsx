import React, { useEffect, useState } from 'react';
import { checkHealth } from '../services/api';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../services/firebase';
import LoadingScreen from './LoadingScreen';
import { useLogout } from '../hooks/useLogout';

interface HealthStatus {
  status: string;
  timestamp?: string;
  services?: {
    firebase: string;
    database: string;
  };
  message?: string;
  allowedOrigins?: string[];
}

const Dashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Estado para la pantalla de carga
  const logout = useLogout();

  useEffect(() => {
    const fetchHealthStatus = async () => {
      try {
        const data = await checkHealth();
        setHealthStatus(data);
      } catch (error) {
        console.error('Error al conectar con el backend:', error);
        setHealthStatus({ status: 'error', message: 'No se pudo conectar con el backend' });
      } finally {
        setIsLoading(false); // Ocultar la pantalla de carga
      }
    };

    fetchHealthStatus();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Usuario autenticado:', result.user);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  if (isLoading) {
    return <LoadingScreen />; // Mostrar la pantalla de carga mientras se obtiene el estado del backend
  }

  return (
    <div>
      <h1>Dashboard - Inversiones Bonito Viento SAS</h1>
      <h2>Estado del Backend:</h2>
      {healthStatus ? (
        <pre>{JSON.stringify(healthStatus, null, 2)}</pre>
      ) : (
        <p>Cargando...</p>
      )}
      <button onClick={handleLogin}>Iniciar sesión con Google</button>
      <button
        onClick={logout}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default Dashboard;
