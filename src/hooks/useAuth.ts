import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (!user) {
        navigate('/login');
      }
    };

    // Verificar al montar el componente
    checkAuth();

    // Agregar listener para cambios en localStorage
    window.addEventListener('storage', (e) => {
      if (e.key === 'user' && !e.newValue) {
        navigate('/login');
      }
    });

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return { logout };
}; 