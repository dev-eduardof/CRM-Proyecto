# Frontend - CRM Talleres

Frontend desarrollado con React + Vite para el sistema de gestión de talleres.

## 🚀 Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool rápido
- **React Router** - Navegación
- **Material-UI** - Componentes UI
- **Axios** - Cliente HTTP
- **React Query** - Gestión de estado del servidor

## 📁 Estructura

```
frontend/
├── public/             # Archivos estáticos
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas principales
│   ├── services/       # Servicios API
│   ├── context/        # Context API
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilidades
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── Dockerfile          # Docker configuration
├── package.json        # Dependencias
└── vite.config.js      # Configuración Vite
```

## 🛠️ Instalación Local (sin Docker)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env`:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

El frontend estará disponible en: http://localhost:3000

## 🐳 Instalación con Docker

Desde la raíz del proyecto:

```bash
docker-compose up -d frontend
```

## 🏗️ Build para producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`

## 📱 Páginas Principales

- `/login` - Login de usuarios
- `/` - Dashboard principal
- `/recepcion` - Módulo de recepción (tablet/móvil)
- `/tecnicos` - Panel de técnicos (tablet/móvil)
- `/caja` - Módulo de caja
- `/admin` - Panel administrativo
- `/reportes` - Reportes y análisis

## 🎨 Componentes

### Layout
- `Navbar` - Barra de navegación
- `Sidebar` - Menú lateral
- `Footer` - Pie de página

### Forms
- `ClienteForm` - Formulario de clientes
- `OrdenForm` - Formulario de órdenes de trabajo
- `PagoForm` - Formulario de pagos

### Common
- `Loading` - Indicador de carga
- `ErrorBoundary` - Manejo de errores
- `ProtectedRoute` - Rutas protegidas

## 🔐 Autenticación

El sistema utiliza JWT almacenado en localStorage.

### Login:

```javascript
import api from './services/api';

const login = async (username, password) => {
  const response = await api.post('/api/v1/auth/login', {
    username,
    password
  });
  localStorage.setItem('token', response.data.access_token);
};
```

### Logout:

```javascript
const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};
```

## 📦 Servicios API

### Ejemplo de uso:

```javascript
import api from './services/api';

// Obtener clientes
const getClientes = async () => {
  const response = await api.get('/api/v1/clients');
  return response.data;
};

// Crear orden de trabajo
const createOrden = async (data) => {
  const response = await api.post('/api/v1/ordenes', data);
  return response.data;
};
```

## 🎨 Tema y Estilos

El proyecto utiliza Material-UI con un tema personalizado:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});
```

## 📱 Responsive Design

El frontend está optimizado para:
- 📱 Móviles (320px - 767px)
- 📱 Tablets (768px - 1023px)
- 💻 Desktop (1024px+)

## 🧪 Tests

```bash
npm run test
```

## 📝 Linting

```bash
npm run lint
```

## 🔧 Desarrollo

### Agregar nueva página:

1. Crear componente en `src/pages/`
2. Agregar ruta en `App.jsx`
3. Crear servicio API si es necesario

### Ejemplo:

```javascript
// src/pages/MiPagina.jsx
import React from 'react';

const MiPagina = () => {
  return (
    <div>
      <h1>Mi Página</h1>
    </div>
  );
};

export default MiPagina;
```

## 📄 Licencia

Proyecto privado - CRM Talleres
