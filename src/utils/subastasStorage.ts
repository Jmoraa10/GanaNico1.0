const SUBASTAS_KEY = 'subastas';

export interface Subasta {
  id: string;
  nombre: string;
  ubicacion: string;
  ventas: any[];
  compras: any[];
  pagos: any[];
  historialMovimientos: any[];
}

export function getAllSubastas(): Subasta[] {
  const stored = localStorage.getItem(SUBASTAS_KEY);
  if (!stored) return [];
  try {
    const arr = JSON.parse(stored);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function getSubastaById(id: string): Subasta | null {
  return getAllSubastas().find(s => s.id === id) || null;
}

export function saveSubasta(subasta: Subasta) {
  const subastas = getAllSubastas();
  const idx = subastas.findIndex(s => s.id === subasta.id);
  if (idx >= 0) {
    subastas[idx] = subasta;
  } else {
    subastas.push(subasta);
  }
  localStorage.setItem(SUBASTAS_KEY, JSON.stringify(subastas));
}

export function deleteSubasta(id: string) {
  const subastas = getAllSubastas().filter(s => s.id !== id);
  localStorage.setItem(SUBASTAS_KEY, JSON.stringify(subastas));
} 