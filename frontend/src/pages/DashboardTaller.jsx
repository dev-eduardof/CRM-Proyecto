import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  Inbox as InboxIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  CameraAlt as CameraIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ordenesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** Bloques de descripción + fotos de entrada (misma lógica que Ordenes). */
const getBloquesFotosDetalle = (orden) => {
  if (!orden) return { bloques: [], fotosEntrada: [], numBloques: 0, buildFotoUrl: () => null };
  const desc = orden.descripcion || '';
  const partes = desc.split(/\s*===\s*PRODUCTO\s*\d+\s*===\s*/i).filter(Boolean);
  const bloques = partes.length >= 1 ? partes : [desc || 'Sin descripción'];
  const fotosEntrada = Array.isArray(orden.fotos_entrada_list) && orden.fotos_entrada_list.length > 0
    ? [...orden.fotos_entrada_list]
    : (orden.foto_entrada ? [orden.foto_entrada] : []);
  const numBloques = Math.max(bloques.length, fotosEntrada.length, 1);
  const buildFotoUrl = (path) => {
    if (path == null || typeof path !== 'string' || !path.trim()) return null;
    const p = path.trim();
    return `${API_BASE_URL}${p.startsWith('/') ? p : '/' + p}`;
  };
  return { bloques, fotosEntrada, numBloques, buildFotoUrl };
};

const ESTADOS_MAP = [
  { value: 'RECIBIDO', label: 'Recibido', color: 'info' },
  { value: 'EN_ESPERA', label: 'En Espera', color: 'default' },
  { value: 'PROCESO', label: 'En Proceso', color: 'primary' },
  { value: 'FINALIZADO', label: 'Finalizado', color: 'success' }
];
const getEstadoChip = (estatus) => {
  const o = ESTADOS_MAP.find(e => e.value === estatus);
  return <Chip size="small" label={o?.label || estatus} color={o?.color || 'default'} />;
};
const getPrioridadChip = (prioridad) => {
  const isUrgente = prioridad === 'URGENTE';
  return <Chip size="small" label={isUrgente ? 'Urgente' : 'Normal'} color={isUrgente ? 'error' : 'default'} />;
};

// Columnas del tablero (estados del backend)
const COLUMNAS = [
  { id: 'RECIBIDO', titulo: 'Recibido', icono: <InboxIcon />, color: '#1976d2' },
  { id: 'EN_ESPERA', titulo: 'En espera', icono: <ScheduleIcon />, color: '#ed6c02' },
  { id: 'PROCESO', titulo: 'En proceso', icono: <BuildIcon />, color: '#9c27b0' },
  { id: 'FINALIZADO', titulo: 'Finalizado', icono: <CheckCircleIcon />, color: '#2e7d32' }
];

// Estados que se muestran en "En proceso" si el backend devuelve otros
const MAPEO_EN_PROCESO = ['PROCESO', 'DIAGNOSTICO', 'PAUSA', 'REVISION'];
// Estados que se muestran en "Finalizado"
const MAPEO_FINALIZADO = ['FINALIZADO', 'TERMINADO', 'ENTREGADO'];

const obtenerColumnaEstatus = (estatus) => {
  if (estatus === 'RECIBIDO') return 'RECIBIDO';
  if (estatus === 'EN_ESPERA') return 'EN_ESPERA';
  if (MAPEO_EN_PROCESO.includes(estatus)) return 'PROCESO';
  if (MAPEO_FINALIZADO.includes(estatus)) return 'FINALIZADO';
  return 'RECIBIDO';
};

const formatApiError = (detail) => {
  if (detail == null) return '';
  if (Array.isArray(detail)) {
    return detail.map(e => e.msg || e.loc?.join('.') || JSON.stringify(e)).join('. ') || 'Error';
  }
  if (typeof detail === 'object') return JSON.stringify(detail);
  return String(detail);
};

