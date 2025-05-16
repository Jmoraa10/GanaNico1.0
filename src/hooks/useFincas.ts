import { useState, useEffect, useCallback } from 'react';
import { Finca, FincaFormData, MovimientoGanado } from '../types/FincaTypes';
import { 
  getFincas, 
  getFincaById, 
  createFinca, 
  updateFinca as apiUpdateFinca,
  addMovimientoGanado as apiAddMovimientoGanado,
  deleteFinca as apiDeleteFinca
} from '../services/fincaService';

export const useFincas = () => {
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFincas = async () => {
    try {
      setLoading(true);
      const data = await getFincas();
      setFincas(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const addFinca = async (fincaData: FincaFormData) => {
    try {
      setLoading(true);
      const newFinca = await createFinca(fincaData);
      setFincas(prev => [...prev, newFinca]);
      return newFinca;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear finca');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateFinca = async (id: string, fincaData: Partial<FincaFormData>) => {
    try {
      setLoading(true);
      const updatedFinca = await apiUpdateFinca(id, fincaData);
      setFincas(prev => prev.map(f => f.id === id ? updatedFinca : f));
      return updatedFinca;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar finca');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addMovimientoGanado = async (fincaId: string, movimiento: Omit<MovimientoGanado, 'id'>) => {
    try {
      setLoading(true);
      const newMovimiento = await apiAddMovimientoGanado(fincaId, movimiento);
      // Actualizar la finca en el estado local
      setFincas(prev => prev.map(f => {
        if (f.id === fincaId) {
          return {
            ...f,
            movimientosGanado: [...(f.movimientosGanado || []), newMovimiento]
          };
        }
        return f;
      }));
      return newMovimiento;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar movimiento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFinca = async (id: string) => {
    try {
      setLoading(true);
      await apiDeleteFinca(id);
      setFincas(prev => prev.filter(f => f.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar finca');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFincas();
  }, []);

  return { 
    fincas, 
    loading, 
    error, 
    addFinca, 
    updateFinca, 
    addMovimientoGanado,
    deleteFinca,
    reload: loadFincas 
  };
};

export const useFinca = (id: string) => {
  const [finca, setFinca] = useState<Finca | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFinca = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getFincaById(id);
      if (data) {
        setFinca(data);
      } else {
        setError('Finca no encontrada');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const updateFinca = async (updatedFinca: Finca) => {
    try {
      setLoading(true);
      const data = await apiUpdateFinca(id, updatedFinca);
      if (data) {
        setFinca(data);
        return data;
      } else {
        setError('Error al actualizar la finca');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la finca');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinca();
  }, [loadFinca]);

  return { finca, loading, error, reload: loadFinca, updateFinca };
};