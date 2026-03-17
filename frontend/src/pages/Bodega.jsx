import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory2 as InventoryIcon,
  Search as SearchIcon,
  PlaylistAdd as PlaylistAddIcon
} from '@mui/icons-material';
import { piezasAPI, ordenesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Bodega = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';
  const [piezas, setPiezas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPieza, setEditingPieza] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [piezaToDelete, setPiezaToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [catalogos, setCatalogos] = useState([]);
  const [subcatalogos, setSubcatalogos] = useState([]);
  const [openCatalogoDialog, setOpenCatalogoDialog] = useState(false);
  const [formCatalogo, setFormCatalogo] = useState({ nombre: '', descripcion: '', subcategorias: [] });
  const [categoriaRecienCreada, setCategoriaRecienCreada] = useState(null);
  const [eliminandoTodasCategorias, setEliminandoTodasCategorias] = useState(false);
  const [openAddToOrdenDialog, setOpenAddToOrdenDialog] = useState(false);
  const [piezaAddToOrden, setPiezaAddToOrden] = useState(null);
  const [addToOrdenOrdenId, setAddToOrdenOrdenId] = useState('');
  const [addToOrdenCantidad, setAddToOrdenCantidad] = useState(1);
  const [ordenesList, setOrdenesList] = useState([]);
  const [addToOrdenError, setAddToOrdenError] = useState('');
  const [formData, setFormData] = useState({
    codigo: '',
    catalogo_id: '',
    subcatalogo_id: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: 0,
    unidad: 'pza',
    activo: true
  });
  const [formErrors, setFormErrors] = useState({});

  const loadPiezas = async () => {
    try {
      setLoading(true);
      const params = { limit: 500 };
      if (search.trim()) params.search = search.trim();
      const res = await piezasAPI.getAll(params);
      setPiezas(res.data || []);
      setError('');
    } catch (err) {
      console.error('Error al cargar piezas:', err);
      setError(err.response?.data?.detail || 'Error al cargar piezas');
      setPiezas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogos = async () => {
    try {
      const res = await piezasAPI.getCatalogos({});
      setCatalogos(res.data || []);
    } catch (e) {
      setCatalogos([]);
    }
  };

  const loadSubcatalogos = async (catalogoId) => {
    if (!catalogoId) {
      setSubcatalogos([]);
      return;
    }
    try {
      const res = await piezasAPI.getSubcatalogos(catalogoId, {});
      setSubcatalogos(res.data || []);
    } catch (e) {
      setSubcatalogos([]);
    }
  };

  useEffect(() => {
    loadPiezas();
    loadCatalogos();
  }, []);

  useEffect(() => {
    loadSubcatalogos(formData.catalogo_id || null);
  }, [formData.catalogo_id]);

  const handleOpenCreate = () => {
    setEditingPieza(null);
    setFormData({
      codigo: '',
      catalogo_id: '',
      subcatalogo_id: '',
      nombre: '',
      descripcion: '',
      precio: '',
      stock: 0,
      unidad: 'pza',
      activo: true
    });
    setSubcatalogos([]);
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPieza(p);
    setFormData({
      codigo: p.codigo || '',
      catalogo_id: p.catalogo_id ?? '',
      subcatalogo_id: p.subcatalogo_id ?? '',
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      precio: p.precio ?? '',
      stock: p.stock ?? 0,
      unidad: p.unidad || 'pza',
      activo: p.activo !== false
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPieza(null);
  };

  const validate = () => {
    const err = {};
    if (!formData.nombre?.trim()) err.nombre = 'Nombre requerido';
    if (isAdmin) {
      if (formData.precio === '' || formData.precio === null || formData.precio === undefined)
        err.precio = 'Precio requerido';
      else if (Number(formData.precio) < 0) err.precio = 'Precio no puede ser negativo';
    }
    if (Number(formData.stock) < 0) err.stock = 'Stock no puede ser negativo';
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload = {
        codigo: formData.codigo?.trim() || null,
        catalogo_id: formData.catalogo_id ? Number(formData.catalogo_id) : null,
        subcatalogo_id: formData.subcatalogo_id ? Number(formData.subcatalogo_id) : null,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || null,
        precio: isAdmin ? Number(formData.precio) : 0,
        stock: Number(formData.stock) || 0,
        unidad: formData.unidad || 'pza',
        activo: formData.activo
      };
      if (editingPieza) {
        const updatePayload = { ...payload };
        if (!isAdmin) delete updatePayload.precio;
        await piezasAPI.update(editingPieza.id, updatePayload);
        setSuccess('Pieza actualizada correctamente');
      } else {
        await piezasAPI.create(payload);
        setSuccess('Material creado. Se asignó folio automático si no ingresaste código.');
      }
      handleCloseDialog();
      loadPiezas();
    } catch (err) {
      setFormErrors({ submit: err.response?.data?.detail || 'Error al guardar' });
    }
  };

  const handleDeleteClick = (p) => {
    setPiezaToDelete(p);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!piezaToDelete) return;
    try {
      await piezasAPI.delete(piezaToDelete.id);
      setSuccess('Pieza eliminada');
      setOpenDeleteDialog(false);
      setPiezaToDelete(null);
      loadPiezas();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al eliminar');
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon /> Bodega / Almacén
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" size="small" onClick={() => { setFormCatalogo({ nombre: '', descripcion: '', subcategorias: [] }); setCategoriaRecienCreada(null); setOpenCatalogoDialog(true); }}>
              Crear categoría
            </Button>
            {isAdmin && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                disabled={eliminandoTodasCategorias || (catalogos?.length === 0)}
                onClick={async () => {
                  if (!window.confirm('¿Eliminar todas las categorías y subcategorías? Las piezas quedarán sin categoría.')) return;
                  setEliminandoTodasCategorias(true);
                  try {
                    await piezasAPI.deleteAllCatalogos();
                    loadCatalogos();
                    setSuccess('Categorías y subcategorías eliminadas. Puedes crear de nuevo desde cero.');
                  } catch (err) {
                    setError(err.response?.data?.detail || 'Error al eliminar');
                  } finally {
                    setEliminandoTodasCategorias(false);
                  }
                }}
              >
                {eliminandoTodasCategorias ? 'Eliminando…' : 'Eliminar todas las categorías'}
              </Button>
            )}
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
              Nueva pieza
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

        <Paper sx={{ p: 1 }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadPiezas()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon /></InputAdornment>
              )
            }}
            sx={{ mb: 1, minWidth: 280 }}
          />
          <Button size="small" onClick={loadPiezas} sx={{ ml: 1 }}>Buscar</Button>
        </Paper>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Código / Folio</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Catálogo</TableCell>
                  <TableCell>Subcatálogo</TableCell>
                  {isAdmin && <TableCell align="right">Precio</TableCell>}
                  <TableCell align="right">Stock</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {piezas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 9 : 8} align="center">No hay piezas. Crea una para el almacén.</TableCell>
                  </TableRow>
                ) : (
                  piezas.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.codigo || '-'}</TableCell>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>{p.catalogo_nombre || '-'}</TableCell>
                      <TableCell>{p.subcatalogo_nombre || '-'}</TableCell>
                      {isAdmin && <TableCell align="right">${Number(p.precio).toFixed(2)}</TableCell>}
                      <TableCell align="right">{p.stock}</TableCell>
                      <TableCell>{p.unidad || 'pza'}</TableCell>
                      <TableCell>
                        <Chip label={p.activo !== false ? 'Activa' : 'Inactiva'} size="small" color={p.activo !== false ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Agregar a orden de trabajo (se descuenta del stock y suma al costo de la OT)">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={async () => {
                                setPiezaAddToOrden(p);
                                setAddToOrdenOrdenId('');
                                setAddToOrdenCantidad(1);
                                setAddToOrdenError('');
                                try {
                                  const res = await ordenesAPI.getAll({ limit: 200, solo_activas: true });
                                  setOrdenesList(res.data || []);
                                  setOpenAddToOrdenDialog(true);
                                } catch (e) {
                                  setError('Error al cargar órdenes');
                                }
                              }}
                              disabled={!(p.stock > 0) || p.activo === false}
                            >
                              <PlaylistAddIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <IconButton size="small" onClick={() => handleOpenEdit(p)} title="Editar"><EditIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(p)} title="Eliminar"><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPieza ? 'Editar pieza' : 'Nueva pieza'}</DialogTitle>
        <DialogContent>
          {formErrors.submit && <Alert severity="error" sx={{ mb: 1 }}>{formErrors.submit}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Código"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              fullWidth
              size="small"
              placeholder="Vacío = folio automático MAT-AÑO-XXXX"
            />
            <TextField
              select
              label="Catálogo"
              value={formData.catalogo_id}
              onChange={(e) => setFormData({ ...formData, catalogo_id: e.target.value, subcatalogo_id: '' })}
              fullWidth
              size="small"
            >
              <MenuItem value="">Ninguno</MenuItem>
              {catalogos.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Subcatálogo"
              value={formData.subcatalogo_id}
              onChange={(e) => setFormData({ ...formData, subcatalogo_id: e.target.value })}
              fullWidth
              size="small"
              disabled={!formData.catalogo_id}
            >
              <MenuItem value="">Ninguno</MenuItem>
              {subcatalogos.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              fullWidth
              size="small"
              required
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
            />
            <TextField
              label="Descripción"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
            {isAdmin && (
              <TextField
                label="Precio unitario"
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                fullWidth
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
                error={!!formErrors.precio}
                helperText={formErrors.precio}
              />
            )}
            <TextField
              label="Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
              error={!!formErrors.stock}
              helperText={formErrors.stock}
            />
            <TextField
              label="Unidad"
              select
              value={formData.unidad}
              onChange={(e) => setFormData({ ...formData, unidad: e.target.value })}
              fullWidth
              size="small"
            >
              <MenuItem value="pza">pza</MenuItem>
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="m">m</MenuItem>
              <MenuItem value="lt">lt</MenuItem>
              <MenuItem value="caja">caja</MenuItem>
            </TextField>
            {editingPieza && (
              <TextField
                select
                label="Estado"
                value={formData.activo ? 'activo' : 'inactivo'}
                onChange={(e) => setFormData({ ...formData, activo: e.target.value === 'activo' })}
                fullWidth
                size="small"
              >
                <MenuItem value="activo">Activa</MenuItem>
                <MenuItem value="inactivo">Inactiva</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>{editingPieza ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCatalogoDialog} onClose={() => { setOpenCatalogoDialog(false); setCategoriaRecienCreada(null); setFormCatalogo({ nombre: '', descripcion: '', subcategorias: [] }); }} maxWidth="sm" fullWidth>
        <DialogTitle>{categoriaRecienCreada ? 'Agregar sub categoría' : 'Crear categoría'}</DialogTitle>
        <DialogContent>
          {!categoriaRecienCreada ? (
            <>
              <TextField fullWidth label="Nombre de la categoría *" value={formCatalogo.nombre} onChange={(e) => setFormCatalogo({ ...formCatalogo, nombre: e.target.value })} size="small" sx={{ mt: 1 }} placeholder="Ej: Herrajes, Pinturas" />
              <TextField fullWidth label="Descripción (opcional)" value={formCatalogo.descripcion} onChange={(e) => setFormCatalogo({ ...formCatalogo, descripcion: e.target.value })} size="small" multiline rows={2} sx={{ mt: 2 }} />
            </>
          ) : (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>Categoría «{categoriaRecienCreada.nombre}» creada. Puedes agregar subcategorías (opcional).</Alert>
              <Typography variant="subtitle2" sx={{ mb: 1 }} color="text.secondary">Subcategorías</Typography>
              {(formCatalogo.subcategorias || []).map((sub, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1 }}>
                  <TextField fullWidth size="small" label="Nombre subcategoría" value={sub.nombre} onChange={(e) => {
                    const next = [...(formCatalogo.subcategorias || [])];
                    next[idx] = { ...next[idx], nombre: e.target.value };
                    setFormCatalogo({ ...formCatalogo, subcategorias: next });
                  }} />
                  <TextField fullWidth size="small" label="Descripción" value={sub.descripcion || ''} onChange={(e) => {
                    const next = [...(formCatalogo.subcategorias || [])];
                    next[idx] = { ...next[idx], descripcion: e.target.value };
                    setFormCatalogo({ ...formCatalogo, subcategorias: next });
                  }} />
                  <IconButton size="small" color="error" onClick={() => setFormCatalogo({ ...formCatalogo, subcategorias: formCatalogo.subcategorias.filter((_, i) => i !== idx) })} title="Quitar"><DeleteIcon /></IconButton>
                </Box>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={() => setFormCatalogo({ ...formCatalogo, subcategorias: [...(formCatalogo.subcategorias || []), { nombre: '', descripcion: '' }] })} sx={{ mt: 1 }}>
                Agregar sub categoría
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!categoriaRecienCreada ? (
            <>
              <Button onClick={() => { setOpenCatalogoDialog(false); setCategoriaRecienCreada(null); setFormCatalogo({ nombre: '', descripcion: '', subcategorias: [] }); }}>Cancelar</Button>
              <Button
                variant="contained"
                disabled={!formCatalogo.nombre?.trim()}
                onClick={async () => {
                  try {
                    const res = await piezasAPI.createCatalogo({ nombre: formCatalogo.nombre.trim(), descripcion: formCatalogo.descripcion?.trim() || null, activo: true });
                    const cat = res.data;
                    setCategoriaRecienCreada({ id: cat.id, nombre: cat.nombre });
                    setFormCatalogo(prev => ({ ...prev, subcategorias: [] }));
                    loadCatalogos();
                  } catch (err) {
                    setError(err.response?.data?.detail || 'Error al crear categoría');
                  }
                }}
              >
                Crear
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => { setCategoriaRecienCreada(null); setFormCatalogo({ nombre: '', descripcion: '', subcategorias: [] }); }}>Crear otra categoría</Button>
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    const creados = (formCatalogo.subcategorias || []).filter((s) => s.nombre?.trim());
                    for (const sub of creados) {
                      await piezasAPI.createSubcatalogo({ catalogo_id: categoriaRecienCreada.id, nombre: sub.nombre.trim(), descripcion: sub.descripcion?.trim() || null, activo: true });
                    }
                    setSuccess(creados.length ? `Subcategoría(s) creadas: ${creados.length}` : 'Listo');
                    loadCatalogos();
                    setOpenCatalogoDialog(false);
                    setCategoriaRecienCreada(null);
                    setFormCatalogo({ nombre: '', descripcion: '', subcategorias: [] });
                  } catch (err) {
                    setError(err.response?.data?.detail || 'Error al crear subcategorías');
                  }
                }}
              >
                Terminar
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={openAddToOrdenDialog} onClose={() => setOpenAddToOrdenDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Agregar a orden de trabajo</DialogTitle>
        <DialogContent>
          {piezaAddToOrden && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Material: {piezaAddToOrden.nombre} {piezaAddToOrden.codigo ? `(${piezaAddToOrden.codigo})` : ''} — Stock: {piezaAddToOrden.stock}
            </Typography>
          )}
          {addToOrdenError && <Alert severity="error" sx={{ mt: 1 }}>{addToOrdenError}</Alert>}
          <TextField
            select
            fullWidth
            label="Orden de trabajo"
            value={addToOrdenOrdenId}
            onChange={(e) => setAddToOrdenOrdenId(e.target.value)}
            sx={{ mt: 2 }}
            size="small"
          >
            <MenuItem value="">Seleccionar OT...</MenuItem>
            {ordenesList.map((o) => (
              <MenuItem key={o.id} value={o.id}>{o.folio} — {o.cliente_nombre || 'Sin cliente'}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            value={addToOrdenCantidad}
            onChange={(e) => setAddToOrdenCantidad(Math.max(1, Math.min(piezaAddToOrden?.stock || 1, parseInt(e.target.value, 10) || 1)))}
            inputProps={{ min: 1, max: piezaAddToOrden?.stock || 1 }}
            sx={{ mt: 2 }}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddToOrdenDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!addToOrdenOrdenId || addToOrdenCantidad < 1 || (piezaAddToOrden && addToOrdenCantidad > (piezaAddToOrden.stock || 0))}
            onClick={async () => {
              if (!piezaAddToOrden?.id || !addToOrdenOrdenId) return;
              setAddToOrdenError('');
              try {
                await piezasAPI.addToOrden(Number(addToOrdenOrdenId), {
                  pieza_id: piezaAddToOrden.id,
                  cantidad: Number(addToOrdenCantidad)
                });
                setSuccess(`Se agregaron ${addToOrdenCantidad} unidad(es) a la OT. El costo se suma a la orden.`);
                loadPiezas();
                setOpenAddToOrdenDialog(false);
              } catch (err) {
                setAddToOrdenError(err.response?.data?.detail || 'Error al agregar a la OT');
              }
            }}
          >
            Agregar a la OT
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Eliminar pieza</DialogTitle>
        <DialogContent>
          ¿Eliminar la pieza &quot;{piezaToDelete?.nombre}&quot;? Solo se puede si no está usada en ninguna OT.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Bodega;
