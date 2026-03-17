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
  Grid,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ViewList as ViewListIcon,
  Inbox as InboxIcon,
  Schedule as ScheduleIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  CameraAlt as CameraIcon,
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon
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

/** Parsear descripción de subtarea en bloques (Trabajo a Realizar / Medidas y Especificaciones). */
const parsearDescripcionBloquesSubtarea = (descripcion) => {
  if (!descripcion || typeof descripcion !== 'string') return [];
  const partes = descripcion.split(/\s*===\s*PRODUCTO\s*\d+\s*===\s*/i).filter(Boolean);
  const bloques = partes.length >= 1 ? partes : [descripcion];
  return bloques.map((texto) => {
    const t = texto.trim();
    const trabajoMatch = t.match(/Trabajo\s+a\s+Realizar:\s*\n?([\s\S]*?)(?=Medidas\s+y\s+Especificaciones:|$)/i);
    const medidasMatch = t.match(/Medidas\s+y\s+Especificaciones:\s*\n?([\s\S]*?)$/i);
    return {
      trabajo_realizar: trabajoMatch ? trabajoMatch[1].trim() : t,
      medidas_especificaciones: medidasMatch ? medidasMatch[1].trim() : ''
    };
  });
};

/** Construir bloques para edición en subtarea (foto + texto por producto). */
const buildBloquesFromSubtarea = (st) => {
  if (!st) return [];
  const fotos = Array.isArray(st.fotos_entrada_list) ? st.fotos_entrada_list : [];
  const textos = parsearDescripcionBloquesSubtarea(st.descripcion || '');
  const numBloques = Math.max(textos.length, fotos.length, 1);
  return Array.from({ length: numBloques }, (_, idx) => ({
    url: fotos[idx] || '',
    trabajo_realizar: textos[idx]?.trabajo_realizar ?? '',
    medidas_especificaciones: textos[idx]?.medidas_especificaciones ?? ''
  }));
};

