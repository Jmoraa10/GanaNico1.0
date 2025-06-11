import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService'; // Asegúrate que este servicio existe
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Estado para indicar carga
  const navigate = useNavigate();
  const { user } = useAuth();

  // Si ya hay un usuario autenticado, redirigir a home
  React.useEffect(() => {
    if (user) {
      console.log('[LoginScreen] Usuario autenticado, redirigiendo a home:', user);
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      console.log('[LoginScreen] Login exitoso:', response);
      
      // Asegurarnos de que tenemos todos los datos necesarios
      if (!response.user || !response.user.token) {
        throw new Error('Error en la respuesta del servidor');
      }

      // El AuthContext y el useEffect se encargan de la redirección
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Credenciales inválidas o error de red.');
        console.error('[LoginScreen] Error de login:', err.message);
      } else {
        setError('Ocurrió un error desconocido.');
        console.error('[LoginScreen] Error desconocido:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Contenedor principal relativo para posicionar la imagen de fondo
    <div className="relative w-screen h-screen overflow-hidden bg-gray-200">
        {/* Imagen de fondo con posicionamiento absoluto y opacidad */}
        <img
            // Asegúrate que la ruta a tu logo es correcta
            src="/assets/images/logo.png"
            alt="Fondo"
            className="absolute top-0 left-0 w-full h-full object-cover opacity-50 z-0" // Ajusta la opacidad como necesites
        />

        {/* Contenedor para centrar el formulario de login */}
        <div className="relative z-10 flex justify-center items-center w-full h-full p-4">
            {/* Tarjeta del formulario con fondo semi-transparente y blur */}
            <motion.div
              // bg-white/70 o bg-white/80 da buena legibilidad. backdrop-blur-md añade el difuminado del fondo.
              className="bg-white/75 backdrop-blur-md p-6 rounded-2xl w-[90%] max-w-sm shadow-2xl border border-gray-300"
              initial={{ opacity: 0, y: 20 }} // Animación sutil de entrada
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <h2 className="text-2xl font-bold text-green-900 mb-5 text-center font-rioGrande">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input
                    type="email"
                    id="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required // Añadir required para validación básica
                    className="w-full px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm shadow-sm"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required // Añadir required
                    className="w-full px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm shadow-sm"
                    />
                </div>
                {error && (
                    <p className="text-red-600 text-sm text-center bg-red-100 p-2 rounded border border-red-300">{error}</p>
                )}
                <button
                    type="submit"
                    disabled={loading} // Deshabilitar botón mientras carga
                    className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition duration-300 disabled:opacity-60"
                >
                    {loading ? 'Ingresando...' : 'Ingresar'}
                </button>
                </form>
            </motion.div>
        </div>
    </div>
  );
};

export default LoginScreen;