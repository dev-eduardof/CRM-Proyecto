import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Vacaciones from './pages/Vacaciones';
import Clientes from './pages/Clientes';
import Ordenes from './pages/Ordenes';
import DashboardTaller from './pages/DashboardTaller';
// import Recepcion from './pages/Recepcion';
// import Tecnicos from './pages/Tecnicos';
// import Caja from './pages/Caja';
// import Reportes from './pages/Reportes';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vacaciones"
              element={
                <ProtectedRoute>
                  <Vacaciones />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCION']}>
                  <Clientes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-taller"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCION', 'TECNICO']}>
                  <DashboardTaller />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ordenes"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCION', 'TECNICO']}>
                  <Ordenes />
                </ProtectedRoute>
              }
            />
            {/* 
            <Route path="/recepcion" element={<Recepcion />} />
            <Route path="/tecnicos" element={<Tecnicos />} />
            <Route path="/caja" element={<Caja />} />
            <Route path="/reportes" element={<Reportes />} />
            */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