/** Construir string descripcion desde bloques (mismo formato que OT principal). */
const buildDescripcionFromBloques = (bloques) => {
  let desc = '';
  bloques.forEach((b, idx) => {
    if (b.trabajo_realizar || b.medidas_especificaciones) {
      desc += `\n=== PRODUCTO ${idx + 1} ===\n`;
      if (b.trabajo_realizar) desc += `Trabajo a Realizar:\n${b.trabajo_realizar}\n\n`;
      if (b.medidas_especificaciones) desc += `Medidas y Especificaciones:\n${b.medidas_especificaciones}\n\n`;
    }
  });
  return desc.trim();
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
  const [subtareaDetalle, setSubtareaDetalle] = useState(null);
  const [openSubtareaDetalleDialog, setOpenSubtareaDetalleDialog] = useState(false);
  const [openNuevaSubtareaDialog, setOpenNuevaSubtareaDialog] = useState(false);
  const [formNuevaSubtarea, setFormNuevaSubtarea] = useState({ titulo: '', descripcion: '' });
  const [bloquesNuevaSubtarea, setBloquesNuevaSubtarea] = useState([{ trabajo_realizar: '', medidas_especificaciones: '' }]);
  const [bloquesSubtarea, setBloquesSubtarea] = useState([]);
  const [guardandoSubtarea, setGuardandoSubtarea] = useState(false);
  const isDraggingRef = useRef(false);

  const refreshOrdenDetalle = async () => {
    if (!ordenDetalle?.id) return null;
    try {
      const res = await ordenesAPI.getById(ordenDetalle.id);
      setOrdenDetalle(res.data);
      return res.data;
    } catch (_) {
      return null;
    }
  };

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
              <>
                {/* Sub tareas: panel para modificar estatus (técnico) */}
                <Box sx={{ mb: 3, mt: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Épica: {ordenDetalle.folio}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Sub tareas — cambia el estado con los botones
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                    {[
                      { key: 'PENDIENTE', label: 'Pendiente', color: 'grey.200' },
                      { key: 'EN_PROCESO', label: 'En proceso', color: 'info.light' },
                      { key: 'COMPLETADA', label: 'Completada', color: 'success.light' },
                      { key: 'CANCELADA', label: 'Cancelada', color: 'grey.300' }
                    ].map((col) => (
                      <Paper key={col.key} variant="outlined" sx={{ flex: 1, minWidth: 140, p: 1.5, bgcolor: col.color }}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">{col.label}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                          {((ordenDetalle.subtareas) || []).filter((st) => (st.estado || '').toUpperCase() === col.key).map((st) => (
                            <Paper
                              key={st.id}
                              elevation={0}
                              sx={{
                                p: 1.5,
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                              onClick={() => {
                                setSubtareaDetalle(st);
                                setBloquesSubtarea(buildBloquesFromSubtarea(st));
                                setOpenSubtareaDetalleDialog(true);
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>{st.titulo}</Typography>
                                  {st.tecnico_nombre && <Typography variant="caption" color="text.secondary" display="block">{st.tecnico_nombre}</Typography>}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                                  {col.key === 'PENDIENTE' && (
                                    <Button size="small" variant="outlined" onClick={async () => {
                                      try {
                                        await ordenesAPI.updateSubtarea(st.id, { estado: 'EN_PROCESO' });
                                        await refreshOrdenDetalle();
                                      } catch (err) { setError(formatApiError(err.response?.data?.detail) || 'Error'); }
                                    }}>→</Button>
                                  )}
                                  {col.key === 'EN_PROCESO' && (
                                    <>
                                      <Button size="small" variant="outlined" onClick={async () => {
                                        try {
                                          await ordenesAPI.updateSubtarea(st.id, { estado: 'PENDIENTE' });
                                          await refreshOrdenDetalle();
                                        } catch (err) { setError(formatApiError(err.response?.data?.detail) || 'Error'); }
                                      }}>←</Button>
                                      <Button size="small" variant="outlined" onClick={async () => {
                                        try {
                                          await ordenesAPI.updateSubtarea(st.id, { estado: 'COMPLETADA' });
                                          await refreshOrdenDetalle();
                                        } catch (err) { setError(formatApiError(err.response?.data?.detail) || 'Error'); }
                                      }}>→</Button>
                                    </>
                                  )}
                                  {col.key === 'COMPLETADA' && (
                                    <>
                                      <Button size="small" variant="outlined" onClick={async () => {
                                        try {
                                          await ordenesAPI.updateSubtarea(st.id, { estado: 'EN_PROCESO' });
                                          await refreshOrdenDetalle();
                                        } catch (err) { setError(formatApiError(err.response?.data?.detail) || 'Error'); }
                                      }}>←</Button>
                                      <Button size="small" variant="outlined" color="error" onClick={async () => {
                                        try {
                                          await ordenesAPI.updateSubtarea(st.id, { estado: 'CANCELADA' });
                                          await refreshOrdenDetalle();
                                        } catch (err) { setError(formatApiError(err.response?.data?.detail) || 'Error'); }
                                      }}>✕</Button>
                                    </>
                                  )}
                                  {col.key === 'CANCELADA' && (
                                    <Button size="small" variant="outlined" onClick={async () => {
                                      try {
                                        await ordenesAPI.updateSubtarea(st.id, { estado: 'COMPLETADA' });
                                        await refreshOrdenDetalle();
                                      } catch (err) { setError(formatApiError(err.response?.data?.detail) || 'Error'); }
                                    }}>←</Button>
                                  )}
                                </Box>
                              </Box>
                              {(st.fotos_entrada_list?.length > 0) && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                  📷 {st.fotos_entrada_list.length} foto(s)
                                </Typography>
                              )}
                            </Paper>
                          ))}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                  <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => { setFormNuevaSubtarea({ titulo: '', descripcion: '' }); setOpenNuevaSubtareaDialog(true); }}>
                    Agregar sub tarea
                  </Button>
                </Box>

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
              </>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDetalle(false)}>Cerrar</Button>
            <Button variant="contained" onClick={() => { setOpenDetalle(false); navigate('/ordenes'); }}>
              Ver en listado completo
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Nueva sub tarea (desde panel técnico): título + información producto como OT principal */}
        <Dialog open={openNuevaSubtareaDialog} onClose={() => { setOpenNuevaSubtareaDialog(false); setFormNuevaSubtarea({ titulo: '', descripcion: '' }); setBloquesNuevaSubtarea([{ trabajo_realizar: '', medidas_especificaciones: '' }]); }} maxWidth="md" fullWidth>
          <DialogTitle>Nueva sub tarea</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Título *" value={formNuevaSubtarea.titulo} onChange={(e) => setFormNuevaSubtarea({ ...formNuevaSubtarea, titulo: e.target.value })} sx={{ mt: 1, mb: 2 }} size="small" required placeholder="Ej: Pintura puerta, Cambio de bisagras" />

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Información del producto (como OT principal)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Trabajo a realizar y medidas por producto. Las fotos se pueden subir después al abrir la sub tarea.</Typography>

            {bloquesNuevaSubtarea.map((bloque, idx) => (
              <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Producto {idx + 1}</Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Trabajo a realizar"
                  multiline
                  rows={2}
                  value={bloque.trabajo_realizar}
                  onChange={(e) => setBloquesNuevaSubtarea(prev => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], trabajo_realizar: e.target.value };
                    return next;
                  })}
                  placeholder="Describe el trabajo a realizar"
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Medidas y especificaciones"
                  multiline
                  rows={2}
                  value={bloque.medidas_especificaciones}
                  onChange={(e) => setBloquesNuevaSubtarea(prev => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], medidas_especificaciones: e.target.value };
                    return next;
                  })}
                  placeholder="Medidas, especificaciones, tolerancias"
                />
              </Paper>
            ))}

            <Button size="small" variant="outlined" startIcon={<AddIcon />} sx={{ mb: 1 }} onClick={() => setBloquesNuevaSubtarea(prev => [...prev, { trabajo_realizar: '', medidas_especificaciones: '' }])}>
              Agregar otro producto
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenNuevaSubtareaDialog(false); setFormNuevaSubtarea({ titulo: '', descripcion: '' }); setBloquesNuevaSubtarea([{ trabajo_realizar: '', medidas_especificaciones: '' }]); }}>Cancelar</Button>
            <Button
              variant="contained"
              disabled={!formNuevaSubtarea.titulo?.trim()}
              onClick={async () => {
                if (!ordenDetalle?.id) return;
                try {
                  const descripcion = buildDescripcionFromBloques(bloquesNuevaSubtarea) || null;
                  await ordenesAPI.createSubtarea(ordenDetalle.id, {
                    titulo: formNuevaSubtarea.titulo.trim(),
                    descripcion: descripcion || null,
                    estado: 'PENDIENTE',
                    orden: (ordenDetalle.subtareas?.length || 0)
                  });
                  await refreshOrdenDetalle();
                  setOpenNuevaSubtareaDialog(false);
                  setFormNuevaSubtarea({ titulo: '', descripcion: '' });
                  setBloquesNuevaSubtarea([{ trabajo_realizar: '', medidas_especificaciones: '' }]);
                } catch (err) {
                  setError(formatApiError(err.response?.data?.detail) || 'Error al crear sub tarea');
                }
              }}
            >
              Crear
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Detalle sub tarea: misma información que OT principal (producto, fotos, trabajo a realizar) */}
        <Dialog open={openSubtareaDetalleDialog} onClose={() => { setOpenSubtareaDetalleDialog(false); setSubtareaDetalle(null); setBloquesSubtarea([]); }} maxWidth="md" fullWidth>
          <DialogTitle>{subtareaDetalle?.titulo || 'Sub tarea'}</DialogTitle>
          <DialogContent>
            {subtareaDetalle && (
              <>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Estado"
                  value={(subtareaDetalle.estado || 'PENDIENTE').toUpperCase()}
                  onChange={async (e) => {
                    const nuevo = e.target.value;
                    try {
                      await ordenesAPI.updateSubtarea(subtareaDetalle.id, { estado: nuevo });
                      const data = await refreshOrdenDetalle();
                      const st = (data?.subtareas || []).find(s => s.id === subtareaDetalle.id);
                      if (st) {
                        setSubtareaDetalle(st);
                        setBloquesSubtarea(prev => {
                          const fromSt = buildBloquesFromSubtarea(st);
                          return fromSt.map((b, i) => ({
                            ...b,
                            trabajo_realizar: prev[i]?.trabajo_realizar ?? b.trabajo_realizar,
                            medidas_especificaciones: prev[i]?.medidas_especificaciones ?? b.medidas_especificaciones
                          }));
                        });
                      }
                    } catch (err) { setError(formatApiError(err.response?.data?.detail) || 'Error'); }
                  }}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                  <MenuItem value="EN_PROCESO">En proceso</MenuItem>
                  <MenuItem value="COMPLETADA">Completada</MenuItem>
                  <MenuItem value="CANCELADA">Cancelada</MenuItem>
                </TextField>

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Información del producto (como OT principal)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Trabajo a realizar, medidas y fotos por producto
                </Typography>

                {bloquesSubtarea.map((bloque, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{ p: 2, mb: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}
                  >
                    <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 220 }, minHeight: 160 }}>
                      {bloque.url ? (
                        <img
                          src={`${API_BASE_URL}${bloque.url.startsWith('/') ? bloque.url : '/' + bloque.url}`}
                          alt={`Producto ${idx + 1}`}
                          style={{ width: '100%', maxHeight: 240, objectFit: 'contain', borderRadius: 8, border: '1px solid #e0e0e0', display: 'block' }}
                        />
                      ) : (
                        <Button
                          fullWidth
                          variant="outlined"
                          component="label"
                          startIcon={<PhotoCameraIcon />}
                          sx={{ height: 160, borderStyle: 'dashed' }}
                        >
                          Subir foto producto {idx + 1}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file || !subtareaDetalle?.id) return;
                              try {
                                const fd = new FormData();
                                fd.append('file', file);
                                await ordenesAPI.uploadSubtareaFoto(subtareaDetalle.id, fd);
                                const data = await refreshOrdenDetalle();
                                const st = (data?.subtareas || []).find(s => s.id === subtareaDetalle.id);
                                if (st) {
                                  setSubtareaDetalle(st);
                                  setBloquesSubtarea(prev => {
                                    const fromSt = buildBloquesFromSubtarea(st);
                                    return fromSt.map((b, i) => ({
                                      ...b,
                                      trabajo_realizar: prev[i]?.trabajo_realizar ?? b.trabajo_realizar,
                                      medidas_especificaciones: prev[i]?.medidas_especificaciones ?? b.medidas_especificaciones
                                    }));
                                  });
                                }
                                e.target.value = '';
                              } catch (err) { setError(formatApiError(err.response?.data?.detail) || 'Error al subir foto'); }
                            }}
                          />
                        </Button>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Producto {idx + 1}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Trabajo a realizar"
                        multiline
                        rows={3}
                        value={bloque.trabajo_realizar}
                        onChange={(e) => setBloquesSubtarea(prev => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], trabajo_realizar: e.target.value };
                          return next;
                        })}
                        placeholder="Describe el trabajo a realizar"
                        sx={{ mb: 1.5 }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Medidas y especificaciones"
                        multiline
                        rows={2}
                        value={bloque.medidas_especificaciones}
                        onChange={(e) => setBloquesSubtarea(prev => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], medidas_especificaciones: e.target.value };
                          return next;
                        })}
                        placeholder="Medidas, especificaciones, tolerancias"
                      />
                    </Box>
                  </Paper>
                ))}

                <Button size="small" variant="outlined" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => setBloquesSubtarea(prev => [...prev, { url: '', trabajo_realizar: '', medidas_especificaciones: '' }])}>
                  Agregar otro producto
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Button
                    variant="contained"
                    disabled={guardandoSubtarea}
                    onClick={async () => {
                      if (!subtareaDetalle?.id) return;
                      setGuardandoSubtarea(true);
                      try {
                        const descripcion = buildDescripcionFromBloques(bloquesSubtarea) || null;
                        await ordenesAPI.updateSubtarea(subtareaDetalle.id, { descripcion: descripcion || '' });
                        const data = await refreshOrdenDetalle();
                        const st = (data?.subtareas || []).find(s => s.id === subtareaDetalle.id);
                        if (st) setSubtareaDetalle(st);
                        setError('');
                      } catch (err) {
                        setError(formatApiError(err.response?.data?.detail) || 'Error al guardar');
                      } finally {
                        setGuardandoSubtarea(false);
                      }
                    }}
                  >
                    {guardandoSubtarea ? 'Guardando…' : 'Guardar descripción'}
                  </Button>
                </Box>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenSubtareaDetalleDialog(false); setSubtareaDetalle(null); setBloquesSubtarea([]); }}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default DashboardTaller;
