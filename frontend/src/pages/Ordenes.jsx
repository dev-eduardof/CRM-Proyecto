import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
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
  Alert,
  Tabs,
  Tab,
  Grid,
  MenuItem,
  Tooltip,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  ButtonGroup,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  CameraAlt as CameraIcon,
  Image as ImageIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import ImageEditor from '../components/ImageEditor';
import { ordenesAPI, clientesAPI, usersAPI, sucursalesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** Misma lógica que "Detalles de la Orden": bloques de descripción + lista de fotos + URL. */
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

const Ordenes = () => {
  const { user } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [estatusFilter, setEstatusFilter] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Modal states
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEstadoDialog, setOpenEstadoDialog] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Foto states - Múltiples secciones (foto + información)
  const [seccionesFotos, setSeccionesFotos] = useState([{
    id: Date.now(),
    foto: null,
    preview: null,
    trabajo_realizar: '',
    medidas_especificaciones: ''
  }]);
  // Al editar: bloques existentes (foto + texto editable) para mostrar como en Detalles
  const [seccionesExistentes, setSeccionesExistentes] = useState([]);
  const lastInitializedOrdenIdRef = useRef(null);
  const [fotoSalida, setFotoSalida] = useState(null);
  const [fotoSalidaPreview, setFotoSalidaPreview] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentFotoType, setCurrentFotoType] = useState('');
  const [currentSeccionIndex, setCurrentSeccionIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [openImageEditor, setOpenImageEditor] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState(null);
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  
  // Cliente nuevo states
  const [esClienteNuevo, setEsClienteNuevo] = useState(false);
  const [nuevoClienteData, setNuevoClienteData] = useState({
    nombre: '',
    apellido_paterno: '',
    telefono: ''
  });
  
  // Sucursal nueva states
  const [openSucursalDialog, setOpenSucursalDialog] = useState(false);
  const [nuevaSucursalData, setNuevaSucursalData] = useState({
    nombre_sucursal: '',
    codigo_sucursal: '',
    telefono: '',
    nombre_contacto: '',
    calle: '',
    numero_exterior: '',
    colonia: '',
    ciudad: '',
    estado: ''
  });
  
  // Form data
  const [formData, setFormData] = useState({
    cliente_id: '',
    sucursal_id: '',
    categoria_id: '',
    subcategoria_id: '',
    tecnico_asignado_id: '',
    descripcion: '',
    observaciones: '',
    nombre_contacto_notificacion: '',
    telefono_contacto_notificacion: '',
    tipo_permiso: '',
    numero_permiso: '',
    precio_estimado: '',
    anticipo: '0.00',
    precio_final: '',
    estatus: 'RECIBIDO',
    prioridad: 'NORMAL',
    fecha_promesa: ''
  });

  const [cambioEstado, setCambioEstado] = useState({
    estatus: '',
    observaciones: ''
  });

  const estados = [
    { value: 'RECIBIDO', label: 'Recibido', color: 'info' },
    { value: 'DIAGNOSTICO', label: 'Diagnóstico', color: 'warning' },
    { value: 'EN_ESPERA', label: 'En Espera', color: 'default' },
    { value: 'PROCESO', label: 'En Proceso', color: 'primary' },
    { value: 'PAUSA', label: 'Pausado', color: 'warning' },
    { value: 'REVISION', label: 'Revisión', color: 'info' },
    { value: 'TERMINADO', label: 'Terminado', color: 'success' },
    { value: 'ENTREGADO', label: 'Entregado', color: 'success' },
    { value: 'FINALIZADO', label: 'Finalizado', color: 'default' }
  ];

  const prioridades = [
    { value: 'NORMAL', label: 'Normal', color: 'default' },
    { value: 'URGENTE', label: 'Urgente', color: 'error' }
  ];

  const tiposPermiso = [
    { value: '', label: 'Sin permiso' },
    { value: 'COTIZACION', label: 'Cotización' },
    { value: 'ORDEN_COMPRA', label: 'Orden de Compra' },
    { value: 'REQUISICION', label: 'Requisición' },
    { value: 'SERVICIO_DIRECTO', label: 'Servicio Directo' }
  ];

  // Función para generar número de permiso automáticamente
  const generarNumeroPermiso = (tipoPermiso) => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const timestamp = String(fecha.getTime()).slice(-6); // Últimos 6 dígitos del timestamp
    
    const prefijos = {
      'COTIZACION': 'COT',
      'ORDEN_COMPRA': 'OC',
      'REQUISICION': 'REQ',
      'SERVICIO_DIRECTO': 'SD'
    };
    
    const prefijo = prefijos[tipoPermiso] || 'DOC';
    return `${prefijo}-${año}${mes}${dia}-${timestamp}`;
  };

  useEffect(() => {
    fetchOrdenes();
    fetchClientes();
    // Solo ADMIN y RECEPCION pueden asignar técnico; TECNICO no llama a la API de usuarios para evitar 403
    if (user?.rol === 'ADMIN' || user?.rol === 'RECEPCION') {
      fetchTecnicos();
    }
    fetchCategorias();
  }, [estatusFilter, user?.rol]);

  // Al abrir Editar: cargar orden completa y lista de fotos (misma lógica que Detalles/Ver)
  useEffect(() => {
    if (!openDialog || !isEditing || !selectedOrden?.id) return;
    const yaTieneFotos = Array.isArray(selectedOrden.fotos_entrada_list) || selectedOrden.foto_entrada;
    if (yaTieneFotos) return;
    let cancelled = false;
    const ordenId = selectedOrden.id;
    ordenesAPI.getById(ordenId)
      .then((res) => {
        if (cancelled || !res?.data) return;
        const orden = res.data;
        return ordenesAPI.getFotos(ordenId)
          .then((fotosRes) => {
            if (cancelled) return;
            const list = fotosRes?.data?.fotos_entrada_list;
            if (Array.isArray(list)) orden.fotos_entrada_list = list;
            setSelectedOrden(orden);
          })
          .catch(() => setSelectedOrden(orden));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [openDialog, isEditing, selectedOrden?.id]);

  // Inicializar secciones existentes (editable) con la misma lógica que Detalles de la Orden
  useEffect(() => {
    if (!openDialog || !isEditing || !selectedOrden?.id) return;
    const { fotosEntrada, numBloques, buildFotoUrl } = getBloquesFotosDetalle(selectedOrden);
    if (numBloques === 0) return;
    if (lastInitializedOrdenIdRef.current === selectedOrden.id) return;
    lastInitializedOrdenIdRef.current = selectedOrden.id;
    const textos = parsearDescripcionBloques(selectedOrden.descripcion || '');
    const secciones = Array.from({ length: numBloques }, (_, idx) => ({
      id: `existente-${selectedOrden.id}-${idx}`,
      url: fotosEntrada[idx] || '',
      trabajo_realizar: textos[idx]?.trabajo_realizar ?? '',
      medidas_especificaciones: textos[idx]?.medidas_especificaciones ?? ''
    }));
    setSeccionesExistentes(secciones);
  }, [openDialog, isEditing, selectedOrden?.id, selectedOrden?.descripcion, selectedOrden?.fotos_entrada_list, selectedOrden?.foto_entrada]);

  // Generar número de permiso automáticamente cuando se selecciona el tipo
  useEffect(() => {
    if (formData.tipo_permiso && !isEditing) {
      const numeroGenerado = generarNumeroPermiso(formData.tipo_permiso);
      setFormData(prev => ({ ...prev, numero_permiso: numeroGenerado }));
    } else if (!formData.tipo_permiso) {
      setFormData(prev => ({ ...prev, numero_permiso: '' }));
    }
  }, [formData.tipo_permiso, isEditing]);

  // Formatear error de API (FastAPI devuelve detail como array en validación)
  const formatApiError = (detail) => {
    if (detail == null) return '';
    if (Array.isArray(detail)) {
      return detail.map(e => e.msg || e.loc?.join('.') || JSON.stringify(e)).join('. ') || 'Error de validación';
    }
    if (typeof detail === 'object') return JSON.stringify(detail);
    return String(detail);
  };

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (estatusFilter) params.estatus = estatusFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await ordenesAPI.getAll(params);
      setOrdenes(response.data);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || 'Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const response = await clientesAPI.getAll({ activo: true });
      setClientes(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setClientes([]);
    }
  };

  const fetchSucursales = async (clienteId) => {
    try {
      const response = await sucursalesAPI.getByCliente(clienteId);
      setSucursales(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Error al cargar sucursales:', err);
      setSucursales([]);
    }
  };

  const fetchTecnicos = async () => {
    try {
      const response = await usersAPI.getAll();
      const data = Array.isArray(response?.data) ? response.data : [];
      setTecnicos(data.filter(u => u.rol === 'TECNICO' && u.activo));
    } catch (err) {
      console.error('Error al cargar técnicos:', err);
      setTecnicos([]);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await ordenesAPI.getCategorias();
      setCategorias(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setCategorias([]);
    }
  };

  const fetchSubcategorias = async (categoriaId) => {
    try {
      const response = await ordenesAPI.getSubcategorias(categoriaId);
      setSubcategorias(response.data);
    } catch (err) {
      console.error('Error al cargar subcategorías:', err);
      setSubcategorias([]);
    }
  };

  const handleOpenDialog = (orden = null) => {
    if (orden) {
      setIsEditing(true);
      setSelectedOrden(orden);
      setFormData({
        cliente_id: orden.cliente_id || '',
        sucursal_id: orden.sucursal_id || '',
        categoria_id: orden.categoria_id || '',
        subcategoria_id: orden.subcategoria_id || '',
        tecnico_asignado_id: orden.tecnico_asignado_id || '',
        descripcion: orden.descripcion || '',
        observaciones: orden.observaciones || '',
        nombre_contacto_notificacion: orden.nombre_contacto_notificacion || '',
        telefono_contacto_notificacion: orden.telefono_contacto_notificacion || '',
        tipo_permiso: orden.tipo_permiso || '',
        numero_permiso: orden.numero_permiso || '',
        precio_estimado: orden.precio_estimado || '',
        anticipo: orden.anticipo || '0.00',
        precio_final: orden.precio_final || '',
        estatus: orden.estatus || 'RECIBIDO',
        prioridad: orden.prioridad || 'NORMAL',
        fecha_promesa: orden.fecha_promesa ? orden.fecha_promesa.split('.')[0] : ''
      });
      if (orden.categoria_id) {
        fetchSubcategorias(orden.categoria_id);
      }
      if (orden.cliente_id) {
        fetchSucursales(orden.cliente_id);
      }
    } else {
      setIsEditing(false);
      setSelectedOrden(null);
      setFormData({
        cliente_id: '',
        sucursal_id: '',
        categoria_id: '',
        subcategoria_id: '',
        tecnico_asignado_id: '',
        descripcion: '',
        observaciones: '',
        nombre_contacto_notificacion: '',
        telefono_contacto_notificacion: '',
        tipo_permiso: '',
        numero_permiso: '',
        precio_estimado: '',
        anticipo: '0.00',
        precio_final: '',
        estatus: 'RECIBIDO',
        prioridad: 'NORMAL',
        fecha_promesa: ''
      });
      setSubcategorias([]);
      setSucursales([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrden(null);
    setIsEditing(false);
    setSeccionesExistentes([]);
    lastInitializedOrdenIdRef.current = null;
    setSeccionesFotos([{
      id: Date.now(),
      foto: null,
      preview: null,
      trabajo_realizar: '',
      medidas_especificaciones: ''
    }]);
    setFotoSalida(null);
    setFotoSalidaPreview(null);
    setEsClienteNuevo(false);
    setNuevoClienteData({ nombre: '', apellido_paterno: '', telefono: '' });
    stopCamera();
  };

  // Parsear descripción para extraer Trabajo a Realizar y Medidas por bloque
  const parsearDescripcionBloques = (descripcion) => {
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

  const handleCategoriaChange = (categoriaId) => {
    setFormData({ ...formData, categoria_id: categoriaId, subcategoria_id: '' });
    if (categoriaId) {
      fetchSubcategorias(categoriaId);
    } else {
      setSubcategorias([]);
    }
  };

  const handleClienteChange = (clienteId) => {
    setFormData({ ...formData, cliente_id: clienteId, sucursal_id: '' });
    if (clienteId) {
      fetchSucursales(clienteId);
    } else {
      setSucursales([]);
    }
  };

  const handleOpenSucursalDialog = () => {
    setNuevaSucursalData({
      nombre_sucursal: '',
      codigo_sucursal: '',
      telefono: '',
      nombre_contacto: '',
      calle: '',
      numero_exterior: '',
      colonia: '',
      ciudad: '',
      estado: ''
    });
    setOpenSucursalDialog(true);
  };

  const handleCloseSucursalDialog = () => {
    setOpenSucursalDialog(false);
    setNuevaSucursalData({
      nombre_sucursal: '',
      codigo_sucursal: '',
      telefono: '',
      nombre_contacto: '',
      calle: '',
      numero_exterior: '',
      colonia: '',
      ciudad: '',
      estado: ''
    });
  };

  const handleCreateSucursal = async () => {
    try {
      if (!formData.cliente_id) {
        setError('Debes seleccionar un cliente primero');
        setTimeout(() => setError(''), 5000);
        return;
      }

      if (!nuevaSucursalData.nombre_sucursal || !nuevaSucursalData.telefono || !nuevaSucursalData.nombre_contacto) {
        setError('Por favor completa los campos obligatorios: Nombre de sucursal, Teléfono y Nombre de contacto');
        setTimeout(() => setError(''), 5000);
        return;
      }

      const sucursalData = {
        cliente_id: formData.cliente_id,
        nombre_sucursal: nuevaSucursalData.nombre_sucursal,
        codigo_sucursal: nuevaSucursalData.codigo_sucursal || null,
        telefono: nuevaSucursalData.telefono,
        calle: nuevaSucursalData.calle || null,
        numero_exterior: nuevaSucursalData.numero_exterior || null,
        colonia: nuevaSucursalData.colonia || null,
        ciudad: nuevaSucursalData.ciudad || null,
        estado: nuevaSucursalData.estado || null,
        activo: true
      };

      const response = await sucursalesAPI.create(sucursalData);
      
      // Actualizar la lista de sucursales
      await fetchSucursales(formData.cliente_id);
      
      // Seleccionar automáticamente la nueva sucursal
      setFormData({ 
        ...formData, 
        sucursal_id: response.data.id,
        nombre_contacto_notificacion: nuevaSucursalData.nombre_contacto,
        telefono_contacto_notificacion: nuevaSucursalData.telefono
      });
      
      setSuccess('Sucursal creada correctamente');
      handleCloseSucursalDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || 'Error al crear la sucursal');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleViewOrden = async (ordenId) => {
    try {
      const response = await ordenesAPI.getById(ordenId);
      const orden = response.data;
      // Asegurar lista completa de fotos para todos los roles (evitar diferencias por caché/serialización)
      try {
        const fotosRes = await ordenesAPI.getFotos(ordenId);
        const list = fotosRes?.data?.fotos_entrada_list;
        if (Array.isArray(list)) {
          orden.fotos_entrada_list = list;
        }
      } catch (_) {
        // Si falla el endpoint de fotos, se usa la lista del getById
      }
      setSelectedOrden(orden);
      setOpenViewDialog(true);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || 'Error al cargar la orden');
    }
  };

  const handleOpenEstadoDialog = (orden) => {
    setSelectedOrden(orden);
    setCambioEstado({
      estatus: orden.estatus,
      observaciones: ''
    });
    setOpenEstadoDialog(true);
  };

  const handleCambiarEstado = async () => {
    try {
      await ordenesAPI.cambiarEstado(selectedOrden.id, cambioEstado);
      setSuccess('Estado actualizado correctamente');
      setOpenEstadoDialog(false);
      fetchOrdenes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || 'Error al cambiar el estado');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleSubmit = async () => {
    try {
      let clienteId = formData.cliente_id;
      
      // Si es cliente nuevo, crearlo primero
      if (esClienteNuevo && !isEditing) {
        if (!nuevoClienteData.nombre || !nuevoClienteData.apellido_paterno || !nuevoClienteData.telefono) {
          setError('Por favor completa los datos del cliente nuevo');
          setTimeout(() => setError(''), 5000);
          return;
        }
        
        try {
          const clienteResponse = await clientesAPI.create({
            tipo_cliente: 'PERSONA_FISICA',
            nombre: nuevoClienteData.nombre,
            apellido_paterno: nuevoClienteData.apellido_paterno,
            telefono: nuevoClienteData.telefono,
            activo: true
          });
          clienteId = clienteResponse.data?.id;
          setSuccess('Cliente creado correctamente');
        } catch (clienteErr) {
          setError('Error al crear el cliente: ' + formatApiError(clienteErr.response?.data?.detail));
          setTimeout(() => setError(''), 5000);
          return;
        }
      }

      // Validar cliente seleccionado
      const idNum = clienteId === '' || clienteId == null ? null : Number(clienteId);
      if (idNum == null || isNaN(idNum)) {
        setError('Debes seleccionar un cliente');
        setTimeout(() => setError(''), 5000);
        return;
      }
      
      // Compilar información: al editar primero bloques existentes, luego nuevas secciones
      let descripcionCompleta = '';
      const agregarBloque = (numero, trabajo, medidas) => {
        if (trabajo || medidas) {
          descripcionCompleta += `\n=== PRODUCTO ${numero} ===\n`;
          if (trabajo) descripcionCompleta += `Trabajo a Realizar:\n${trabajo}\n\n`;
          if (medidas) descripcionCompleta += `Medidas y Especificaciones:\n${medidas}\n\n`;
        }
      };
      if (isEditing && seccionesExistentes.length > 0) {
        seccionesExistentes.forEach((sec, idx) => agregarBloque(idx + 1, sec.trabajo_realizar, sec.medidas_especificaciones));
      }
      const offset = isEditing ? seccionesExistentes.length : 0;
      seccionesFotos.forEach((seccion, index) => {
        agregarBloque(offset + index + 1, seccion.trabajo_realizar, seccion.medidas_especificaciones);
      });

      const descripcionFinal = (descripcionCompleta.trim() || formData.descripcion || '').trim();
      if (descripcionFinal.length < 10) {
        setError('La descripción del trabajo debe tener al menos 10 caracteres');
        setTimeout(() => setError(''), 5000);
        return;
      }

      const dataToSend = {
        ...formData,
        cliente_id: idNum,
        descripcion: descripcionFinal,
        precio_estimado: formData.precio_estimado ? parseFloat(formData.precio_estimado) : null,
        anticipo: parseFloat(formData.anticipo) || 0,
        precio_final: formData.precio_final ? parseFloat(formData.precio_final) : null,
        categoria_id: formData.categoria_id ? Number(formData.categoria_id) : null,
        subcategoria_id: formData.subcategoria_id ? Number(formData.subcategoria_id) : null,
        tecnico_asignado_id: formData.tecnico_asignado_id ? Number(formData.tecnico_asignado_id) : null,
        sucursal_id: formData.sucursal_id ? Number(formData.sucursal_id) : null
      };
      // En PUT no enviar fechas vacías como string; el backend espera null o datetime
      if (isEditing) {
        ['fecha_promesa', 'fecha_inicio_trabajo', 'fecha_terminado', 'fecha_entrega'].forEach((key) => {
          if (dataToSend[key] === '' || dataToSend[key] == null) dataToSend[key] = null;
        });
      }

      let ordenId = null;
      if (isEditing) {
        await ordenesAPI.update(selectedOrden.id, dataToSend);
        ordenId = selectedOrden.id;
        setSuccess('Orden actualizada correctamente');
      } else {
        const response = await ordenesAPI.create(dataToSend);
        ordenId = response?.data?.id;
        setSuccess('Orden creada correctamente');
      }

      // Subir fotos de entrada y salida (tanto al crear como al editar). Solo si es un File real.
      if (ordenId) {
        const fotosConArchivo = seccionesFotos.filter(s => s.foto && s.foto instanceof File);
        for (const seccion of fotosConArchivo) {
          await handleUploadFoto(ordenId, 'entrada', seccion.foto);
        }
        if (fotoSalida && fotoSalida instanceof File) {
          await handleUploadFoto(ordenId, 'salida', fotoSalida);
        }
      }
      
      handleCloseDialog();
      fetchOrdenes();
      fetchClientes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message || 'Error al guardar la orden');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleUploadFoto = async (ordenId, tipo, file) => {
    if (!file || !(file instanceof File)) return;
    try {
      const formData = new FormData();
      formData.append('file', file, file.name || `foto_${tipo}.jpg`);
      
      await ordenesAPI.uploadFoto(ordenId, tipo, formData);
    } catch (err) {
      console.error(`Error al subir foto de ${tipo}:`, err);
      setError(`Error al subir foto de ${tipo}: ${formatApiError(err.response?.data?.detail) || err.message}`);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (currentFotoType === 'entrada') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSeccionesFotos(prev => {
            const newSecciones = [...prev];
            newSecciones[currentSeccionIndex] = {
              ...newSecciones[currentSeccionIndex],
              foto: file,
              preview: reader.result
            };
            return newSecciones;
          });
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotoSalida(file);
          setFotoSalidaPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const startCamera = async (tipo, seccionIndex = 0) => {
    setCurrentFotoType(tipo);
    setCurrentSeccionIndex(seccionIndex);
    setShowCamera(true);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Usar cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setTimeout(() => setError(''), 5000);
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `foto_${currentFotoType}_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const preview = canvas.toDataURL('image/jpeg');
        
        if (currentFotoType === 'entrada') {
          setSeccionesFotos(prev => {
            const newSecciones = [...prev];
            newSecciones[currentSeccionIndex] = {
              ...newSecciones[currentSeccionIndex],
              foto: file,
              preview: preview
            };
            return newSecciones;
          });
        } else {
          setFotoSalida(file);
          setFotoSalidaPreview(preview);
        }
        
        stopCamera();
        setSuccess('Foto capturada correctamente');
        setTimeout(() => setSuccess(''), 3000);
      }, 'image/jpeg', 0.8);
    }
  };

  const removeFoto = (tipo, index = null) => {
    if (tipo === 'entrada') {
      if (index !== null) {
        setSeccionesFotos(prev => {
          const newSecciones = [...prev];
          newSecciones[index] = {
            ...newSecciones[index],
            foto: null,
            preview: null
          };
          return newSecciones;
        });
      }
    } else {
      setFotoSalida(null);
      setFotoSalidaPreview(null);
    }
  };

  const agregarSeccionFoto = () => {
    setSeccionesFotos(prev => [...prev, {
      id: Date.now(),
      foto: null,
      preview: null,
      trabajo_realizar: '',
      medidas_especificaciones: ''
    }]);
  };

  const eliminarSeccionFoto = (index) => {
    if (seccionesFotos.length > 1) {
      setSeccionesFotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const actualizarInfoSeccion = (index, field, value) => {
    setSeccionesFotos(prev => {
      const newSecciones = [...prev];
      newSecciones[index] = {
        ...newSecciones[index],
        [field]: value
      };
      return newSecciones;
    });
  };

  const actualizarSeccionExistente = (index, field, value) => {
    setSeccionesExistentes(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFotoChange = (seccionIndex) => {
    setCurrentSeccionIndex(seccionIndex);
    setCurrentFotoType('entrada');
    fileInputRef.current.click();
  };

  const handleEditImage = (seccionIndex) => {
    const seccion = seccionesFotos[seccionIndex];
    console.log('Editando imagen de sección:', seccionIndex);
    console.log('Sección:', seccion);
    console.log('Preview existe:', !!seccion.preview);
    console.log('Preview length:', seccion.preview?.length);
    
    if (seccion && seccion.preview) {
      setEditingImageUrl(seccion.preview);
      setEditingImageIndex(seccionIndex);
      setOpenImageEditor(true);
      console.log('Editor abierto con URL:', seccion.preview.substring(0, 50) + '...');
    } else {
      console.error('No hay preview disponible para esta sección');
    }
  };

  const handleSaveEditedImage = (file, preview) => {
    setSeccionesFotos(prev => {
      const newSecciones = [...prev];
      newSecciones[editingImageIndex] = {
        ...newSecciones[editingImageIndex],
        foto: file,
        preview: preview
      };
      return newSecciones;
    });
    setOpenImageEditor(false);
    setEditingImageUrl(null);
    setEditingImageIndex(null);
  };

  const handleDelete = async (ordenId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta orden? Solo se pueden eliminar órdenes en estado RECIBIDO.')) {
      return;
    }
    
    try {
      await ordenesAPI.delete(ordenId);
      setSuccess('Orden eliminada correctamente');
      fetchOrdenes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || 'Error al eliminar la orden');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getEstadoChip = (estatus) => {
    const estadoObj = estados.find(e => e.value === estatus);
    return (
      <Chip
        label={estadoObj?.label || estatus}
        color={estadoObj?.color || 'default'}
        size="small"
      />
    );
  };

  const getPrioridadChip = (prioridad) => {
    const prioridadObj = prioridades.find(p => p.value === prioridad);
    return (
      <Chip
        label={prioridadObj?.label || prioridad}
        color={prioridadObj?.color || 'default'}
        size="small"
      />
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrdenes = ordenes.filter(orden => {
    // No mostrar en el panel las órdenes ya finalizadas (ENTREGADO o FINALIZADO)
    if (['ENTREGADO', 'FINALIZADO'].includes(orden.estatus)) return false;
    const matchesSearch = searchTerm === '' || 
      orden.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const canEdit = user?.rol === 'ADMIN' || user?.rol === 'RECEPCION' || user?.rol === 'TECNICO';
  const canEditOrderForm = user?.rol === 'ADMIN' || user?.rol === 'RECEPCION'; // Técnico no puede editar datos de la orden
  const canDelete = user?.rol === 'ADMIN';
  const canCreate = user?.rol === 'ADMIN' || user?.rol === 'RECEPCION';

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Órdenes de Trabajo - Taller de Torno
          </Typography>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Nueva Orden
            </Button>
          )}
        </Box>

        {/* Mensaje para técnicos: solo ven sus órdenes asignadas */}
        {user?.rol === 'TECNICO' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Solo se muestran las órdenes asignadas a ti. No puedes ver órdenes de otros técnicos.
          </Alert>
        )}

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Buscar por folio, cliente o descripción..."
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
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Filtrar por Estado"
                value={estatusFilter}
                onChange={(e) => setEstatusFilter(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {estados.map((estado) => (
                  <MenuItem key={estado.value} value={estado.value}>
                    {estado.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchOrdenes}
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Prioridad</TableCell>
                <TableCell>Técnico</TableCell>
                <TableCell>Fecha Recepción</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredOrdenes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No hay órdenes de trabajo
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrdenes.map((orden) => (
                  <TableRow
                    key={orden.id}
                    hover
                    onClick={() => handleViewOrden(orden.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {orden.folio}
                      </Typography>
                      {orden.esta_retrasada && (
                        <Chip label="Retrasada" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{orden.cliente_nombre || 'N/A'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{orden.categoria_nombre || 'N/A'}</Typography>
                      {orden.subcategoria_nombre && (
                        <Typography variant="caption" color="text.secondary">
                          {orden.subcategoria_nombre}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {orden.descripcion}
                      </Typography>
                    </TableCell>
                    <TableCell>{getEstadoChip(orden.estatus)}</TableCell>
                    <TableCell>{getPrioridadChip(orden.prioridad)}</TableCell>
                    <TableCell>{orden.tecnico_nombre || 'Sin asignar'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(orden.fecha_recepcion)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {orden.dias_desde_recepcion} día(s)
                      </Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Ver detalles">
                        <IconButton size="small" onClick={() => handleViewOrden(orden.id)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {canEditOrderForm && (
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpenDialog(orden)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canEdit && (
                        <>
                          <Tooltip title="Cambiar estado">
                            <IconButton size="small" onClick={() => handleOpenEstadoDialog(orden)}>
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {canDelete && (
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleDelete(orden.id)} color="error">
                            <DeleteIcon />
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

        {/* Dialog Crear/Editar Orden */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {isEditing ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
          </DialogTitle>
          <DialogContent>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)} 
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ 
                mb: 2,
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Tab label="Información General" />
              <Tab label="Costos" />
              <Tab label="Foto de Entrada" />
            </Tabs>

            {/* Tab 1: Información General */}
            {tabValue === 0 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={esClienteNuevo}
                        onChange={(e) => {
                          setEsClienteNuevo(e.target.checked);
                          if (!e.target.checked) {
                            setNuevoClienteData({ nombre: '', apellido_paterno: '', telefono: '' });
                          }
                        }}
                      />
                    }
                    label="Cliente Nuevo (Captura Rápida)"
                  />
                </Grid>
                
                {!esClienteNuevo ? (
                  <Grid item xs={12}>
                    <Autocomplete
                      fullWidth
                      options={[
                        { id: 4, nombre_completo: 'CLIENTE GENERAL', esGeneral: true },
                        ...(Array.isArray(clientes) ? clientes.filter(c => c.id !== 4) : [])
                      ]}
                      getOptionLabel={(option) => (option && (option.nombre_completo || option.nombre)) || ''}
                      value={[
                        { id: 4, nombre_completo: 'CLIENTE GENERAL', esGeneral: true },
                        ...(Array.isArray(clientes) ? clientes : [])
                      ].find(o => o.id === formData.cliente_id) || null}
                      onChange={(event, newValue) => {
                        handleClienteChange(newValue ? newValue.id : '');
                      }}
                      renderOption={(props, option) => (
                        <Box component="li" {...props} key={option.id}>
                          {option.esGeneral ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip label="GENERAL" size="small" color="primary" />
                              <Typography>{option.nombre_completo}</Typography>
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="body1">{option.nombre_completo}</Typography>
                              {option.telefono && (
                                <Typography variant="caption" color="text.secondary">
                                  Tel: {option.telefono}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Cliente *"
                          required
                          placeholder="Buscar cliente por nombre, teléfono..."
                          helperText="Escribe para buscar o selecciona de la lista"
                        />
                      )}
                      noOptionsText="No se encontraron clientes"
                      isOptionEqualToValue={(option, value) => !value || (option && option.id === value.id)}
                    />
                  </Grid>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mb: 1 }}>
                        Captura rápida de cliente. Podrás completar los datos después desde el módulo de Clientes.
                      </Alert>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Nombre *"
                        value={nuevoClienteData.nombre}
                        onChange={(e) => setNuevoClienteData({ ...nuevoClienteData, nombre: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Apellido Paterno *"
                        value={nuevoClienteData.apellido_paterno}
                        onChange={(e) => setNuevoClienteData({ ...nuevoClienteData, apellido_paterno: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Teléfono *"
                        value={nuevoClienteData.telefono}
                        onChange={(e) => setNuevoClienteData({ ...nuevoClienteData, telefono: e.target.value })}
                        required
                        inputProps={{ maxLength: 10 }}
                      />
                    </Grid>
                  </>
                )}
                
                {/* Selector de Sucursal */}
                {!esClienteNuevo && formData.cliente_id && (
                  <>
                    <Grid item xs={12} sm={(sucursales || []).length === 0 ? 8 : 12}>
                      <TextField
                        select
                        fullWidth
                        label="Sucursal"
                        value={formData.sucursal_id}
                        onChange={(e) => setFormData({ ...formData, sucursal_id: e.target.value })}
                        helperText={(sucursales || []).length === 0 ? "Este cliente no tiene sucursales registradas" : "Selecciona la sucursal del cliente"}
                      >
                        <MenuItem value="">Sin sucursal específica</MenuItem>
                        {(sucursales || []).map((sucursal) => (
                          <MenuItem key={sucursal.id} value={sucursal.id}>
                            {sucursal.nombre_sucursal} {sucursal.codigo_sucursal ? `(${sucursal.codigo_sucursal})` : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    {(sucursales || []).length === 0 && (
                      <Grid item xs={12} sm={4}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={handleOpenSucursalDialog}
                          sx={{ height: '56px' }}
                        >
                          Agregar Sucursal
                        </Button>
                      </Grid>
                    )}
                  </>
                )}
                
                {/* Campos de Contacto para Notificaciones */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Contacto para Notificaciones
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Contacto"
                    value={formData.nombre_contacto_notificacion}
                    onChange={(e) => setFormData({ ...formData, nombre_contacto_notificacion: e.target.value })}
                    placeholder="Nombre de quien recibirá notificaciones"
                    helperText="Persona a quien se notificará sobre el estado de la orden"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Teléfono del Contacto"
                    value={formData.telefono_contacto_notificacion}
                    onChange={(e) => setFormData({ ...formData, telefono_contacto_notificacion: e.target.value })}
                    placeholder="Teléfono para notificaciones"
                    inputProps={{ maxLength: 15 }}
                    helperText="Número de teléfono para enviar notificaciones"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Categoría de Servicio"
                    value={formData.categoria_id}
                    onChange={(e) => handleCategoriaChange(e.target.value)}
                  >
                    <MenuItem value="">Sin categoría</MenuItem>
                    {(categorias || []).map((cat) => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Subcategoría"
                    value={formData.subcategoria_id}
                    onChange={(e) => setFormData({ ...formData, subcategoria_id: e.target.value })}
                    disabled={!formData.categoria_id}
                  >
                    <MenuItem value="">Sin subcategoría</MenuItem>
                    {subcategorias.map((subcat) => (
                      <MenuItem key={subcat.id} value={subcat.id}>
                        {subcat.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Tipo de Permiso/Documento"
                    value={formData.tipo_permiso}
                    onChange={(e) => setFormData({ ...formData, tipo_permiso: e.target.value })}
                  >
                    {tiposPermiso.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Número de Permiso/OC"
                    value={formData.numero_permiso}
                    onChange={(e) => setFormData({ ...formData, numero_permiso: e.target.value })}
                    disabled={!formData.tipo_permiso}
                    InputProps={{
                      readOnly: !isEditing,
                      startAdornment: formData.numero_permiso && (
                        <InputAdornment position="start">
                          <Chip label="Auto" size="small" color="success" />
                        </InputAdornment>
                      )
                    }}
                    helperText={!isEditing && formData.tipo_permiso ? "Generado automáticamente" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Prioridad"
                    value={formData.prioridad}
                    onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                  >
                    {prioridades.map((prioridad) => (
                      <MenuItem key={prioridad.value} value={prioridad.value}>
                        {prioridad.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Estado"
                    value={formData.estatus}
                    onChange={(e) => setFormData({ ...formData, estatus: e.target.value })}
                  >
                    {estados.map((estado) => (
                      <MenuItem key={estado.value} value={estado.value}>
                        {estado.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="Técnico Asignado"
                    value={formData.tecnico_asignado_id}
                    onChange={(e) => setFormData({ ...formData, tecnico_asignado_id: e.target.value })}
                  >
                    <MenuItem value="">Sin asignar</MenuItem>
                    {(tecnicos || []).map((tecnico) => (
                        <MenuItem key={tecnico.id} value={tecnico.id}>
                        {tecnico.nombre_completo}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Fecha Promesa de Entrega"
                    type="datetime-local"
                    value={formData.fecha_promesa}
                    onChange={(e) => setFormData({ ...formData, fecha_promesa: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                {/* Detalles del Trabajo */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, mt: 2 }}>
                    Detalles del Trabajo
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción del Trabajo *"
                    multiline
                    rows={4}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    helperText="Describe la pieza y el trabajo a realizar"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observaciones"
                    multiline
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    helperText="Notas adicionales, especificaciones, tolerancias, etc."
                  />
                </Grid>
              </Grid>
            )}

            {/* Tab 1: Costos */}
            {tabValue === 1 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Precio Sugerido/Estimado"
                    type="number"
                    value={formData.precio_estimado}
                    onChange={(e) => setFormData({ ...formData, precio_estimado: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Anticipo"
                    type="number"
                    value={formData.anticipo}
                    onChange={(e) => setFormData({ ...formData, anticipo: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <Typography variant="body2" color="text.secondary">
                      Precio Estimado: {formatCurrency(formData.precio_estimado || 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Anticipo: {formatCurrency(formData.anticipo || 0)}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Saldo Pendiente Estimado: {formatCurrency((parseFloat(formData.precio_estimado) || 0) - (parseFloat(formData.anticipo) || 0))}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {/* Tab 2: Foto de Entrada */}
            {tabValue === 2 && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {!showCamera ? (
                  <>
                    {/* Título */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhotoCameraIcon color="primary" />
                        Fotos e Información del Producto
                      </Typography>
                    </Grid>

                    {/* Al editar: bloques existentes (misma lógica que Detalles: imagen + campos editables) */}
                    {isEditing && seccionesExistentes.length > 0 && seccionesExistentes.map((sec, idx) => {
                      const { buildFotoUrl } = getBloquesFotosDetalle({});
                      const fotoUrl = buildFotoUrl(sec.url);
                      return (
                      <Grid item xs={12} key={sec.id}>
                        <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}>
                          <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 280 }, minHeight: 200 }}>
                            {fotoUrl ? (
                              <img
                                src={fotoUrl}
                                alt={`Producto ${idx + 1}`}
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
                              <Box sx={{ width: '100%', minHeight: 200, border: '1px dashed', borderColor: 'divider', borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                                <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                <Typography variant="body2" color="text.secondary">Sin foto</Typography>
                              </Box>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              Producto {idx + 1}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Trabajo a realizar / Medidas y especificaciones</Typography>
                            <TextField
                              fullWidth
                              label="Trabajo a Realizar"
                              multiline
                              rows={3}
                              value={sec.trabajo_realizar}
                              onChange={(e) => actualizarSeccionExistente(idx, 'trabajo_realizar', e.target.value)}
                              placeholder="Especifica el trabajo solicitado"
                            />
                            <TextField
                              fullWidth
                              label="Medidas y Especificaciones"
                              multiline
                              rows={3}
                              value={sec.medidas_especificaciones}
                              onChange={(e) => actualizarSeccionExistente(idx, 'medidas_especificaciones', e.target.value)}
                              placeholder="Dimensiones, tolerancias, materiales"
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    ); })}

                    {/* Título para agregar más fotos (solo al editar cuando ya hay existentes) */}
                    {isEditing && seccionesExistentes.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, mb: 0.5 }}>
                          Agregar otra imagen (como si se agregara por primera vez)
                        </Typography>
                      </Grid>
                    )}

                    {/* Secciones nuevas (agregar foto): misma UI que al crear */}
                    {seccionesFotos.map((seccion, index) => (
                      <Grid item xs={12} key={seccion.id}>
                        <Paper sx={{ p: 2, border: '2px solid', borderColor: 'primary.light' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                              {isEditing && seccionesExistentes.length > 0
                                ? `Producto ${seccionesExistentes.length + index + 1}`
                                : `Producto ${index + 1}`}
                            </Typography>
                            {seccionesFotos.length > 1 && (
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => eliminarSeccionFoto(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Box>

                          <Grid container spacing={2}>
                            {/* Columna Izquierda: Foto */}
                            <Grid item xs={12} md={5}>
                              <Box sx={{ textAlign: 'center' }}>
                                <ButtonGroup variant="outlined" fullWidth size="small" sx={{ mb: 2 }}>
                                  <Button
                                    startIcon={<PhotoCameraIcon />}
                                    onClick={() => startCamera('entrada', index)}
                                  >
                                    Tomar
                                  </Button>
                                  <Button
                                    startIcon={<ImageIcon />}
                                    onClick={() => handleFotoChange(index)}
                                  >
                                    Seleccionar
                                  </Button>
                                </ButtonGroup>

                                {seccion.preview ? (
                                  <Box sx={{ position: 'relative' }}>
                                    <img 
                                      src={seccion.preview} 
                                      alt={`Producto ${index + 1}`}
                                      style={{ 
                                        width: '100%', 
                                        height: 250, 
                                        objectFit: 'cover', 
                                        borderRadius: 8,
                                        border: '1px solid #ddd'
                                      }}
                                    />
                                    <Box sx={{ 
                                      position: 'absolute', 
                                      top: 8, 
                                      right: 8,
                                      display: 'flex',
                                      gap: 1
                                    }}>
                                      <IconButton
                                        sx={{ 
                                          bgcolor: 'background.paper',
                                          '&:hover': { bgcolor: 'primary.light', color: 'white' }
                                        }}
                                        onClick={() => handleEditImage(index)}
                                        size="small"
                                        title="Editar imagen"
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton
                                        sx={{ 
                                          bgcolor: 'background.paper',
                                          '&:hover': { bgcolor: 'error.light', color: 'white' }
                                        }}
                                        onClick={() => removeFoto('entrada', index)}
                                        size="small"
                                        title="Eliminar imagen"
                                      >
                                        <CloseIcon />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                ) : (
                                  <Box sx={{ 
                                    border: '2px dashed', 
                                    borderColor: 'grey.300', 
                                    borderRadius: 2, 
                                    p: 3,
                                    bgcolor: 'grey.50',
                                    height: 250,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    <PhotoCameraIcon sx={{ fontSize: 50, color: 'grey.400' }} />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      Sin foto
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Grid>

                            {/* Columna Derecha: Información */}
                            <Grid item xs={12} md={7}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                  fullWidth
                                  label="Trabajo a Realizar"
                                  multiline
                                  rows={4}
                                  value={seccion.trabajo_realizar}
                                  onChange={(e) => actualizarInfoSeccion(index, 'trabajo_realizar', e.target.value)}
                                  placeholder="Ej: Rectificar eje, pulir superficie, aplicar recubrimiento..."
                                  helperText="Especifica el trabajo solicitado"
                                />
                                
                                <TextField
                                  fullWidth
                                  label="Medidas y Especificaciones"
                                  multiline
                                  rows={4}
                                  value={seccion.medidas_especificaciones}
                                  onChange={(e) => actualizarInfoSeccion(index, 'medidas_especificaciones', e.target.value)}
                                  placeholder="Ej: Diámetro: 50mm ±0.05mm, Longitud: 200mm, Material: Acero 1045..."
                                  helperText="Dimensiones, tolerancias, materiales"
                                />
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Grid>
                    ))}

                    {/* Botón para agregar nueva sección - Abajo */}
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={agregarSeccionFoto}
                        fullWidth
                        size="large"
                      >
                        Agregar Foto
                      </Button>
                    </Grid>

                    {/* Detalles Adicionales */}
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Detalles Adicionales
                        </Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          value={formData.observaciones || ''}
                          onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                          placeholder="Observaciones generales, notas especiales, instrucciones adicionales..."
                          helperText="Información adicional que no corresponde a un producto específico"
                        />
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Alert severity="info">
                        Agrega una sección por cada pieza o producto. La foto de salida se agregará al completar el trabajo.
                      </Alert>
                    </Grid>
                  </>
                ) : (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        Capturar Foto de {currentFotoType === 'entrada' ? 'Entrada' : 'Salida'}
                      </Typography>
                      <Box sx={{ position: 'relative', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          style={{ width: '100%', maxHeight: '60vh', display: 'block' }}
                        />
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<PhotoCameraIcon />}
                          onClick={capturePhoto}
                        >
                          Capturar
                        </Button>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={stopCamera}
                        >
                          Cancelar
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileSelect}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Crear Sucursal */}
        <Dialog open={openSucursalDialog} onClose={handleCloseSucursalDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Agregar Nueva Sucursal
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity="info">
                  Completa los datos de la sucursal y el contacto para notificaciones
                </Alert>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Datos de la Sucursal
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Nombre de la Sucursal *"
                  value={nuevaSucursalData.nombre_sucursal}
                  onChange={(e) => setNuevaSucursalData({ ...nuevaSucursalData, nombre_sucursal: e.target.value })}
                  required
                  placeholder="Ej: Sucursal Centro, Planta Norte, etc."
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Código"
                  value={nuevaSucursalData.codigo_sucursal}
                  onChange={(e) => setNuevaSucursalData({ ...nuevaSucursalData, codigo_sucursal: e.target.value })}
                  placeholder="SUC-001"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Dirección de la Sucursal
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Calle"
                  value={nuevaSucursalData.calle}
                  onChange={(e) => setNuevaSucursalData({ ...nuevaSucursalData, calle: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Número"
                  value={nuevaSucursalData.numero_exterior}
                  onChange={(e) => setNuevaSucursalData({ ...nuevaSucursalData, numero_exterior: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Colonia"
                  value={nuevaSucursalData.colonia}
                  onChange={(e) => setNuevaSucursalData({ ...nuevaSucursalData, colonia: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  value={nuevaSucursalData.ciudad}
                  onChange={(e) => setNuevaSucursalData({ ...nuevaSucursalData, ciudad: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Estado"
                  value={nuevaSucursalData.estado}
                  onChange={(e) => setNuevaSucursalData({ ...nuevaSucursalData, estado: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Contacto para Notificaciones *
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre del Contacto *"
                  value={nuevaSucursalData.nombre_contacto}
                  onChange={(e) => setNuevaSucursalData({ ...nuevaSucursalData, nombre_contacto: e.target.value })}
                  required
                  placeholder="Nombre completo"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Teléfono *"
                  value={nuevaSucursalData.telefono}
                  onChange={(e) => setNuevaSucursalData({ ...nuevaSucursalData, telefono: e.target.value })}
                  required
                  placeholder="10 dígitos"
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSucursalDialog}>Cancelar</Button>
            <Button onClick={handleCreateSucursal} variant="contained" color="primary">
              Guardar Sucursal
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Ver Orden */}
        <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Detalles de la Orden {selectedOrden?.folio}
          </DialogTitle>
          <DialogContent>
            {selectedOrden && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">Cliente</Typography>
                  <Typography>{selectedOrden.cliente_nombre}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Categoría</Typography>
                  <Typography>{selectedOrden.categoria_nombre || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Subcategoría</Typography>
                  <Typography>{selectedOrden.subcategoria_nombre || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Estado</Typography>
                  {getEstadoChip(selectedOrden.estatus)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Prioridad</Typography>
                  {getPrioridadChip(selectedOrden.prioridad)}
                </Grid>
                {selectedOrden.observaciones && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Observaciones</Typography>
                    <Typography>{selectedOrden.observaciones}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Fotos de entrada y detalles</Typography>
                  {(() => {
                    const { bloques, fotosEntrada, numBloques, buildFotoUrl } = getBloquesFotosDetalle(selectedOrden);
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
                  {!selectedOrden.foto_entrada && !(Array.isArray(selectedOrden.fotos_entrada_list) && selectedOrden.fotos_entrada_list.length > 0) && !selectedOrden.descripcion && (
                    <Typography variant="body2" color="text.secondary">No hay fotos de entrada ni descripción registradas.</Typography>
                  )}
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenViewDialog(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Cambiar Estado */}
        <Dialog open={openEstadoDialog} onClose={() => setOpenEstadoDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Cambiar Estado de la Orden</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Nuevo Estado"
                  value={cambioEstado.estatus}
                  onChange={(e) => setCambioEstado({ ...cambioEstado, estatus: e.target.value })}
                >
                  {estados.map((estado) => (
                    <MenuItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  multiline
                  rows={3}
                  value={cambioEstado.observaciones}
                  onChange={(e) => setCambioEstado({ ...cambioEstado, observaciones: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEstadoDialog(false)}>Cancelar</Button>
            <Button onClick={handleCambiarEstado} variant="contained">
              Cambiar Estado
            </Button>
          </DialogActions>
        </Dialog>

        {/* Editor de Imágenes */}
        <ImageEditor
          open={openImageEditor}
          onClose={() => setOpenImageEditor(false)}
          imageUrl={editingImageUrl}
          onSave={handleSaveEditedImage}
        />

      </Container>
    </Layout>
  );
};

export default Ordenes;
