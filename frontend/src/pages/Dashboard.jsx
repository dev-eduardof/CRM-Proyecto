import { Container, Paper, Typography, Box, Chip, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  Dashboard as DashboardIcon,
  Person,
  AdminPanelSettings,
  Build,
  Receipt,
  People
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <Layout>
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
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Dashboard
            </Typography>
            <Typography variant="body1">
              Bienvenido, {user?.nombre_completo}
            </Typography>
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
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Gestión de Usuarios - Solo ADMIN */}
          {user?.rol === 'ADMIN' && (
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6">
                      Usuarios
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Gestión de usuarios y roles del sistema
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate('/users')}
                    variant="contained"
                  >
                    Acceder
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}

          {/* Próximos módulos */}
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Próximos módulos disponibles:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip label="Clientes" variant="outlined" />
              <Chip label="Órdenes de Trabajo" variant="outlined" />
              <Chip label="Materiales" variant="outlined" />
              <Chip label="Pagos" variant="outlined" />
              <Chip label="Gastos" variant="outlined" />
              <Chip label="Reportes" variant="outlined" />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      </Container>
    </Layout>
  );
};

export default Dashboard;
