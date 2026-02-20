import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  Grid
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Build as BuildIcon,
  Backspace as BackspaceIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginTecnico } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [codigoTecnico, setCodigoTecnico] = useState('');
  const [showPanelTecnico, setShowPanelTecnico] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prevCodigoLengthRef = useRef(0);

  const handleChange = (e) => {
    const value = e.target.name === 'username' 
      ? e.target.value.toLowerCase() 
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    setError('');
  };

  const handleCodigoChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCodigoTecnico(v);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(formData.username, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleSubmitTecnico = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (codigoTecnico.length !== 4) {
      setError('Ingresa tu código de 4 dígitos');
      return;
    }
    setLoading(true);
    setError('');
    const result = await loginTecnico(codigoTecnico);
    if (result.success) {
      navigate('/dashboard-taller');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const agregarDigito = (d) => {
    if (codigoTecnico.length >= 4) return;
    setCodigoTecnico((prev) => prev + d);
    setError('');
  };
  const borrarDigito = () => {
    setCodigoTecnico((prev) => prev.slice(0, -1));
    setError('');
  };

  // Teclado físico: dígitos 0-9 y Backspace cuando el panel técnico está visible
  useEffect(() => {
    if (!showPanelTecnico) return;
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        setCodigoTecnico((prev) => (prev.length >= 4 ? prev : prev + e.key));
        setError('');
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        setCodigoTecnico((prev) => prev.slice(0, -1));
        setError('');
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPanelTecnico]);

  // Al completar el cuarto dígito, enviar login automáticamente (no hace falta pulsar Entrar)
  useEffect(() => {
    if (!showPanelTecnico || loading) return;
    const len = codigoTecnico.length;
    if (len === 4 && prevCodigoLengthRef.current === 3) {
      handleSubmitTecnico();
    }
    prevCodigoLengthRef.current = len;
  }, [showPanelTecnico, codigoTecnico, loading]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              CRM Talleres
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sistema de Gestión de Talleres
            </Typography>
          </Box>

          {!showPanelTecnico ? (
            <>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Usuario"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  margin="normal"
                  required
                  autoFocus
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Contraseña"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
              <Divider sx={{ my: 2 }} />
              <Button
                fullWidth
                variant="outlined"
                size="large"
                disabled={loading}
                startIcon={<BuildIcon />}
                onClick={() => { setShowPanelTecnico(true); setError(''); setCodigoTecnico(''); }}
              >
                Inicio sesión para técnicos
              </Button>
            </>
          ) : (
            <>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                Ingresa tu código de 4 dígitos
              </Typography>
              {/* Display del código: no se muestran los dígitos (privado), solo indicador • por cada dígito */}
              <Box
                sx={{
                  py: 2,
                  px: 2,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                  textAlign: 'center',
                  border: '2px solid',
                  borderColor: codigoTecnico.length === 4 ? 'primary.main' : 'grey.300'
                }}
              >
                <Typography variant="h4" component="span" sx={{ letterSpacing: '0.5em', fontFamily: 'monospace' }}>
                  {'•'.repeat(codigoTecnico.length) + '·'.repeat(4 - codigoTecnico.length)}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Puedes usar el panel o el teclado
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}
              {/* Panel numérico */}
              <Grid container spacing={1} sx={{ mb: 2 }} justifyContent="center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <Grid item xs={4} key={n}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      disabled={loading || codigoTecnico.length >= 4}
                      onClick={() => agregarDigito(String(n))}
                      sx={{ minHeight: 56, fontSize: '1.25rem' }}
                    >
                      {n}
                    </Button>
                  </Grid>
                ))}
                <Grid item xs={4} />
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    disabled={loading || codigoTecnico.length >= 4}
                    onClick={() => agregarDigito('0')}
                    sx={{ minHeight: 56, fontSize: '1.25rem' }}
                  >
                    0
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    size="large"
                    disabled={loading || codigoTecnico.length === 0}
                    onClick={borrarDigito}
                    sx={{ minHeight: 56 }}
                  >
                    <BackspaceIcon />
                  </Button>
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || codigoTecnico.length !== 4}
                startIcon={loading ? <CircularProgress size={20} /> : <BuildIcon />}
                onClick={() => handleSubmitTecnico()}
                sx={{ mb: 2 }}
              >
                {loading ? 'Entrando...' : 'Entrar al dashboard de trabajo'}
              </Button>
              <Button
                fullWidth
                variant="text"
                size="small"
                disabled={loading}
                onClick={() => { setShowPanelTecnico(false); setError(''); setCodigoTecnico(''); }}
              >
                Volver al inicio de sesión normal
              </Button>
            </>
          )}

          {!showPanelTecnico && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" display="block" gutterBottom>
                <strong>Credenciales de prueba:</strong>
              </Typography>
              <Typography variant="caption" display="block">
                Usuario: <strong>admin</strong> — Contraseña: <strong>admin123</strong>
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
