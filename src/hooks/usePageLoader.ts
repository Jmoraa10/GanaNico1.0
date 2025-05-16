// src/hooks/usePageLoader.ts
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageLoader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1500); // Puedes ajustar el tiempo de carga

    return () => clearTimeout(timeout);
  }, [location]);

  return loading;
};