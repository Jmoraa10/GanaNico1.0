// src/services/fincaService.ts
import { Finca, FincaFormData, Animales, MovimientoGanado } from '../types/FincaTypes'; // Asegúrate que Bodega se importa
import API from './authService';
import axios, { AxiosRequestConfig } from 'axios';

// Clave para guardar/leer en localStorage
const LOCAL_STORAGE_KEY = 'fincasApp_fincasData';

// Datos iniciales (solo se usan si no hay nada en localStorage)
const initialFincasData: Finca[] = [
  {
    id: '1',
    nombre: 'Hacienda Mónaco',
    capataz: 'El Flaco',
    ubicacion: 'Vereda La Esperanza',
    hectareas: 50,
    animales: {
      hembras: { 
        levante: 15, 
        vientre: 20, 
        preñadas: 8, 
        escoteras: 0,
        paridas: { 
          total: 12, 
          machos: 5, 
          hembras: 7 
        } 
      },
      machos: { ceba: 10, levante: 8 },
      bufalos: {
        machos: {
          ceba: 0,
          levante: 0
        },
        hembras: {
          levante: 0,
          vientre: 0,
          preñadas: 0,
          escoteras: 0,
          paridas: {
            total: 0,
            machos: 0,
            hembras: 0
          }
        }
      },
      equinos: {
        caballos: 3,
        yeguas: 2,
        potros: 1,
        mulas: 0,
        yeguasParidas: { 
          total: 0, 
          machos: 0, 
          hembras: 0 
        }
      },
      otros: { 
        cabras: 5, 
        peces: 0, 
        pollos: 0,
        cabrasParidas: { 
          total: 0, 
          machos: 0, 
          hembras: 0 
        }
      }
    },
    bodega: {
      suministros: [
        { nombre: 'Sillas de montar', cantidad: 2, esFaltante: false },
        { nombre: 'Cuido de ordeño', cantidad: 5, esFaltante: false },
        { nombre: 'Melaza', cantidad: 3, esFaltante: false }
      ],
      veterinarios: [
        { nombre: 'Oxitocina', cantidad: 4, esFaltante: false },
        { nombre: 'Betametasona', cantidad: 2, esFaltante: false },
        { nombre: 'Oxitetraciclina', cantidad: 6, esFaltante: false }
      ]
    },
    movimientosGanado: [],
    createdAt: new Date('2024-01-10T10:00:00Z').toISOString()
  }
  // Puedes añadir más fincas iniciales aquí si quieres
];

// --- Funciones Auxiliares para Manejar Datos ---

// @ts-ignore
const getCurrentFincas = (): Finca[] => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      // Si hay datos guardados, úsalos
      return JSON.parse(storedData) as Finca[];
    } else {
      // Si no hay nada guardado, usa los datos iniciales y guárdalos
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialFincasData));
      return initialFincasData;
    }
  } catch (error) {
    console.error("Error al leer fincas desde localStorage:", error);
    // En caso de error (ej: JSON mal formado), usa los iniciales como respaldo
    return initialFincasData;
  }
};

// @ts-ignore
const saveFincasToLocalStorage = (fincas: Finca[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fincas));
  } catch (error) {
    console.error("Error al guardar fincas en localStorage:", error);
  }
};

// URLs base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Función auxiliar para obtener el token de Firebase
const getAuthToken = async (): Promise<string> => {
  const user = localStorage.getItem('user');
  if (!user) {
    throw new Error('Usuario no autenticado');
  }
  const { token } = JSON.parse(user);
  return token;
};

// Función auxiliar para hacer solicitudes autenticadas
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  const config: AxiosRequestConfig = {
    url,
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers as Record<string, string> || {})
    },
    data: options.body ? JSON.parse(options.body as string) : undefined
  };

  try {
    const response = await API(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Error en la solicitud');
    }
    throw error;
  }
};