const DashboardTaller = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [arrastrando, setArrastrando] = useState(null);
  const [actualizando, setActualizando] = useState(null);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [ordenDetalle, setOrdenDetalle] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const isDraggingRef = useRef(false);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ordenesAPI.getAll({});
      setOrdenes(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || 'Error al cargar las órdenes');
      setOrdenes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const ordenesPorColumna = COLUMNAS.reduce((acc, col) => {
    acc[col.id] = ordenes.filter(
      (o) => obtenerColumnaEstatus(o.estatus) === col.id
    );
    return acc;
  }, {});

  const handleDragStart = (e, orden) => {
    isDraggingRef.current = true;
    setArrastrando(orden.id);
    e.dataTransfer.setData('application/orden-id', String(orden.id));
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.6';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setArrastrando(null);
    setTimeout(() => { isDraggingRef.current = false; }, 0);
  };

  const handleClickCard = async (orden) => {
    if (isDraggingRef.current) return;
    setLoadingDetalle(true);
    setOpenDetalle(true);
    setOrdenDetalle(null);
    try {
      const res = await ordenesAPI.getById(orden.id);
      let data = res?.data;
      if (data?.id) {
        try {
          const fotosRes = await ordenesAPI.getFotos(data.id);
          const list = fotosRes?.data?.fotos_entrada_list;
          if (Array.isArray(list)) data = { ...data, fotos_entrada_list: list };
        } catch (_) {}
      }
      setOrdenDetalle(data);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || 'Error al cargar el detalle');
      setOpenDetalle(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, columnaId) => {
    e.preventDefault();
    const ordenId = e.dataTransfer.getData('application/orden-id');
    if (!ordenId) return;
    const orden = ordenes.find((o) => o.id === Number(ordenId));
    if (!orden || obtenerColumnaEstatus(orden.estatus) === columnaId) return;

    setActualizando(Number(ordenId));
    setError('');
    try {
      await ordenesAPI.cambiarEstado(Number(ordenId), { estatus: columnaId });
      await fetchOrdenes();
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || 'Error al cambiar estado');
    } finally {
      setActualizando(null);
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            Dashboard de Taller
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Recargar">
              <IconButton onClick={fetchOrdenes} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Ver listado completo">
              <IconButton onClick={() => navigate('/ordenes')}>
                <ViewListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
              minHeight: '70vh'
            }}
          >
            {COLUMNAS.map((col) => (
              <Paper
                key={col.id}
                elevation={1}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 400,
                  border: '2px dashed',
                  borderColor: 'divider',
                  bgcolor: 'grey.50',
                  transition: 'border-color 0.2s, background-color 0.2s',
                  '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'grey.100'
                  }
                }}
              >
                <Box
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: col.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {col.icono}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {col.titulo}
                  </Typography>
                  <Chip
                    label={ordenesPorColumna[col.id]?.length ?? 0}
                    size="small"
                    sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                  />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                >
                  {(ordenesPorColumna[col.id] || []).map((orden) => (
                    <Card
                      key={orden.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, orden)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleClickCard(orden)}
                      sx={{
                        cursor: 'grab',
                        opacity: actualizando === orden.id ? 0.7 : 1,
                        '&:active': { cursor: 'grabbing' },
                        '&:hover': { boxShadow: 2 }
                      }}
                    >
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Typography variant="subtitle2" fontWeight="bold" noWrap>
                          {orden.folio}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
                          {orden.cliente_nombre || 'Sin cliente'}
                        </Typography>
                        {orden.prioridad === 'URGENTE' && (
                          <Chip label="Urgente" size="small" color="error" sx={{ mt: 1 }} />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {/* Dialog Detalle de la OT */}
        <Dialog open={openDetalle} onClose={() => setOpenDetalle(false)} maxWidth="md" fullWidth>
          <DialogTitle>Detalles de la Orden {ordenDetalle?.folio || '...'}</DialogTitle>
          <DialogContent>
            {loadingDetalle ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : ordenDetalle ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">Cliente</Typography>
                  <Typography>{ordenDetalle.cliente_nombre}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Categoría</Typography>
                  <Typography>{ordenDetalle.categoria_nombre || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Subcategoría</Typography>
                  <Typography>{ordenDetalle.subcategoria_nombre || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Estado</Typography>
                  {getEstadoChip(ordenDetalle.estatus)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Prioridad</Typography>
                  {getPrioridadChip(ordenDetalle.prioridad)}
                </Grid>
                {ordenDetalle.observaciones && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Observaciones</Typography>
                    <Typography>{ordenDetalle.observaciones}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Fotos de entrada y detalles</Typography>
                  {(() => {
                    const { bloques, fotosEntrada, numBloques, buildFotoUrl } = getBloquesFotosDetalle(ordenDetalle);
                    return Array.from({ length: numBloques }, (_, idx) => ({ texto: bloques[idx] || '', idx })).map(({ texto, idx }) => {
                      const fotoUrl = buildFotoUrl(fotosEntrada[idx]);
                      return (
                        <Paper
                          key={idx}
                          variant="outlined"
                          sx={{ p: 2, mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}
                        >
                          <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 280 }, minHeight: 200 }}>
                            {fotoUrl ? (
                              <img
                                src={fotoUrl}
                                alt={`Foto de entrada ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  maxHeight: 320,
                                  objectFit: 'contain',
                                  borderRadius: 8,
                                  border: '1px solid #e0e0e0',
                                  display: 'block'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  minHeight: 200,
                                  border: '1px dashed',
                                  borderColor: 'divider',
                                  borderRadius: 2,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'action.hover'
                                }}
                              >
                                <CameraIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                <Typography variant="body2" color="text.secondary">Sin foto</Typography>
                              </Box>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Producto {idx + 1}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Trabajo a realizar / Medidas y especificaciones</Typography>
                            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', m: 0, fontFamily: 'inherit' }}>
                              {texto.trim() || '—'}
                            </Typography>
                          </Box>
                        </Paper>
                      );
                    });
                  })()}
                  {!ordenDetalle.foto_entrada && !(Array.isArray(ordenDetalle.fotos_entrada_list) && ordenDetalle.fotos_entrada_list.length > 0) && !ordenDetalle.descripcion && (
                    <Typography variant="body2" color="text.secondary">No hay fotos de entrada ni descripción registradas.</Typography>
                  )}
                </Grid>
              </Grid>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetalle(false)}>Cerrar</Button>
            <Button variant="contained" onClick={() => { setOpenDetalle(false); navigate('/ordenes'); }}>
              Ver en listado completo
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default DashboardTaller;
