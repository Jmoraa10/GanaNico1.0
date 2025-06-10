import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';
import { usePageLoader } from './hooks/usePageLoader';
import LoadingScreen from './pages/LoadingScreen';
import { AuthProvider } from './contexts/AuthContext';

const AppWithLoader: React.FC = () => {
  const loading = usePageLoader();
  return loading ? <LoadingScreen /> : <AppRoutes />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
      <AppWithLoader />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;