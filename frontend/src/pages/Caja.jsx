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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  AttachMoney as AttachMoneyIcon,
  MoneyOff as MoneyOffIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { cajaAPI, ordenesAPI } from '../services/api';

const today = () => new Date().toISOString().slice(0, 10);

const Caja = () => {
  const [tab, setTab] = useState(0);
  const [movimientos, setMovimientos] = useState([]);
  const [cortes, setCortes] = useState([]);
  const [resumenDia, setResumenDia] = useState(null);
  const [ordenesList, setOrdenesList] = useState([]);
  const [analisisOrden, setAnalisisOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fechaFiltro, setFechaFiltro] = useState(today());
  const [fechaCorte, setFechaCorte] = useState(today());
  const [openMovDialog, setOpenMovDialog] = useState(false);
  const [movTipo, setMovTipo] = useState('ENTRADA');
  const [formMov, setFormMov] = useState({
    fecha: today(),
    concepto: '',
    monto: '',
    orden_trabajo_id: ''
  });
  const [ordenIdAnalisis, setOrdenIdAnalisis] = useState('');
  const [creandoCorte, setCreandoCorte] = useState(false);
  const [openAperturaDialog, setOpenAperturaDialog] = useState(false);
  const [montoApertura, setMontoApertura] = useState('');
  const [guardandoApertura, setGuardandoApertura] = useState(false);

  const loadMovimientos = async () => {
    try {
      const res = await cajaAPI.getMovimientos({
        fecha_desde: fechaFiltro,
        fecha_hasta: fechaFiltro,
        limit: 300
      });
      setMovimientos(res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar movimientos');
      setMovimientos([]);
    }
  };

  const loadCortes = async () => {
    try {
      const res = await cajaAPI.getCortes({ limit: 100 });
      setCortes(res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar cortes');
      setCortes([]);
    }
  };

  const loadResumenDia = async () => {
    try {
      const res = await cajaAPI.getResumenDia(fechaCorte);
      setResumenDia(res.data || null);
    } catch (err) {
      // Fallback para que siempre se muestre algo (resumen en 0)
      setResumenDia({
        fecha: fechaCorte,
        saldo_inicial: 0,
        total_entradas: 0,
        total_salidas: 0,
        saldo_final: 0,
        tiene_apertura: false
      });
    }
  };

  const loadOrdenes = async () => {
    try {
      const res = await ordenesAPI.getAll({ limit: 500 });
      setOrdenesList(res.data || []);
    } catch (e) {
      setOrdenesList([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadMovimientos(), loadCortes(), loadResumenDia()]).finally(() => setLoading(false));
  }, [fechaFiltro, fechaCorte, tab]);

  // Al cargar: si es el día de hoy y no hay apertura ni cierre, pedir apertura de caja (cuánto hay en caja hoy)
  useEffect(() => {
    if (loading || fechaCorte !== today()) return;
    const hayCierreHoy = (cortes || []).some((c) => c.fecha === today() && c.tipo === 'CIERRE_DIA');
    const sinApertura = !resumenDia || resumenDia.tiene_apertura === false;
    if (sinApertura && !hayCierreHoy) setOpenAperturaDialog(true);
  }, [loading, resumenDia, cortes, fechaCorte]);

  useEffect(() => {
    if (tab === 3) loadOrdenes();
  }, [tab]);

  const handleOpenMov = (tipo) => {
    setMovTipo(tipo);
    setFormMov({
      fecha: today(),
      concepto: tipo === 'ENTRADA' ? 'Pago entrega OT' : 'Caja chica',
      monto: '',
      orden_trabajo_id: ''
    });
    if (tipo === 'ENTRADA' && ordenesList.length === 0) loadOrdenes();
    setOpenMovDialog(true);
  };

  const handleSaveMov = async () => {
    if (!formMov.concepto?.trim() || !formMov.monto || Number(formMov.monto) <= 0) {
      setError('Concepto y monto son requeridos');
      return;
    }
    try {
      await cajaAPI.createMovimiento({
        fecha: formMov.fecha,
        tipo: movTipo,
        concepto: formMov.concepto.trim(),
        monto: Number(formMov.monto),
        orden_trabajo_id: formMov.orden_trabajo_id ? Number(formMov.orden_trabajo_id) : null
      });
      setSuccess(movTipo === 'ENTRADA' ? 'Entrada registrada' : 'Salida registrada');
      setOpenMovDialog(false);
      loadMovimientos();
      loadResumenDia();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar');
    }
  };

  const handleCorte = async (tipo) => {
    setCreandoCorte(true);
    try {
      await cajaAPI.createCorte({ fecha: fechaCorte, tipo });
      setSuccess(tipo === 'CIERRE_DIA' ? 'Cierre del día realizado. Corte de caja guardado.' : 'Corte caja chica registrado');
      loadCortes();
      loadResumenDia();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al realizar corte');
    } finally {
      setCreandoCorte(false);
    }
  };

  const handleSaveApertura = async () => {
    const monto = Number(montoApertura);
    if (monto < 0 || !montoApertura.trim()) {
      setError('Indique el monto con el que abre caja hoy');
      return;
    }
    setGuardandoApertura(true);
    try {
      await cajaAPI.createApertura({ fecha: today(), monto });
      setSuccess('Apertura de caja registrada');
      setOpenAperturaDialog(false);
      setMontoApertura('');
      loadResumenDia();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar apertura');
    } finally {
      setGuardandoApertura(false);
    }
  };

  const loadAnalisis = async () => {
    if (!ordenIdAnalisis) return;
    try {
      const res = await cajaAPI.getAnalisisOrden(Number(ordenIdAnalisis));
      setAnalisisOrden(res.data);
      setError('');
    } catch (err) {
      setAnalisisOrden(null);
      setError(err.response?.data?.detail || 'Error al cargar análisis');
    }
  };

  const formatMoney = (n) => (n != null ? `$${Number(n).toFixed(2)}` : '-');

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon /> Sistemas de caja
          </Typography>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>{success}</Alert>}

        {loading && movimientos.length === 0 && cortes.length === 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
            <CircularProgress size={28} />
            <Typography color="text.secondary">Cargando caja…</Typography>
          </Box>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Movimientos" icon={<ReceiptIcon />} iconPosition="start" />
          <Tab label="Corte del día" icon={<AttachMoneyIcon />} iconPosition="start" />
          <Tab label="Cortes realizados" icon={<MoneyOffIcon />} iconPosition="start" />
          <Tab label="Análisis por OT" icon={<AssessmentIcon />} iconPosition="start" />
        </Tabs>

        {tab === 0 && (
          <>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                type="date"
                label="Fecha"
                value={fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => handleOpenMov('ENTRADA')}>
                Registrar entrada
              </Button>
              <Button variant="outlined" color="warning" startIcon={<MoneyOffIcon />} onClick={() => handleOpenMov('SALIDA')}>
                Registrar salida (caja chica)
              </Button>
              <Button size="small" startIcon={<RefreshIcon />} onClick={() => { loadMovimientos(); loadResumenDia(); }}>Actualizar</Button>
            </Box>
            <TableContainer component={Paper}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Concepto</TableCell>
                      <TableCell>OT</TableCell>
                      <TableCell align="right">Monto</TableCell>
                      <TableCell>Registrado por</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movimientos.length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center">Sin movimientos en esta fecha</TableCell></TableRow>
                    ) : (
                      movimientos.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.fecha}</TableCell>
                          <TableCell><Chip label={m.tipo} size="small" color={m.tipo === 'ENTRADA' ? 'success' : 'warning'} /></TableCell>
                          <TableCell>{m.concepto}</TableCell>
                          <TableCell>{m.folio_orden || '-'}</TableCell>
                          <TableCell align="right">{m.tipo === 'ENTRADA' ? '+' : '-'}{formatMoney(m.monto)}</TableCell>
                          <TableCell>{m.usuario_nombre || '-'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </>
        )}

        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                size="small"
                type="date"
                label="Fecha"
                value={fechaCorte}
                onChange={(e) => setFechaCorte(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button size="small" startIcon={<RefreshIcon />} onClick={loadResumenDia}>Actualizar resumen</Button>
            </Box>
            {resumenDia && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Card><CardContent><Typography color="text.secondary">Saldo inicial</Typography><Typography variant="h6">{formatMoney(resumenDia.saldo_inicial)}</Typography></CardContent></Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}><CardContent><Typography>Total entradas</Typography><Typography variant="h6">{formatMoney(resumenDia.total_entradas)}</Typography></CardContent></Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}><CardContent><Typography>Total salidas</Typography><Typography variant="h6">{formatMoney(resumenDia.total_salidas)}</Typography></CardContent></Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card><CardContent><Typography color="text.secondary">Saldo final</Typography><Typography variant="h6">{formatMoney(resumenDia.saldo_final)}</Typography></CardContent></Card>
                </Grid>
              </Grid>
            )}
            <Alert severity="info" sx={{ mb: 2 }}>
              Para cerrar el día debe realizar el <strong>corte de caja</strong> con el botón &quot;Cierre del día&quot;. Se guardará el resumen de entradas y salidas.
            </Alert>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" disabled={creandoCorte} onClick={() => handleCorte('CAJA_CHICA')}>Corte caja chica (parcial)</Button>
              <Button variant="contained" color="primary" disabled={creandoCorte} onClick={() => handleCorte('CIERRE_DIA')}>Cierre del día (corte de caja)</Button>
            </Box>
          </Box>
        )}

        {tab === 2 && (
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Saldo inicial</TableCell>
                    <TableCell align="right">Entradas</TableCell>
                    <TableCell align="right">Salidas</TableCell>
                    <TableCell align="right">Saldo final</TableCell>
                    <TableCell>Cerrado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cortes.length === 0 ? (
                    <TableRow><TableCell colSpan={7} align="center">No hay cortes registrados</TableCell></TableRow>
                  ) : (
                    cortes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.fecha}</TableCell>
                        <TableCell><Chip label={c.tipo === 'CIERRE_DIA' ? 'Cierre día' : 'Caja chica'} size="small" /></TableCell>
                        <TableCell align="right">{formatMoney(c.saldo_inicial)}</TableCell>
                        <TableCell align="right">{formatMoney(c.total_entradas)}</TableCell>
                        <TableCell align="right">{formatMoney(c.total_salidas)}</TableCell>
                        <TableCell align="right">{formatMoney(c.saldo_final)}</TableCell>
                        <TableCell>{c.cerrado_at ? new Date(c.cerrado_at).toLocaleString() : '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        )}

        {tab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <TextField
                select
                size="small"
                label="Orden de trabajo"
                value={ordenIdAnalisis}
                onChange={(e) => setOrdenIdAnalisis(e.target.value)}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">Seleccionar OT...</MenuItem>
                {ordenesList.map((o) => (
                  <MenuItem key={o.id} value={o.id}>{o.folio} — {o.cliente_nombre || 'Sin cliente'}</MenuItem>
                ))}
              </TextField>
              <Button variant="contained" disabled={!ordenIdAnalisis} onClick={loadAnalisis}>Ver análisis</Button>
            </Box>
            {analisisOrden && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>OT {analisisOrden.folio} — {analisisOrden.cliente_nombre || 'Sin cliente'}</Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}><Card variant="outlined"><CardContent><Typography color="text.secondary">Total gastos</Typography><Typography variant="h6" color="error">{formatMoney(analisisOrden.total_gastos)}</Typography></CardContent></Card></Grid>
                  <Grid item xs={4}><Card variant="outlined"><CardContent><Typography color="text.secondary">Total ingresos (caja)</Typography><Typography variant="h6" color="success.main">{formatMoney(analisisOrden.total_ingresos_caja)}</Typography></CardContent></Card></Grid>
                  <Grid item xs={4}><Card variant="outlined"><CardContent><Typography color="text.secondary">Diferencia (ingresos − gastos)</Typography><Typography variant="h6">{formatMoney(analisisOrden.diferencia)}</Typography></CardContent></Card></Grid>
                </Grid>
                <Typography variant="subtitle2" gutterBottom>Gastos de la OT</Typography>
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead><TableRow><TableCell>Descripción</TableCell><TableCell>Fecha</TableCell><TableCell align="right">Monto</TableCell></TableRow></TableHead>
                  <TableBody>
                    {analisisOrden.gastos?.length === 0 ? <TableRow><TableCell colSpan={3}>Sin gastos</TableCell></TableRow> : (analisisOrden.gastos || []).map((g) => (
                      <TableRow key={g.id}><TableCell>{g.descripcion}</TableCell><TableCell>{g.fecha_gasto}</TableCell><TableCell align="right">{formatMoney(g.monto)}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Typography variant="subtitle2" gutterBottom>Ingresos en caja (pagos)</Typography>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Concepto</TableCell><TableCell>Fecha</TableCell><TableCell align="right">Monto</TableCell></TableRow></TableHead>
                  <TableBody>
                    {analisisOrden.ingresos?.length === 0 ? <TableRow><TableCell colSpan={3}>Sin ingresos registrados</TableCell></TableRow> : (analisisOrden.ingresos || []).map((m) => (
                      <TableRow key={m.id}><TableCell>{m.concepto}</TableCell><TableCell>{m.fecha}</TableCell><TableCell align="right">{formatMoney(m.monto)}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Box>
        )}

        {/* Diálogo apertura de caja: cuánto hay en caja al iniciar el día */}
        <Dialog open={openAperturaDialog} onClose={() => setOpenAperturaDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Apertura de caja</DialogTitle>
          <DialogContent>
            <Typography sx={{ mt: 1, mb: 2 }} color="text.secondary">
              Indique con cuánto abre caja hoy (caja chica o monto inicial en caja).
            </Typography>
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              label="Monto en caja hoy"
              value={montoApertura}
              onChange={(e) => setMontoApertura(e.target.value)}
              size="small"
              required
              placeholder="0.00"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAperturaDialog(false)}>Cerrar</Button>
            <Button variant="contained" disabled={guardandoApertura} onClick={handleSaveApertura}>
              {guardandoApertura ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openMovDialog} onClose={() => setOpenMovDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{movTipo === 'ENTRADA' ? 'Registrar entrada (pago)' : 'Registrar salida (caja chica)'}</DialogTitle>
          <DialogContent>
            <TextField fullWidth type="date" label="Fecha" value={formMov.fecha} onChange={(e) => setFormMov({ ...formMov, fecha: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} size="small" />
            <TextField fullWidth label="Concepto" value={formMov.concepto} onChange={(e) => setFormMov({ ...formMov, concepto: e.target.value })} sx={{ mt: 2 }} size="small" placeholder={movTipo === 'ENTRADA' ? 'Ej: Pago entrega OT FOL-2025-001' : 'Ej: Materiales oficina'} />
            {movTipo === 'ENTRADA' && (
              <TextField select fullWidth label="Orden de trabajo (opcional)" value={formMov.orden_trabajo_id} onChange={(e) => setFormMov({ ...formMov, orden_trabajo_id: e.target.value })} sx={{ mt: 2 }} size="small">
                <MenuItem value="">Ninguna</MenuItem>
                {ordenesList.map((o) => (<MenuItem key={o.id} value={o.id}>{o.folio} — {o.cliente_nombre || ''}</MenuItem>))}
              </TextField>
            )}
            <TextField fullWidth type="number" inputProps={{ min: 0.01, step: 0.01 }} label="Monto" value={formMov.monto} onChange={(e) => setFormMov({ ...formMov, monto: e.target.value })} sx={{ mt: 2 }} size="small" required />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenMovDialog(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveMov}>Guardar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Caja;
