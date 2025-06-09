import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { ViajeTransporte, ResumenViaje } from '../types/Transporte';

const COLLECTION_NAME = 'transportes';

export const transporteService = {
  async crearViaje(viaje: Omit<ViajeTransporte, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): Promise<ViajeTransporte> {
    const viajeData = {
      ...viaje,
      fechaCreacion: Timestamp.now(),
      fechaActualizacion: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), viajeData);
    return {
      ...viajeData,
      id: docRef.id,
      fechaCreacion: viajeData.fechaCreacion.toDate(),
      fechaActualizacion: viajeData.fechaActualizacion.toDate(),
    } as ViajeTransporte;
  },

  async actualizarViaje(id: string, viaje: Partial<ViajeTransporte>): Promise<void> {
    const viajeRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(viajeRef, {
      ...viaje,
      fechaActualizacion: Timestamp.now(),
    });
  },

  async eliminarViaje(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  async obtenerViajesEnCurso(): Promise<ViajeTransporte[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('estado', '==', 'EN_CURSO'),
      orderBy('fechaCreacion', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      fechaCreacion: doc.data().fechaCreacion.toDate(),
      fechaActualizacion: doc.data().fechaActualizacion.toDate(),
      horaInicio: doc.data().horaInicio.toDate(),
      horaCulminacion: doc.data().horaCulminacion?.toDate(),
    })) as ViajeTransporte[];
  },

  async obtenerViajesCulminados(): Promise<ViajeTransporte[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('estado', '==', 'CULMINADO'),
      orderBy('fechaCreacion', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      fechaCreacion: doc.data().fechaCreacion.toDate(),
      fechaActualizacion: doc.data().fechaActualizacion.toDate(),
      horaInicio: doc.data().horaInicio.toDate(),
      horaCulminacion: doc.data().horaCulminacion?.toDate(),
    })) as ViajeTransporte[];
  },

  calcularResumenViaje(viaje: ViajeTransporte): ResumenViaje {
    const resumen: ResumenViaje = {
      totalAnimales: 0,
      resumenAnimales: {},
      totalSuministros: 0,
      totalGastos: 0,
    };

    // Calcular totales de animales
    if (viaje.animales) {
      viaje.animales.forEach(animal => {
        resumen.totalAnimales += animal.cantidad;
        resumen.resumenAnimales[animal.tipo] = (resumen.resumenAnimales[animal.tipo] || 0) + animal.cantidad;
      });
    }

    // Calcular totales de suministros
    if (viaje.suministros) {
      resumen.totalSuministros = viaje.suministros.reduce((total, suministro) => total + suministro.cantidad, 0);
    }

    // Calcular totales de gastos
    resumen.totalGastos = viaje.gastos.diesel + viaje.gastos.peajes + viaje.gastos.viaticos;

    return resumen;
  }
}; 