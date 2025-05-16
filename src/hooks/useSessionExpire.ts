import { useEffect, useState } from 'react';

// Hook para detectar expiración del token Firebase (simulación por tiempo)
// Puedes ajustar el tiempo o mejorarlo con lógica real de Firebase si tienes acceso al objeto auth
export function useSessionExpire(tokenKey: string = 'user', warningMinutes = 55) {
  const [expireDialogOpen, setExpireDialogOpen] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    // Leer el token y su expiración si lo tienes guardado
    const userData = localStorage.getItem(tokenKey);
    if (!userData) return;
    try {
      const parsed = JSON.parse(userData);
      // Si tienes el campo 'exp' en el token, úsalo. Si no, simulamos 1h desde login
      let expiresAt = parsed?.expiresAt;
      if (!expiresAt) {
        // Simula 1h desde que se guardó el user
        expiresAt = Date.now() + 60 * 60 * 1000;
      }
      const msLeft = expiresAt - Date.now();
      // Mostrar el diálogo warningMinutes antes de expirar
      const warningTime = msLeft - warningMinutes * 60 * 1000;
      if (warningTime > 0) {
        timeout = setTimeout(() => setExpireDialogOpen(true), warningTime);
      } else if (msLeft > 0) {
        // Si ya está cerca de expirar, mostrar inmediatamente
        setExpireDialogOpen(true);
      } else {
        // Si ya expiró, mostrar también el diálogo
        setExpireDialogOpen(true);
      }
    } catch {
      // Si no se puede parsear, no hacer nada
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [tokenKey, warningMinutes]);

  // Nuevo: Escucha el evento global 'tokenExpired' para mostrar el diálogo
  useEffect(() => {
    const handler = () => setExpireDialogOpen(true);
    window.addEventListener('tokenExpired', handler);
    return () => window.removeEventListener('tokenExpired', handler);
  }, []);

  return {
    expireDialogOpen,
    setExpireDialogOpen,
  };
}
