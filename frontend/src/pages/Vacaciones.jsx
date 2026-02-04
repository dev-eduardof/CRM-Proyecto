import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, vacacionesAPI } from '../services/api';
import Layout from '../components/Layout';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  BeachAccess as VacationIcon
} from '@mui/icons-material';

const Vacaciones = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [solicitudes, setSolicitudes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Estado del diálogo de solicitud
  const [openSolicitudDialog, setOpenSolicitudDialog] = useState(false);
  const [openDetalleDialog, setOpenDetalleDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Formulario de solicitud
  const [formData, setFormData] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo: 'DIAS_COMPLETOS',
    cantidad: 0,
    observaciones: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar información del usuario actual
      const userResponse = await usersAPI.getMe();
      setUserInfo(userResponse.data);
      
      // Cargar solicitudes
      const solicitudesResponse = await vacacionesAPI.getMySolicitudes();
      setSolicitudes(solicitudesResponse.data);
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSolicitudDialog = () => {
    setFormData({
      fecha_inicio: '',
      fecha_fin: '',
      tipo: 'DIAS_COMPLETOS',
      cantidad: 0,
      observaciones: ''
    });
    setOpenSolicitudDialog(true);
  };

  const handleCloseSolicitudDialog = () => {
    setOpenSolicitudDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calcular días automáticamente
    if (name === 'fecha_inicio' || name === 'fecha_fin') {
      const inicio = name === 'fecha_inicio' ? value : formData.fecha_inicio;
      const fin = name === 'fecha_fin' ? value : formData.fecha_fin;
      
      if (inicio && fin) {
        const diffTime = Math.abs(new Date(fin) - new Date(inicio));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData(prev => ({
          ...prev,
          cantidad: diffDays
        }));
      }
    }
  };

  const handleSubmitSolicitud = async () => {
    try {
      // Validaciones
      if (!formData.fecha_inicio || !formData.fecha_fin) {
        setError('Las fechas son obligatorias');
        return;
      }

      if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio');
        return;
      }

      if (formData.cantidad > userInfo.dias_vacaciones_disponibles) {
        setError(`No tienes suficientes días disponibles. Solo tienes ${userInfo.dias_vacaciones_disponibles} días.`);
        return;
      }

      // Enviar solicitud al backend
      await vacacionesAPI.create(formData);
      
      setSuccessMessage('¡Solicitud de vacaciones enviada exitosamente!');
      handleCloseSolicitudDialog();
      loadData();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al crear solicitud');
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      'PENDIENTE': 'warning',
      'APROBADA': 'success',
      'RECHAZADA': 'error',
      'TOMADA': 'info',
      'CANCELADA': 'default'
    };
    return colors[estado] || 'default';
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      'DIAS_COMPLETOS': 'Días Completos',
      'MEDIO_DIA': 'Medio Día',
      'HORAS': 'Horas'
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            <VacationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Mis Vacaciones
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenSolicitudDialog}
            disabled={!userInfo || !userInfo.fecha_ingreso}
          >
            Solicitar Vacaciones
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Resumen de Vacaciones */}
        {userInfo && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Días por Año
                  </Typography>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    {userInfo.dias_vacaciones_anio || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Días Disponibles
                  </Typography>
                  <Typography variant="h3" color="primary.main" fontWeight="bold">
                    {userInfo.dias_vacaciones_disponibles || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Días Tomados
                  </Typography>
                  <Typography variant="h3" color="warning.main" fontWeight="bold">
                    {userInfo.dias_vacaciones_tomados || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Días Pendientes
                  </Typography>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    {userInfo.dias_vacaciones_pendientes_anios_anteriores || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Pestañas de Solicitudes */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Todas" />
            <Tab label="Pendientes" />
            <Tab label="Aprobadas" />
            <Tab label="Rechazadas" />
          </Tabs>
        </Paper>

        {/* Tabla de Solicitudes */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Fecha Solicitud</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Días</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                      No tienes solicitudes de vacaciones aún.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                solicitudes.map((solicitud) => (
                  <TableRow key={solicitud.id}>
                    <TableCell>{solicitud.id}</TableCell>
                    <TableCell>
                      {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell>
                      {new Date(solicitud.fecha_inicio).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell>
                      {new Date(solicitud.fecha_fin).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell>{getTipoLabel(solicitud.tipo)}</TableCell>
                    <TableCell>{solicitud.cantidad}</TableCell>
                    <TableCell>
                      <Chip
                        label={solicitud.estado}
                        color={getEstadoColor(solicitud.estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalles">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setSelectedSolicitud(solicitud);
                            setOpenDetalleDialog(true);
                          }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Diálogo de Nueva Solicitud */}
        <Dialog
          open={openSolicitudDialog}
          onClose={handleCloseSolicitudDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <VacationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Nueva Solicitud de Vacaciones
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              {userInfo && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Tienes <strong>{userInfo.dias_vacaciones_disponibles}</strong> días disponibles
                </Alert>
              )}
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Tipo de Solicitud"
                    name="tipo"
                    select
                    value={formData.tipo}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="DIAS_COMPLETOS">Días Completos</MenuItem>
                    <MenuItem value="MEDIO_DIA">Medio Día</MenuItem>
                    <MenuItem value="HORAS">Horas</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha de Inicio"
                    name="fecha_inicio"
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha de Fin"
                    name="fecha_fin"
                    type="date"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Cantidad de Días"
                    name="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{ readOnly: formData.tipo === 'DIAS_COMPLETOS' }}
                    helperText={formData.tipo === 'DIAS_COMPLETOS' ? 'Se calcula automáticamente' : 'Ingresa la cantidad'}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Observaciones"
                    name="observaciones"
                    multiline
                    rows={3}
                    value={formData.observaciones}
                    onChange={handleChange}
                    fullWidth
                    placeholder="Motivo o detalles adicionales..."
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSolicitudDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitSolicitud}
              variant="contained"
              disabled={!formData.fecha_inicio || !formData.fecha_fin || formData.cantidad <= 0}
            >
              Enviar Solicitud
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Detalle */}
        <Dialog
          open={openDetalleDialog}
          onClose={() => setOpenDetalleDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Detalle de Solicitud</DialogTitle>
          <DialogContent>
            {selectedSolicitud && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Estado:
                    </Typography>
                    <Chip
                      label={selectedSolicitud.estado}
                      color={getEstadoColor(selectedSolicitud.estado)}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tipo:
                    </Typography>
                    <Typography variant="body1">
                      {getTipoLabel(selectedSolicitud.tipo)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha Inicio:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedSolicitud.fecha_inicio).toLocaleDateString('es-MX')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha Fin:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedSolicitud.fecha_fin).toLocaleDateString('es-MX')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Cantidad:
                    </Typography>
                    <Typography variant="body1">
                      {selectedSolicitud.cantidad} {formData.tipo === 'HORAS' ? 'horas' : 'días'}
                    </Typography>
                  </Grid>
                  {selectedSolicitud.observaciones && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Observaciones:
                      </Typography>
                      <Typography variant="body1">
                        {selectedSolicitud.observaciones}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetalleDialog(false)}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Vacaciones;
