// src/routes/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from '../pages/LoadingScreen';
import HomeScreen from '../pages/HomeScreen';
import LoginScreen from '../pages/LoginScreen';
import FincasScreen from '../pages/FincasScreen';
import FincasForm from '../pages/FincasForm';
import Dashboard from '../pages/Dashboard';
import FincasDetalleScreen from '../pages/FincasDetalleScreen';
import BodegaEditForm from '../pages/BodegaEditForm';
import MovimientosAnimales from '../pages/MovimientosAnimales';
import MovimientosBodega from '../pages/MovimientosBodega';
import VentaGanado from '../pages/VentaGanado';
import VentaReporte from '../pages/VentaReporte';
import UnderConstruction from '../pages/UnderConstruction';
import { SubastasScreen, SubastaDetalleScreen } from '../pages/Subastas';
import ConsolidadoScreen from '../pages/Consolidado/ConsolidadoScreen';
import AnimalesConsolidadoScreen from '../pages/Consolidado/AnimalesConsolidadoScreen';
import SubastasConsolidadoScreen from '../pages/Consolidado/SubastasConsolidadoScreen';
import BodegasConsolidadoScreen from '../pages/Consolidado/BodegasConsolidadoScreen';
import AgendaScreen from '../pages/AgendaScreen';
import CamionerosScreen from '../pages/CamionerosScreen';
import { useAuth } from '../contexts/AuthContext';
import CreateUserScreen from '../pages/CreateUserScreen';


interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'capataz' | 'camionero')[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    console.log('[PrivateRoute] Usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('[PrivateRoute] Usuario autenticado pero sin rol permitido:', user.role);
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    console.log('[PublicRoute] Usuario autenticado, redirigiendo a /home:', user);
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/loading" element={<LoadingScreen />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginScreen />
          </PublicRoute>
        } 
      />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <HomeScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas"
        element={
          <PrivateRoute allowedRoles={['admin', 'capataz']}>
            <FincasScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/nueva"
        element={
          <PrivateRoute allowedRoles={['admin', 'capataz']}>
            <FincasForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/editar/:id"
        element={
          <PrivateRoute allowedRoles={['admin', 'capataz']}>
            <FincasForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id"
        element={
          <PrivateRoute allowedRoles={['admin', 'capataz']}>
            <FincasDetalleScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/bodega/editar"
        element={
          <PrivateRoute allowedRoles={['admin', 'capataz']}>
            <BodegaEditForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/movimientos/animales"
        element={
          <PrivateRoute allowedRoles={['admin', 'capataz']}>
            <MovimientosAnimales />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/movimientos/bodega"
        element={
          <PrivateRoute allowedRoles={['admin', 'capataz']}>
            <MovimientosBodega />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/venta"
        element={
          <PrivateRoute allowedRoles={['admin', 'capataz']}>
            <VentaGanado />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/ventas-reporte"
        element={
          <PrivateRoute allowedRoles={['admin', 'capataz']}>
            <VentaReporte />
          </PrivateRoute>
        }
      />
      <Route
        path="/under-construction"
        element={
          <PrivateRoute>
            <UnderConstruction />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/subastas"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <SubastasScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/subastas/:id"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <SubastaDetalleScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/consolidado"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <ConsolidadoScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/consolidado/animales"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AnimalesConsolidadoScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/consolidado/subastas"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <SubastasConsolidadoScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/consolidado/bodegas"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <BodegasConsolidadoScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AgendaScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/camioneros"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <CamionerosScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/create-user"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <CreateUserScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/"
        element={
          <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<div>Página no encontrada</div>} />
    </Routes>
  );
};

export default AppRoutes;

