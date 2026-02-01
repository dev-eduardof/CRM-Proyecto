import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
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
  Snackbar,
  Tabs,
  Tab,
  Grid,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Descripciones de roles
  const roleDescriptions = {
    'ADMIN': 'Administrador del Sistema',
    'TECNICO': 'Técnico Mecánico',
    'RECEPCION': 'Personal de Recepción',
    'CAJA': 'Personal de Caja',
    'AUXILIAR': 'Personal Auxiliar',
    'JEFE_TALLER': 'Jefe de Taller'
  };
  
  // Estado del diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    // Campos básicos
    username: '',
    email: '',
    nombre_completo: '',
    rol: 'RECEPCION',
    password: '',
    confirmPassword: '',
    // Información Personal
    rfc: '',
    curp: '',
    nss: '',
    fecha_nacimiento: '',
    telefono: '',
    telefono_emergencia: '',
    contacto_emergencia: '',
    estado_civil: '',
    // Dirección
    calle: '',
    numero: '',
    colonia: '',
    codigo_postal: '',
    ciudad: '',
    estado: '',
    // Información Laboral
    fecha_ingreso: '',
    tipo_contrato: 'PLANTA',
    salario_base_diario: '',
    horario_trabajo: '',
    dias_descanso: '',
    departamento: '',
    puesto_especifico: '',
    jefe_directo_id: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Cargar usuarios y roles
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await usersAPI.getRoles();
      setRoles(response.data);
    } catch (err) {
      console.error('Error al cargar roles:', err);
      // Si falla, usar roles por defecto
      setRoles(['ADMIN', 'TECNICO', 'RECEPCION', 'CAJA', 'AUXILIAR', 'JEFE_TALLER']);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      // Editar usuario
      console.log('📝 Editando usuario:', user);
      setEditingUser(user);
      setFormData({
        // Campos básicos
        username: user.username || '',
        email: user.email || '',
        nombre_completo: user.nombre_completo || '',
        rol: user.rol || 'RECEPCION',
        password: '',
        confirmPassword: '',
        // Información Personal
        rfc: user.rfc || '',
        curp: user.curp || '',
        nss: user.nss || '',
        fecha_nacimiento: user.fecha_nacimiento || '',
        telefono: user.telefono || '',
        telefono_emergencia: user.telefono_emergencia || '',
        contacto_emergencia: user.contacto_emergencia || '',
        estado_civil: user.estado_civil || '',
        // Dirección
        calle: user.calle || '',
        numero: user.numero || '',
        colonia: user.colonia || '',
        codigo_postal: user.codigo_postal || '',
        ciudad: user.ciudad || '',
        estado: user.estado || '',
        // Información Laboral
        fecha_ingreso: user.fecha_ingreso || '',
        tipo_contrato: user.tipo_contrato || '',
        salario_base_diario: user.salario_base_diario || '',
        horario_trabajo: user.horario_trabajo || '',
        dias_descanso: user.dias_descanso || '',
        departamento: user.departamento || '',
        puesto_especifico: user.puesto_especifico || '',
        jefe_directo_id: user.jefe_directo_id || ''
      });
    } else {
      // Nuevo usuario
      setEditingUser(null);
      setFormData({
        // Campos básicos
        username: '',
        email: '',
        nombre_completo: '',
        rol: 'RECEPCION',
        password: '',
        confirmPassword: '',
        // Información Personal
        rfc: '',
        curp: '',
        nss: '',
        fecha_nacimiento: '',
        telefono: '',
        telefono_emergencia: '',
        contacto_emergencia: '',
        estado_civil: '',
        // Dirección
        calle: '',
        numero: '',
        colonia: '',
        codigo_postal: '',
        ciudad: '',
        estado: '',
        // Información Laboral
        fecha_ingreso: '',
        tipo_contrato: 'PLANTA',
        salario_base_diario: '',
        horario_trabajo: '',
        dias_descanso: '',
        departamento: '',
        puesto_especifico: '',
        jefe_directo_id: ''
      });
    }
    setFormErrors({});
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setTabValue(0);
    setFormData({
      // Campos básicos
      username: '',
      email: '',
      nombre_completo: '',
      rol: 'RECEPCION',
      password: '',
      confirmPassword: '',
      // Información Personal
      rfc: '',
      curp: '',
      nss: '',
      fecha_nacimiento: '',
      telefono: '',
      telefono_emergencia: '',
      contacto_emergencia: '',
      estado_civil: '',
      // Dirección
      calle: '',
      numero: '',
      colonia: '',
      codigo_postal: '',
      ciudad: '',
      estado: '',
      // Información Laboral
      fecha_ingreso: '',
      tipo_contrato: 'PLANTA',
      salario_base_diario: '',
      horario_trabajo: '',
      dias_descanso: '',
      departamento: '',
      puesto_especifico: '',
      jefe_directo_id: ''
    });
    setFormErrors({});
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error del campo
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!editingUser) {
      // Validaciones para nuevo usuario
      if (!formData.username.trim()) {
        errors.username = 'El nombre de usuario es requerido';
      } else if (formData.username.length < 3) {
        errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
      }

      if (!formData.password) {
        errors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else {
      // Validaciones para editar usuario
      if (formData.password && formData.password.length < 6) {
        errors.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (formData.password && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.nombre_completo.trim()) {
      errors.nombre_completo = 'El nombre completo es requerido';
    } else if (formData.nombre_completo.length < 3) {
      errors.nombre_completo = 'El nombre completo debe tener al menos 3 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Preparar datos para enviar
      const dataToSend = {
        email: formData.email,
        nombre_completo: formData.nombre_completo,
        rol: formData.rol,
        // Información Personal
        rfc: formData.rfc || null,
        curp: formData.curp || null,
        nss: formData.nss || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        telefono: formData.telefono || null,
        telefono_emergencia: formData.telefono_emergencia || null,
        contacto_emergencia: formData.contacto_emergencia || null,
        estado_civil: formData.estado_civil || null,
        // Dirección
        calle: formData.calle || null,
        numero: formData.numero || null,
        colonia: formData.colonia || null,
        codigo_postal: formData.codigo_postal || null,
        ciudad: formData.ciudad || null,
        estado: formData.estado || null,
        // Información Laboral
        fecha_ingreso: formData.fecha_ingreso || null,
        tipo_contrato: formData.tipo_contrato || null,
        salario_base_diario: formData.salario_base_diario ? parseFloat(formData.salario_base_diario) : null,
        horario_trabajo: formData.horario_trabajo || null,
        dias_descanso: formData.dias_descanso || null,
        departamento: formData.departamento || null,
        puesto_especifico: formData.puesto_especifico || null,
        jefe_directo_id: formData.jefe_directo_id ? parseInt(formData.jefe_directo_id) : null
      };

      if (editingUser) {
        // Actualizar usuario
        // Solo incluir password si se proporcionó
        if (formData.password) {
          dataToSend.password = formData.password;
        }

        await usersAPI.update(editingUser.id, dataToSend);
        setSuccessMessage('¡Usuario actualizado exitosamente!');
      } else {
        // Crear usuario
        dataToSend.username = formData.username;
        dataToSend.password = formData.password;

        await usersAPI.create(dataToSend);
        setSuccessMessage('¡Usuario creado exitosamente!');
      }

      handleCloseDialog();
      setOpenSuccessDialog(true);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar usuario');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await usersAPI.delete(userToDelete.id);
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      setSuccessMessage('¡Usuario eliminado exitosamente!');
      setOpenSuccessDialog(true);
      loadUsers();
    } catch (err) {
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      setError(err.response?.data?.detail || 'Error al eliminar usuario');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const getRolColor = (rol) => {
    const colors = {
      ADMIN: 'error',
      TECNICO: 'primary',
      RECEPCION: 'success',
      CAJA: 'warning',
      AUXILIAR: 'info',
      JEFE_TALLER: 'secondary'
    };
    return colors[rol] || 'default';
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Nombre Completo</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.nombre_completo}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip label={u.rol} color={getRolColor(u.rol)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    icon={u.activo ? <CheckCircleIcon /> : <CancelIcon />}
                    label={u.activo ? 'Activo' : 'Inactivo'}
                    color={u.activo ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(u)}
                      disabled={u.id === user.id}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(u)}
                      disabled={u.id === user.id}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo de Crear/Editar Usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Información Básica" />
              <Tab label="Información Personal" />
              <Tab label="Dirección" />
              <Tab label="Información Laboral" />
            </Tabs>
          </Box>

          {/* Tab 0: Información Básica */}
          {tabValue === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Nombre de Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!formErrors.username}
                helperText={formErrors.username}
                disabled={!!editingUser}
                fullWidth
                required
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                fullWidth
                required
              />
              <TextField
                label="Nombre Completo"
                name="nombre_completo"
                value={formData.nombre_completo}
                onChange={handleChange}
                error={!!formErrors.nombre_completo}
                helperText={formErrors.nombre_completo}
                fullWidth
                required
              />
              <TextField
                label="Rol"
                name="rol"
                select
                value={formData.rol}
                onChange={handleChange}
                fullWidth
                required
              >
                {roles.length > 0 ? (
                  roles.map((rol) => (
                    <MenuItem key={rol} value={rol}>
                      {rol} - {roleDescriptions[rol] || rol}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="RECEPCION">Cargando roles...</MenuItem>
                )}
              </TextField>
              <TextField
                label={editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                fullWidth
                required={!editingUser}
              />
              <TextField
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                fullWidth
                required={!editingUser || !!formData.password}
              />
            </Box>
          )}

          {/* Tab 1: Información Personal */}
          {tabValue === 1 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="RFC"
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: 13 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="CURP"
                  name="curp"
                  value={formData.curp}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: 18 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="NSS"
                  name="nss"
                  value={formData.nss}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: 11 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Nacimiento"
                  name="fecha_nacimiento"
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Estado Civil"
                  name="estado_civil"
                  select
                  value={formData.estado_civil}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  <MenuItem value="SOLTERO">Soltero/a</MenuItem>
                  <MenuItem value="CASADO">Casado/a</MenuItem>
                  <MenuItem value="DIVORCIADO">Divorciado/a</MenuItem>
                  <MenuItem value="VIUDO">Viudo/a</MenuItem>
                  <MenuItem value="UNION_LIBRE">Unión Libre</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>Contacto de Emergencia</Divider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre del Contacto"
                  name="contacto_emergencia"
                  value={formData.contacto_emergencia}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono de Emergencia"
                  name="telefono_emergencia"
                  value={formData.telefono_emergencia}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Dirección */}
          {tabValue === 2 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Calle"
                  name="calle"
                  value={formData.calle}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Número"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Colonia"
                  name="colonia"
                  value={formData.colonia}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Código Postal"
                  name="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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

          {/* Tab 3: Información Laboral */}
          {tabValue === 3 && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Ingreso"
                  name="fecha_ingreso"
                  type="date"
                  value={formData.fecha_ingreso}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tipo de Contrato"
                  name="tipo_contrato"
                  select
                  value={formData.tipo_contrato}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="PLANTA">Planta</MenuItem>
                  <MenuItem value="TEMPORAL">Temporal</MenuItem>
                  <MenuItem value="POR_OBRA">Por Obra</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Salario Base Diario"
                  name="salario_base_diario"
                  type="number"
                  value={formData.salario_base_diario}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Puesto Específico"
                  name="puesto_especifico"
                  value={formData.puesto_especifico}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Horario de Trabajo"
                  name="horario_trabajo"
                  select
                  value={formData.horario_trabajo}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  <MenuItem value="Lunes a Viernes 8:00-17:00">Lunes a Viernes 8:00-17:00</MenuItem>
                  <MenuItem value="Lunes a Viernes 9:00-18:00">Lunes a Viernes 9:00-18:00</MenuItem>
                  <MenuItem value="Lunes a Viernes 7:00-16:00">Lunes a Viernes 7:00-16:00</MenuItem>
                  <MenuItem value="Lunes a Sábado 8:00-17:00">Lunes a Sábado 8:00-17:00</MenuItem>
                  <MenuItem value="Lunes a Sábado 9:00-14:00">Lunes a Sábado 9:00-14:00</MenuItem>
                  <MenuItem value="Turnos Rotativos">Turnos Rotativos</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Días de Descanso"
                  name="dias_descanso"
                  select
                  value={formData.dias_descanso}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="">Seleccionar...</MenuItem>
                  <MenuItem value="Sábado y Domingo">Sábado y Domingo</MenuItem>
                  <MenuItem value="Domingo">Domingo</MenuItem>
                  <MenuItem value="Lunes">Lunes</MenuItem>
                  <MenuItem value="Martes">Martes</MenuItem>
                  <MenuItem value="Miércoles">Miércoles</MenuItem>
                  <MenuItem value="Jueves">Jueves</MenuItem>
                  <MenuItem value="Viernes">Viernes</MenuItem>
                  <MenuItem value="Sábado">Sábado</MenuItem>
                  <MenuItem value="Domingo y Lunes">Domingo y Lunes</MenuItem>
                  <MenuItem value="Variable">Variable</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
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
            <WarningIcon sx={{ fontSize: 50, color: 'white' }} />
          </Box>
          <Typography variant="h5" gutterBottom color="error.main" fontWeight="bold">
            ¿Estás seguro?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas eliminar este usuario?
          </Typography>
          {userToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Usuario a eliminar:
              </Typography>
              <Typography variant="h6" color="text.primary">
                {userToDelete.nombre_completo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{userToDelete.username} - {userToDelete.email}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 'bold' }}>
            Esta acción no se puede deshacer
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            onClick={handleDeleteCancel}
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
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Éxito */}
      <Dialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
      >
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
            color="success"
            size="large"
            startIcon={<CheckIcon />}
          >
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Layout>
  );
};

export default Users;