// Obtener todas las fincas
export const getFincas = async (): Promise<Finca[]> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/fincas`);
    const fincas = await response;
    return fincas.map((finca: Finca) => ({
      ...finca,
      id: finca._id || finca.id // Aseguramos que siempre haya un id
    }));
  } catch (error) {
    console.error('Error al obtener fincas:', error);
    throw error;
  }
};

// Obtener una finca por ID
export const getFincaById = async (id: string): Promise<Finca> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/fincas/${id}`);
    const finca = await response;
    return {
      ...finca,
      id: finca._id || finca.id // Aseguramos que siempre haya un id
    };
  } catch (error) {
    console.error('Error al obtener finca:', error);
    throw error;
  }
};

// Crear una nueva finca
export const createFinca = async (fincaData: FincaFormData): Promise<Finca> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/fincas`, {
      method: 'POST',
      body: JSON.stringify(fincaData)
    });
    const finca = await response;
    return {
      ...finca,
      id: finca._id || finca.id // Aseguramos que siempre haya un id
    };
  } catch (error) {
    console.error('Error al crear finca:', error);
    throw error;
  }
};

// Actualizar una finca
export const updateFinca = async (id: string, fincaData: Partial<FincaFormData>): Promise<Finca> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/fincas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fincaData)
    });
    const finca = await response;
    return {
      ...finca,
      id: finca._id || finca.id // Aseguramos que siempre haya un id
    };
  } catch (error) {
    console.error('Error al actualizar finca:', error);
    throw error;
  }
};

// Eliminar una finca
export const deleteFinca = async (id: string): Promise<void> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/fincas/${id}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error al eliminar finca:', error);
    throw error;
  }
};

// Agregar un movimiento de ganado
export const addMovimientoGanado = async (
  fincaId: string,
  movimiento: Omit<MovimientoGanado, 'id'>
): Promise<MovimientoGanado> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/movimientos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...movimiento, fincaId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al agregar movimiento');
    }

    const movimientoGuardado = await response.json();
    return {
      ...movimientoGuardado,
      id: movimientoGuardado._id || movimientoGuardado.id
    };
  } catch (error) {
    console.error('Error al agregar movimiento:', error);
    throw error;
  }
};

// Obtener movimientos de ganado por finca
export const getMovimientosGanado = async (fincaId: string): Promise<MovimientoGanado[]> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/movimientos/finca/${fincaId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener movimientos');
    }

    const movimientos = await response.json();
    return movimientos.map((movimiento: MovimientoGanado) => ({
      ...movimiento,
      id: movimiento._id || movimiento.id
    }));
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    throw error;
  }
};

// --- Funciones de Cálculo (Utilidades) ---

// Tu función calcularTotalAnimales parece estar bien, la dejamos como está
export const calcularTotalAnimales = (animales: Animales): number => {
  if (!animales) return 0;

  // Ganado bovino
  const sumHembras =
    (animales.hembras?.levante || 0) +
    (animales.hembras?.vientre || 0) +
    (animales.hembras?.preñadas || 0) +
    (animales.hembras?.escoteras || 0) +
    (animales.hembras?.paridas?.total || 0);

  const sumMachos =
    (animales.machos?.ceba || 0) +
    (animales.machos?.levante || 0);

  // Equinos
  const sumEquinos =
    (animales.equinos?.caballos || 0) +
    (animales.equinos?.yeguas || 0) +
    (animales.equinos?.potros || 0) +
    (animales.equinos?.mulas || 0);

  // Otros animales
  const sumOtros =
    (animales.otros?.cabras || 0) +
    (animales.otros?.peces || 0) +
    (animales.otros?.pollos || 0) +
    (animales.otros?.cabrasParidas?.total || 0);

  // Bufalos
  const sumBufalosMachos =
    (animales.bufalos?.machos?.ceba || 0) +
    (animales.bufalos?.machos?.levante || 0);

  const sumBufalosHembras =
    (animales.bufalos?.hembras?.levante || 0) +
    (animales.bufalos?.hembras?.vientre || 0) +
    (animales.bufalos?.hembras?.preñadas || 0) +
    (animales.bufalos?.hembras?.escoteras || 0) +
    (animales.bufalos?.hembras?.paridas?.total || 0);

  return (
    sumHembras +
    sumMachos +
    sumEquinos +
    sumOtros +
    sumBufalosMachos +
    sumBufalosHembras
  );
};