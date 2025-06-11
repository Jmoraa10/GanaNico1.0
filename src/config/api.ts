import axios from 'axios';

const PRODUCTION_URL = 'https://gananico1-0.onrender.com';
const DEVELOPMENT_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? PRODUCTION_URL : DEVELOPMENT_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const { token } = JSON.parse(userData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al parsear datos del usuario:', error);
    }
  }
  return config;
}); 