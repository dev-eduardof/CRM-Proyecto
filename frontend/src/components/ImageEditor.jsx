import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Typography,
  Paper,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Brush as BrushIcon,
  Create as PenIcon
} from '@mui/icons-material';

const ImageEditor = ({ open, onClose, imageUrl, onSave }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!open || !imageUrl) return;
    
    console.log('ImageEditor abierto con URL:', imageUrl?.substring(0, 50));
    
    // Reset del estado
    setIsDrawing(false);
    setHistory([]);
    setHistoryStep(-1);
    setCanvasSize({ width: 0, height: 0 });
    setLoadError(false);
    
    const loadImage = () => {
      if (!canvasRef.current) {
        console.log('⏳ Canvas no disponible aún, reintentando...');
        setTimeout(loadImage, 50);
        return;
      }
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Solo usar crossOrigin para URLs externas, no para data URLs
      if (!imageUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.onload = () => {
        console.log('✅ Imagen cargada exitosamente:', img.width, 'x', img.height);
        
        // Calcular tamaño manteniendo aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        setCanvasSize({ width, height });

        // Limpiar canvas y dibujar imagen
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);
        
        // Guardar estado inicial
        const initialState = canvas.toDataURL();
        setHistory([initialState]);
        setHistoryStep(0);
        
        console.log('✅ Canvas configurado:', width, 'x', height);
      };
      
      img.onerror = (error) => {
        console.error('❌ Error al cargar la imagen:', error);
        console.error('URL de la imagen:', imageUrl?.substring(0, 100));
        setLoadError(true);
      };
      
      console.log('🔄 Iniciando carga de imagen...');
      img.src = imageUrl;
    };
    
    // Iniciar carga con un pequeño delay
    setTimeout(loadImage, 50);
    
  }, [open, imageUrl]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      
      img.src = history[historyStep - 1];
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      
      img.src = history[historyStep + 1];
      setHistoryStep(historyStep + 1);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      saveToHistory();
    };
    
    img.src = history[0];
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];

    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.touches ? getTouchPos(e) : getMousePos(e);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = e.touches ? getTouchPos(e) : getMousePos(e);

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    if (e) e.preventDefault();
    setIsDrawing(false);
    saveToHistory();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' });
      onSave(file, canvas.toDataURL());
      onClose();
    }, 'image/jpeg', 0.95);
  };

  const colors = [
    '#FF0000', // Rojo
    '#00FF00', // Verde
    '#0000FF', // Azul
    '#FFFF00', // Amarillo
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFFFFF', // Blanco
    '#000000'  // Negro
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Editar Imagen</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={2}>
          {/* Barra de Herramientas */}
          <Paper sx={{ p: 2 }}>
            <Stack spacing={2}>
              {/* Herramientas de Dibujo */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <ToggleButtonGroup
                  value={tool}
                  exclusive
                  onChange={(e, newTool) => newTool && setTool(newTool)}
                  size="small"
                >
                  <ToggleButton value="pen">
                    <PenIcon />
                  </ToggleButton>
                  <ToggleButton value="brush">
                    <BrushIcon />
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Acciones */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    onClick={undo} 
                    disabled={historyStep <= 0}
                    size="small"
                    title="Deshacer"
                  >
                    <UndoIcon />
                  </IconButton>
                  <IconButton 
                    onClick={redo} 
                    disabled={historyStep >= history.length - 1}
                    size="small"
                    title="Rehacer"
                  >
                    <RedoIcon />
                  </IconButton>
                  <IconButton 
                    onClick={clearCanvas}
                    size="small"
                    color="error"
                    title="Limpiar dibujos"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Colores */}
              <Box>
                <Typography variant="caption" gutterBottom>
                  Color:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {colors.map((c) => (
                    <Box
                      key={c}
                      onClick={() => setColor(c)}
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: c,
                        border: color === c ? '3px solid #1976d2' : '2px solid #ccc',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.2s'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Grosor de Línea */}
              <Box>
                <Typography variant="caption" gutterBottom>
                  Grosor: {lineWidth}px
                </Typography>
                <Slider
                  value={lineWidth}
                  onChange={(e, value) => setLineWidth(value)}
                  min={1}
                  max={20}
                  step={1}
                  sx={{ maxWidth: 300 }}
                />
              </Box>
            </Stack>
          </Paper>

          {/* Canvas */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              minHeight: 400,
              position: 'relative'
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                border: '2px solid #ccc',
                cursor: 'crosshair',
                touchAction: 'none',
                maxWidth: '100%',
                height: 'auto',
                display: canvasSize.width > 0 ? 'block' : 'none',
                backgroundColor: 'white'
              }}
            />
            {loadError && (
              <Box sx={{ textAlign: 'center', position: 'absolute' }}>
                <Typography color="error" gutterBottom>
                  Error al cargar la imagen
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Verifica la consola del navegador para más detalles
                </Typography>
              </Box>
            )}
            {!loadError && canvasSize.width === 0 && (
              <Box sx={{ textAlign: 'center', position: 'absolute' }}>
                <Typography color="text.secondary" gutterBottom>
                  Cargando imagen...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Abre la consola del navegador (F12) para ver el progreso
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          startIcon={<SaveIcon />}
        >
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageEditor;
