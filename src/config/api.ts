import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL.replace('/api', '') || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}); 