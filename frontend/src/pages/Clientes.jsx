import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Clientes = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Estados del diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [clienteStatusTab, setClienteStatusTab] = useState(0); // 0: Activos, 1: Inactivos
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    tipo_cliente: 'PERSONA_FISICA',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    razon_social: '',
    rfc: '',
    email: '',
    telefono: '',
    telefono_alternativo: '',
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    codigo_postal: '',
    ciudad: '',
    estado: '',
    fecha_nacimiento: '',
    notas: '',
    preferencias: '',
    activo: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);

  useEffect(() => {
    loadClientes();
  }, [clienteStatusTab]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/v1/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { activo: clienteStatusTab === 0 }
      });
      setClientes(response.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError(err.response?.data?.detail || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cliente = null) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        tipo_cliente: cliente.tipo_cliente || 'PERSONA_FISICA',
        nombre: cliente.nombre || '',
        apellido_paterno: cliente.apellido_paterno || '',
        apellido_materno: cliente.apellido_materno || '',
        razon_social: cliente.razon_social || '',
        rfc: cliente.rfc || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        telefono_alternativo: cliente.telefono_alternativo || '',
        calle: cliente.calle || '',
        numero_exterior: cliente.numero_exterior || '',
        numero_interior: cliente.numero_interior || '',
        colonia: cliente.colonia || '',
        codigo_postal: cliente.codigo_postal || '',
        ciudad: cliente.ciudad || '',
        estado: cliente.estado || '',
        fecha_nacimiento: cliente.fecha_nacimiento || '',
        notas: cliente.notas || '',
        preferencias: cliente.preferencias || '',
        activo: cliente.activo
      });
    } else {
      setEditingCliente(null);
      setFormData({
        tipo_cliente: 'PERSONA_FISICA',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        razon_social: '',
        rfc: '',
        email: '',
        telefono: '',
        telefono_alternativo: '',
        calle: '',
        numero_exterior: '',
        numero_interior: '',
        colonia: '',
        codigo_postal: '',
        ciudad: '',
        estado: '',
        fecha_nacimiento: '',
        notas: '',
        preferencias: '',
        activo: true
      });
    }
    setFormErrors({});
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCliente(null);
    setFormData({
      tipo_cliente: 'PERSONA_FISICA',
      nombre: '',
      apellido_paterno: '',
      apellido_materno: '',
      razon_social: '',
      rfc: '',
      email: '',
      telefono: '',
      telefono_alternativo: '',
      calle: '',
      numero_exterior: '',
      numero_interior: '',
      colonia: '',
      codigo_postal: '',
      ciudad: '',
      estado: '',
      fecha_nacimiento: '',
      notas: '',
      preferencias: '',
      activo: true
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.tipo_cliente === 'PERSONA_FISICA') {
      if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
    } else {
      if (!formData.razon_social.trim()) errors.razon_social = 'La razón social es obligatoria';
    }
    
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (formData.telefono.length < 10) {
      errors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (formData.rfc && formData.rfc.length > 13) {
      errors.rfc = 'El RFC no puede tener más de 13 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Preparar datos
      const dataToSend = { ...formData };
      
      // Limpiar campos vacíos
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key] === '') {
          dataToSend[key] = null;
        }
      });

      if (editingCliente) {
        // Actualizar
        await axios.put(
          `${API_BASE_URL}/api/v1/clientes/${editingCliente.id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage('¡Cliente actualizado exitosamente!');
      } else {
        // Crear
        await axios.post(
          `${API_BASE_URL}/api/v1/clientes`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage('¡Cliente creado exitosamente!');
      }

      handleCloseDialog();
      setOpenSuccessDialog(true);
      loadClientes();
    } catch (err) {
      console.error('Error al guardar cliente:', err);
      setError(err.response?.data?.detail || 'Error al guardar cliente');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (cliente) => {
    setClienteToDelete(cliente);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clienteToDelete) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE_URL}/api/v1/clientes/${clienteToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccessMessage('¡Cliente desactivado exitosamente!');
      setOpenDeleteDialog(false);
      setClienteToDelete(null);
      setOpenSuccessDialog(true);
      loadClientes();
    } catch (err) {
      console.error('Error al desactivar cliente:', err);
      setError(err.response?.data?.detail || 'Error al desactivar cliente');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (cliente) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/api/v1/clientes/${cliente.id}/activar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccessMessage('¡Cliente activado exitosamente!');
      setOpenSuccessDialog(true);
      loadClientes();
    } catch (err) {
      console.error('Error al activar cliente:', err);
      setError(err.response?.data?.detail || 'Error al activar cliente');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(cliente => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      cliente.nombre_completo?.toLowerCase().includes(search) ||
      cliente.telefono?.includes(search) ||
      cliente.email?.toLowerCase().includes(search) ||
      cliente.rfc?.toLowerCase().includes(search)
    );
  });

  if (loading && clientes.length === 0) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Cargando clientes...</Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Gestión de Clientes
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Cliente
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Buscador */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, teléfono, email o RFC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Pestañas de Activos/Inactivos */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={clienteStatusTab} onChange={(e, newValue) => setClienteStatusTab(newValue)}>
            <Tab label={`Clientes Activos (${clientes.filter(c => c.activo).length})`} />
            <Tab label={`Clientes Inactivos (${clientes.filter(c => !c.activo).length})`} />
          </Tabs>
        </Paper>

        {/* Tabla de Clientes */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Nombre/Razón Social</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>RFC</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" color="text.secondary" sx={{ py: 3 }}>
                      No hay clientes {clienteStatusTab === 0 ? 'activos' : 'inactivos'}.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>{cliente.id}</TableCell>
                    <TableCell>
                      <Chip
                        icon={cliente.tipo_cliente === 'PERSONA_FISICA' ? <PersonIcon /> : <BusinessIcon />}
                        label={cliente.tipo_cliente === 'PERSONA_FISICA' ? 'Persona Física' : 'Persona Moral'}
                        size="small"
                        color={cliente.tipo_cliente === 'PERSONA_FISICA' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {cliente.nombre_completo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        {cliente.telefono}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {cliente.email ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon fontSize="small" color="action" />
                          {cliente.email}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{cliente.rfc || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={cliente.activo ? <CheckCircleIcon /> : <CancelIcon />}
                        label={cliente.activo ? 'Activo' : 'Inactivo'}
                        color={cliente.activo ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(cliente)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {cliente.activo ? (
                        <Tooltip title="Desactivar">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(cliente)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activar">
                          <IconButton
                            color="success"
                            onClick={() => handleActivate(cliente)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Diálogo de Crear/Editar Cliente */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Información Básica" />
                <Tab label="Dirección" />
                <Tab label="Notas" />
              </Tabs>
            </Box>

            {/* Tab 0: Información Básica */}
            {tabValue === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Tipo de Cliente"
                  name="tipo_cliente"
                  select
                  value={formData.tipo_cliente}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  <MenuItem value="PERSONA_FISICA">Persona Física</MenuItem>
                  <MenuItem value="PERSONA_MORAL">Persona Moral</MenuItem>
                </TextField>

                {formData.tipo_cliente === 'PERSONA_FISICA' ? (
                  <>
                    <TextField
                      label="Nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      error={!!formErrors.nombre}
                      helperText={formErrors.nombre}
                      fullWidth
                      required
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField
                          label="Apellido Paterno"
                          name="apellido_paterno"
                          value={formData.apellido_paterno}
                          onChange={handleChange}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Apellido Materno"
                          name="apellido_materno"
                          value={formData.apellido_materno}
                          onChange={handleChange}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                    <TextField
                      label="Fecha de Nacimiento"
                      name="fecha_nacimiento"
                      type="date"
                      value={formData.fecha_nacimiento}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </>
                ) : (
                  <TextField
                    label="Razón Social"
                    name="razon_social"
                    value={formData.razon_social}
                    onChange={handleChange}
                    error={!!formErrors.razon_social}
                    helperText={formErrors.razon_social}
                    fullWidth
                    required
                  />
                )}

                <TextField
                  label="RFC"
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleChange}
                  error={!!formErrors.rfc}
                  helperText={formErrors.rfc}
                  fullWidth
                  inputProps={{ maxLength: 13 }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Teléfono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      error={!!formErrors.telefono}
                      helperText={formErrors.telefono}
                      fullWidth
                      required
                      inputProps={{ maxLength: 15 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Teléfono Alternativo"
                      name="telefono_alternativo"
                      value={formData.telefono_alternativo}
                      onChange={handleChange}
                      fullWidth
                      inputProps={{ maxLength: 15 }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  fullWidth
                />
              </Box>
            )}

            {/* Tab 1: Dirección */}
            {tabValue === 1 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={8}>
                  <TextField
                    label="Calle"
                    name="calle"
                    value={formData.calle}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Núm. Ext."
                    name="numero_exterior"
                    value={formData.numero_exterior}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Núm. Int."
                    name="numero_interior"
                    value={formData.numero_interior}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Colonia"
                    name="colonia"
                    value={formData.colonia}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Código Postal"
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}

            {/* Tab 2: Notas */}
            {tabValue === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Notas"
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Información adicional sobre el cliente..."
                />
                <TextField
                  label="Preferencias"
                  name="preferencias"
                  value={formData.preferencias}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder="Preferencias de servicio, horarios, etc..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              startIcon={editingCliente ? <EditIcon /> : <AddIcon />}
            >
              {editingCliente ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Éxito */}
        <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)} maxWidth="sm" fullWidth>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom color="success.main" fontWeight="bold">
              ¡Éxito!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {successMessage}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button
              onClick={() => setOpenSuccessDialog(false)}
              variant="contained"
              color="primary"
              size="large"
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Confirmación de Eliminación */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="sm" fullWidth>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <DeleteIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
            <Typography variant="h5" gutterBottom color="error.main" fontWeight="bold">
              ¿Desactivar Cliente?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              ¿Estás seguro de que deseas desactivar este cliente?
            </Typography>
            {clienteToDelete && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Cliente:
                </Typography>
                <Typography variant="h6" color="text.primary">
                  {clienteToDelete.nombre_completo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {clienteToDelete.telefono}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
            <Button
              onClick={() => setOpenDeleteDialog(false)}
              variant="outlined"
              color="inherit"
              size="large"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              size="large"
              startIcon={<DeleteIcon />}
            >
              Desactivar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Clientes;
