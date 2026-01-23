import { Container, Paper, Typography, Box, Button, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  ExitToApp,
  Person,
  AdminPanelSettings,
  Build,
  Receipt
} from '@mui/icons-material';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRolColor = (rol) => {
    const colors = {
      admin: 'error',
      tecnico: 'primary',
      recepcion: 'success'
    };
    return colors[rol] || 'default';
  };

  const getRolIcon = (rol) => {
    const icons = {
      admin: <AdminPanelSettings />,
      tecnico: <Build />,
      recepcion: <Receipt />
    };
    return icons[rol] || <Person />;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Dashboard
            </Typography>
            <Typography variant="body1">
              Bienvenido, {user?.nombre_completo}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="inherit"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            sx={{ color: '#667eea' }}
          >
            Cerrar Sesión
          </Button>
        </Box>
      </Paper>

      {/* Información del usuario */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Información del Usuario
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Usuario
            </Typography>
            <Typography variant="body1">
              {user?.username}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">
              {user?.email}
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Rol
            </Typography>
            <Chip
              icon={getRolIcon(user?.rol)}
              label={user?.rol?.toUpperCase()}
              color={getRolColor(user?.rol)}
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Estado
            </Typography>
            <Chip
              label={user?.activo ? 'ACTIVO' : 'INACTIVO'}
              color={user?.activo ? 'success' : 'error'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Módulos disponibles */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Módulos del Sistema
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Los siguientes módulos estarán disponibles próximamente:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label="Clientes" variant="outlined" />
          <Chip label="Órdenes de Trabajo" variant="outlined" />
          <Chip label="Materiales" variant="outlined" />
          <Chip label="Pagos" variant="outlined" />
          <Chip label="Gastos" variant="outlined" />
          <Chip label="Reportes" variant="outlined" />
          <Chip label="Usuarios" variant="outlined" />
          <Chip label="Configuración" variant="outlined" />
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;
