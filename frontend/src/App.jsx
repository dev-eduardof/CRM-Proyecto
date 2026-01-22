import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Importar páginas cuando estén disponibles
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import Recepcion from './pages/Recepcion';
// import Tecnicos from './pages/Tecnicos';
// import Caja from './pages/Caja';
// import Admin from './pages/Admin';
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
        <div className="App">
          <h1>CRM Talleres</h1>
          <p>Sistema de Gestión de Talleres</p>
          <p>Frontend en construcción...</p>
        </div>
        {/* 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/recepcion" element={<Recepcion />} />
          <Route path="/tecnicos" element={<Tecnicos />} />
          <Route path="/caja" element={<Caja />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        */}
      </Router>
    </ThemeProvider>
  );
}

export default App;
