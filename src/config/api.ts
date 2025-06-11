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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}); 