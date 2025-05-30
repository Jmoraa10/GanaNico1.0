import API from './api';

export interface EventoAgenda {
  _id?: string;
  fecha: string;
  tipo: 'finca' | 'bodega' | 'venta' | 'subasta' | 'compra' | 'deuda' | 'otros';
  descripcion: string;
  lugar: string;
  detallesTexto: string;
  fechaVencimiento?: string;
  estado: 'pendiente' | 'completado' | 'vencido';
  detalles: {
    fincaId?: string;
    fincaNombre?: string;
    tipoMovimiento?: string;
    cantidad?: number;
    valor?: number;
    [key: string]: any;
  };
}

export interface NuevoEvento {
  fecha: string;
  tipo: 'finca' | 'bodega' | 'venta' | 'subasta' | 'compra' | 'deuda' | 'otros';
  descripcion: string;
  lugar: string;
  detallesTexto: string;
  fechaVencimiento?: string;
}

export const agendaService = {
  async getEventosPorMes(anio: number, mes: number): Promise<EventoAgenda[]> {
    try {
      const response = await API.get(`/agenda/mes/${anio}/${mes}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      return [];
    }
  },

  async getEventosPorDia(fecha: string): Promise<EventoAgenda[]> {
    try {
      const response = await API.get(`/agenda/dia/${fecha}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener eventos del día:', error);
      return [];
    }
  },

  async crearEvento(evento: NuevoEvento): Promise<EventoAgenda> {
    try {
      const response = await API.post('/agenda', evento);
      return response.data;
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  },

  async getEventosPendientes(): Promise<EventoAgenda[]> {
    try {
      const response = await API.get('/agenda/pendientes');
      return response.data;
    } catch (error) {
      console.error('Error al obtener eventos pendientes:', error);
      return [];
    }
  },

  async marcarEventoCumplido(eventoId: string): Promise<void> {
    try {
      await API.put(`/agenda/${eventoId}/cumplido`);
    } catch (error) {
      console.error('Error al marcar evento como cumplido:', error);
      throw error;
    }
  },

  async marcarEventoCumplidoConDetalles(eventoId: string, registradoPor: string, detallesCumplimiento: string): Promise<void> {
    try {
      await API.put(`/agenda/${eventoId}/cumplido`, { registradoPor, detallesCumplimiento });
    } catch (error) {
      console.error('Error al registrar cumplimiento:', error);
      throw error;
    }
  }
}; 