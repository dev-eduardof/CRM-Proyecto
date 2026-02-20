import { Container, Paper, Typography, Box, Chip, Grid, Card, CardContent, Collapse, IconButton, Badge } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ordenesAPI } from '../services/api';
import {
  Dashboard as DashboardIcon,
  Person,
  AdminPanelSettings,
  Build,
  Receipt,
  People,
  PersonAdd,
  BeachAccess,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userInfoExpanded, setUserInfoExpanded] = useState(false);
  const [otRecibidoDiagnosticoCount, setOtRecibidoDiagnosticoCount] = useState(0);

  // Para técnicos: contar OT en RECIBIDO y DIAGNOSTICO (notificación en el card)
  useEffect(() => {
    if (user?.rol !== 'TECNICO') return;
    ordenesAPI.getAll()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        const count = list.filter(
          (o) => o.estatus === 'RECIBIDO' || o.estatus === 'DIAGNOSTICO'
        ).length;
        setOtRecibidoDiagnosticoCount(count);
      })
      .catch(() => setOtRecibidoDiagnosticoCount(0));
  }, [user?.rol]);

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
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
          onClick={() => setUserInfoExpanded(!userInfoExpanded)}
        >
          <Typography variant="h6">
            Información del Usuario
          </Typography>
          <IconButton size="small">
            {userInfoExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        
        <Collapse in={userInfoExpanded}>
          <Box sx={{ p: 3, pt: 0 }}>
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
        </Collapse>
      </Paper>

      {/* Módulos disponibles */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Módulos del Sistema
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Órdenes de Trabajo - Primera posición. Para técnicos: badge con cantidad en RECIBIDO + DIAGNOSTICO */}
          {(user?.rol === 'ADMIN' || user?.rol === 'RECEPCION' || user?.rol === 'TECNICO') && (
            <Grid item xs={12} sm={6} md={4}>
              {user?.rol === 'TECNICO' ? (
                <Badge
                  badgeContent={otRecibidoDiagnosticoCount}
                  color="error"
                  showZero
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.85rem', minWidth: 22, height: 22 } }}
                >
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                    }}
                    onClick={() => navigate('/ordenes')}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Build sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h6">Órdenes de Trabajo</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Tus órdenes asignadas · Recibido y diagnóstico
                      </Typography>
                    </CardContent>
                  </Card>
                </Badge>
              ) : (
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                  }}
                  onClick={() => navigate('/ordenes')}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Build sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Typography variant="h6">Órdenes de Trabajo</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Gestión de servicios y reparaciones
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          )}

          {/* Gestión de Usuarios - Solo ADMIN */}
          {user?.rol === 'ADMIN' && (
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => navigate('/users')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6">
                      Usuarios
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Gestión de usuarios, roles y recursos humanos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Mis Vacaciones - Todos los usuarios */}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
              onClick={() => navigate('/vacaciones')}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BeachAccess sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Typography variant="h6">
                    Mis Vacaciones
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Solicitar y gestionar tus días de vacaciones
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Clientes - ADMIN y RECEPCION */}
          {(user?.rol === 'ADMIN' || user?.rol === 'RECEPCION') && (
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => navigate('/clientes')}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonAdd sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                    <Typography variant="h6">
                      Clientes
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Gestión de clientes y base de datos
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Próximos módulos */}
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Próximos módulos disponibles:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
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
