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
  Snackbar
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
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nombre_completo: '',
    rol: 'RECEPCION',
    password: '',
    confirmPassword: ''
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
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        nombre_completo: user.nombre_completo,
        rol: user.rol,
        password: '',
        confirmPassword: ''
      });
    } else {
      // Nuevo usuario
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        nombre_completo: '',
        rol: 'RECEPCION',
        password: '',
        confirmPassword: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      nombre_completo: '',
      rol: 'RECEPCION',
      password: '',
      confirmPassword: ''
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
      if (editingUser) {
        // Actualizar usuario
        const updateData = {
          email: formData.email,
          nombre_completo: formData.nombre_completo,
          rol: formData.rol
        };
        
        // Solo incluir password si se proporcionó
        if (formData.password) {
          updateData.password = formData.password;
        }

        await usersAPI.update(editingUser.id, updateData);
        setSuccessMessage('¡Usuario actualizado exitosamente!');
      } else {
        // Crear usuario
        await usersAPI.create({
          username: formData.username,
          email: formData.email,
          nombre_completo: formData.nombre_completo,
          rol: formData.rol,
          password: formData.password
        });
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
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
              SelectProps={{
                native: false,
              }}
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
