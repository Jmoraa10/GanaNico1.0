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

const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  return !!user;
};

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/loading" element={<LoadingScreen />} />
      <Route path="/login" element={<LoginScreen />} />
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
          <PrivateRoute>
            <FincasScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/nueva"
        element={
          <PrivateRoute>
            <FincasForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/editar/:id"
        element={
          <PrivateRoute>
            <FincasForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id"
        element={
          <PrivateRoute>
            <FincasDetalleScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/bodega/editar"
        element={
          <PrivateRoute>
            <BodegaEditForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/movimientos/animales"
        element={
          <PrivateRoute>
            <MovimientosAnimales />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/movimientos/bodega"
        element={
          <PrivateRoute>
            <MovimientosBodega />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/venta"
        element={
          <PrivateRoute>
            <VentaGanado />
          </PrivateRoute>
        }
      />
      <Route
        path="/fincas/:id/ventas-reporte"
        element={
          <PrivateRoute>
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
          <PrivateRoute>
            <SubastasScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/subastas/:id"
        element={
          <PrivateRoute>
            <SubastaDetalleScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/consolidado"
        element={
          <PrivateRoute>
            <ConsolidadoScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/consolidado/animales"
        element={
          <PrivateRoute>
            <AnimalesConsolidadoScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/consolidado/subastas"
        element={
          <PrivateRoute>
            <SubastasConsolidadoScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/consolidado/bodegas"
        element={
          <PrivateRoute>
            <BodegasConsolidadoScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <PrivateRoute>
            <AgendaScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated() ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<div>Página no encontrada</div>} />
    </Routes>
  );
};

export default AppRoutes;

