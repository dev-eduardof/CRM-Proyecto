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
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Build as BuildIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { gastosAPI, ordenesAPI } from '../services/api';

const Gastos = ({ mode = 'gastos' }) => {
  const isCompras = mode === 'compras';
  const [gastos, setGastos] = useState([]);
  const [resumen, setResumen] = useState({ por_tipo: {}, total: 0 });
  const [resumenCompras, setResumenCompras] = useState({ compras: 0, materiales: 0, total: 0 });
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [editingGasto, setEditingGasto] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState(null);
  const [comprasTab, setComprasTab] = useState(0);

  const [filtros, setFiltros] = useState({
    tipo: '',
    orden_trabajo_id: '',
    fecha_desde: '',
    fecha_hasta: ''
  });

  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    tipo: isCompras ? 'TRABAJO' : 'GENERAL',
    categoria: isCompras ? 'COMPRAS' : 'OTRO',
    orden_trabajo_id: '',
    fecha_gasto: new Date().toISOString().slice(0, 10)
  });
  const [formErrors, setFormErrors] = useState({});

  const currentCategoriaCompras = comprasTab === 0 ? 'COMPRAS' : 'MATERIALES';

  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const fechaDesde = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
    const fechaHasta = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
    return { fechaDesde, fechaHasta };
  };

  const shouldApplyDefaultMonthFilter = () => {
    const hasDateFilters = Boolean(filtros.fecha_desde || filtros.fecha_hasta);
    const hasOtFilter = Boolean(filtros.orden_trabajo_id);
    const hasTipoFilter = !isCompras && Boolean(filtros.tipo);
    return !hasDateFilters && !hasOtFilter && !hasTipoFilter;
  };

  const loadGastos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (isCompras) {
        params.tipo = 'TRABAJO';
        params.categoria = currentCategoriaCompras;
      } else if (filtros.tipo) {
        params.tipo = filtros.tipo;
      }
      if (filtros.orden_trabajo_id) params.orden_trabajo_id = filtros.orden_trabajo_id;
      if (shouldApplyDefaultMonthFilter()) {
        const { fechaDesde, fechaHasta } = getCurrentMonthRange();
        params.fecha_desde = fechaDesde;
        params.fecha_hasta = fechaHasta;
      } else {
        if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
        if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
      }
      const res = await gastosAPI.getAll(params);
      setGastos(res.data || []);
      setError('');
    } catch (err) {
      console.error('Error al cargar gastos:', err);
      setError(err.response?.data?.detail || 'Error al cargar gastos');
      setGastos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadResumen = async () => {
    try {
      if (isCompras) {
        const baseParams = {};
        if (filtros.orden_trabajo_id) baseParams.orden_trabajo_id = filtros.orden_trabajo_id;
        if (shouldApplyDefaultMonthFilter()) {
          const { fechaDesde, fechaHasta } = getCurrentMonthRange();
          baseParams.fecha_desde = fechaDesde;
          baseParams.fecha_hasta = fechaHasta;
        } else {
          if (filtros.fecha_desde) baseParams.fecha_desde = filtros.fecha_desde;
          if (filtros.fecha_hasta) baseParams.fecha_hasta = filtros.fecha_hasta;
        }
        const [rCompras, rMateriales] = await Promise.all([
          gastosAPI.getResumen({ ...baseParams, tipo: 'TRABAJO', categoria: 'COMPRAS' }),
          gastosAPI.getResumen({ ...baseParams, tipo: 'TRABAJO', categoria: 'MATERIALES' })
        ]);
        const totalCompras = rCompras.data?.total || 0;
        const totalMateriales = rMateriales.data?.total || 0;
        setResumenCompras({
          compras: totalCompras,
          materiales: totalMateriales,
          total: totalCompras + totalMateriales
        });
        return;
      }
      const params = {};
      if (shouldApplyDefaultMonthFilter()) {
        const { fechaDesde, fechaHasta } = getCurrentMonthRange();
        params.fecha_desde = fechaDesde;
        params.fecha_hasta = fechaHasta;
      } else {
        if (filtros.fecha_desde) params.fecha_desde = filtros.fecha_desde;
        if (filtros.fecha_hasta) params.fecha_hasta = filtros.fecha_hasta;
      }
      if (filtros.tipo) params.tipo = filtros.tipo;
      const res = await gastosAPI.getResumen(params);
      setResumen(res.data || { por_tipo: {}, total: 0 });
    } catch {
      if (isCompras) {
        setResumenCompras({ compras: 0, materiales: 0, total: 0 });
      } else {
        setResumen({ por_tipo: {}, total: 0 });
      }
    }
  };

  const loadOrdenes = async () => {
    try {
      // Solo OT activas (no entregadas/finalizadas) para asociar gastos
      const res = await ordenesAPI.getAll({ limit: 500, solo_activas: true });
      setOrdenes(res.data?.items || res.data || []);
    } catch {
      setOrdenes([]);
    }
  };

  useEffect(() => {
    loadGastos();
  }, [isCompras, comprasTab, filtros.tipo, filtros.orden_trabajo_id, filtros.fecha_desde, filtros.fecha_hasta]);

  useEffect(() => {
    loadResumen();
  }, [isCompras, comprasTab, filtros.tipo, filtros.orden_trabajo_id, filtros.fecha_desde, filtros.fecha_hasta]);

  useEffect(() => {
    loadOrdenes();
  }, []);

  const handleOpenDialog = (gasto = null) => {
    if (gasto) {
      setEditingGasto(gasto);
      setFormData({
        descripcion: gasto.descripcion || '',
        monto: gasto.monto?.toString() || '',
        tipo: gasto.tipo || 'GENERAL',
        categoria: (gasto.categoria || 'OTRO').toUpperCase(),
        orden_trabajo_id: gasto.orden_trabajo_id || '',
        fecha_gasto: gasto.fecha_gasto || new Date().toISOString().slice(0, 10)
      });
    } else {
      setEditingGasto(null);
      setFormData({
        descripcion: '',
        monto: '',
        tipo: isCompras ? 'TRABAJO' : 'GENERAL',
        categoria: isCompras ? currentCategoriaCompras : 'OTRO',
        orden_trabajo_id: '',
        fecha_gasto: new Date().toISOString().slice(0, 10)
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGasto(null);
    setFormData({
      descripcion: '',
      monto: '',
      tipo: isCompras ? 'TRABAJO' : 'GENERAL',
      categoria: isCompras ? currentCategoriaCompras : 'OTRO',
      orden_trabajo_id: '',
      fecha_gasto: new Date().toISOString().slice(0, 10)
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'tipo' && value === 'GENERAL') {
      setFormData(prev => ({ ...prev, orden_trabajo_id: '', categoria: 'OTRO' }));
    }
  };

  const validate = () => {
    const err = {};
    if (!formData.descripcion?.trim()) err.descripcion = 'Descripción requerida';
    const m = parseFloat(formData.monto);
    if (isNaN(m) || m < 0.01) err.monto = 'Monto debe ser mayor a 0';
    if (!formData.fecha_gasto) err.fecha_gasto = 'Fecha requerida';
    if (formData.tipo === 'TRABAJO' && formData.orden_trabajo_id === '') {
      err.orden_trabajo_id = 'Selecciona una orden de trabajo';
    }
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload = {
        descripcion: formData.descripcion.trim(),
        monto: parseFloat(formData.monto),
        tipo: formData.tipo,
        categoria: formData.categoria || 'OTRO',
        fecha_gasto: formData.fecha_gasto,
        orden_trabajo_id: formData.tipo === 'TRABAJO' && formData.orden_trabajo_id ? parseInt(formData.orden_trabajo_id, 10) : null
      };
      if (editingGasto) {
        await gastosAPI.update(editingGasto.id, payload);
        setSuccessMessage('Gasto actualizado correctamente');
      } else {
        await gastosAPI.create(payload);
        setSuccessMessage('Gasto registrado correctamente');
      }
      handleCloseDialog();
      loadGastos();
      loadResumen();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : (detail || 'Error al guardar'));
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeleteClick = (gasto) => {
    setGastoToDelete(gasto);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gastoToDelete) return;
    try {
      await gastosAPI.delete(gastoToDelete.id);
      setSuccessMessage('Gasto eliminado');
      setOpenDeleteDialog(false);
      setGastoToDelete(null);
      loadGastos();
      loadResumen();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al eliminar');
      setTimeout(() => setError(''), 5000);
    }
  };

  const formatMoney = (n) => {
    const num = typeof n === 'number' ? n : parseFloat(n);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num);
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {isCompras ? 'Compras' : 'Panel de Gastos'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {isCompras ? 'Nueva compra/material' : 'Nuevo gasto'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {isCompras ? (
            <>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">Compras</Typography>
                  <Typography variant="h5">{formatMoney(resumenCompras.compras)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">Materiales</Typography>
                  <Typography variant="h5">{formatMoney(resumenCompras.materiales)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">Total</Typography>
                  <Typography variant="h5">{formatMoney(resumenCompras.total)}</Typography>
                </Paper>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">Total gastos</Typography>
                  <Typography variant="h5">{formatMoney(resumen.total)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">Por trabajo</Typography>
                  <Typography variant="h5">{formatMoney(resumen.por_tipo?.TRABAJO || 0)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary">Generales</Typography>
                  <Typography variant="h5">{formatMoney(resumen.por_tipo?.GENERAL || 0)}</Typography>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Filtros</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            {isCompras ? (
              <Tabs value={comprasTab} onChange={(e, v) => setComprasTab(v)}>
                <Tab label="Compras" />
                <Tab label="Materiales" />
              </Tabs>
            ) : (
              <TextField
                select
                size="small"
                label="Tipo"
                sx={{ minWidth: 140 }}
                value={filtros.tipo}
                onChange={(e) => setFiltros(f => ({ ...f, tipo: e.target.value }))}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="TRABAJO">Por trabajo</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
              </TextField>
            )}
            <TextField
              select
              size="small"
              label="OT"
              sx={{ minWidth: 220 }}
              value={filtros.orden_trabajo_id}
              onChange={(e) => setFiltros(f => ({ ...f, orden_trabajo_id: e.target.value }))}
            >
              <MenuItem value="">Todas</MenuItem>
              {ordenes.map((ot) => (
                <MenuItem key={ot.id} value={ot.id}>
                  {ot.folio} – {(ot.descripcion || '').slice(0, 50)}{(ot.descripcion?.length || 0) > 50 ? '…' : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="date"
              label="Desde"
              InputLabelProps={{ shrink: true }}
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros(f => ({ ...f, fecha_desde: e.target.value }))}
            />
            <TextField
              size="small"
              type="date"
              label="Hasta"
              InputLabelProps={{ shrink: true }}
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros(f => ({ ...f, fecha_hasta: e.target.value }))}
            />
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>OT</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Registrado por</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gastos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No hay registros</TableCell>
                  </TableRow>
                ) : (
                  gastos.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>{g.fecha_gasto}</TableCell>
                      <TableCell>{g.descripcion}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={g.tipo === 'TRABAJO' ? <BuildIcon /> : <CategoryIcon />}
                          label={g.tipo === 'TRABAJO' ? 'Por trabajo' : 'General'}
                          color={g.tipo === 'TRABAJO' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={(g.categoria || 'OTRO').toUpperCase()}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{g.folio_orden || '—'}</TableCell>
                      <TableCell align="right">{formatMoney(g.monto)}</TableCell>
                      <TableCell>{g.nombre_registro || '—'}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleOpenDialog(g)} title="Editar">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(g)} title="Eliminar">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
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
        <DialogTitle>{editingGasto ? (isCompras ? 'Editar compra/material' : 'Editar gasto') : (isCompras ? 'Nueva compra/material' : 'Nuevo gasto')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleFormChange}
              fullWidth
              required
              error={!!formErrors.descripcion}
              helperText={formErrors.descripcion}
            />
            <TextField
              label="Monto"
              name="monto"
              type="number"
              value={formData.monto}
              onChange={handleFormChange}
              fullWidth
              required
              inputProps={{ min: 0.01, step: 0.01 }}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              error={!!formErrors.monto}
              helperText={formErrors.monto}
            />
            <TextField
              select
              label="Tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleFormChange}
              fullWidth
              disabled={isCompras}
            >
              <MenuItem value="GENERAL">General</MenuItem>
              <MenuItem value="TRABAJO">Por trabajo (OT)</MenuItem>
            </TextField>
            <TextField
              select
              label="Categoría"
              name="categoria"
              value={formData.categoria}
              onChange={handleFormChange}
              fullWidth
              disabled={formData.tipo === 'GENERAL'}
            >
              <MenuItem value="OTRO">Otro</MenuItem>
              <MenuItem value="COMPRAS">Compras</MenuItem>
              <MenuItem value="MATERIALES">Materiales</MenuItem>
            </TextField>
            {formData.tipo === 'TRABAJO' && (
              <TextField
                select
                label="Orden de trabajo"
                name="orden_trabajo_id"
                value={formData.orden_trabajo_id}
                onChange={handleFormChange}
                fullWidth
                error={!!formErrors.orden_trabajo_id}
                helperText={formErrors.orden_trabajo_id}
              >
                <MenuItem value="">Seleccionar OT</MenuItem>
                {ordenes.map((ot) => (
                  <MenuItem key={ot.id} value={ot.id}>
                    {ot.folio} – {(ot.descripcion || '').slice(0, 50)}{(ot.descripcion?.length || 0) > 50 ? '…' : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="Fecha del gasto"
              name="fecha_gasto"
              type="date"
              value={formData.fecha_gasto}
              onChange={handleFormChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              error={!!formErrors.fecha_gasto}
              helperText={formErrors.fecha_gasto}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingGasto ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>¿Eliminar gasto?</DialogTitle>
        <DialogContent>
          {gastoToDelete && (
            <Typography>
              Se eliminará el gasto &quot;{gastoToDelete.descripcion}&quot; por {formatMoney(gastoToDelete.monto)}.
              Esta acción no se puede deshacer.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Gastos;
