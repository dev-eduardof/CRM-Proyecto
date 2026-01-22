# 📁 ESTRUCTURA DEL PROYECTO CRM TALLERES

## 🎯 Resumen

Se ha creado la estructura completa del proyecto con Docker, listo para comenzar el desarrollo.

## 📂 Estructura de Archivos

```
CRM-Proyecto/
│
├── 📄 .env.example                    # Ejemplo de variables de entorno
├── 📄 .gitignore                      # Archivos ignorados por Git
├── 📄 docker-compose.yml              # Configuración de Docker
├── 📄 README.md                       # Documentación principal
├── 📄 QUICK_START.md                  # Guía de inicio rápido
├── 📄 GUIA_INICIO_PROYECTO.md         # Guía detallada de inicio
├── 📄 ESTRUCTURA_TECNICA_CRM.html     # Documentación técnica
├── 📄 start.ps1                       # Script de inicio PowerShell
│
├── 📁 backend/                        # Backend FastAPI
│   ├── 📄 Dockerfile                  # Docker para backend
│   ├── 📄 requirements.txt            # Dependencias Python
│   ├── 📄 README.md                   # Documentación backend
│   │
│   └── 📁 app/                        # Aplicación principal
│       ├── 📄 __init__.py
│       ├── 📄 main.py                 # Punto de entrada FastAPI
│       ├── 📄 config.py               # Configuración
│       ├── 📄 database.py             # Conexión a BD
│       │
│       ├── 📁 api/                    # Endpoints API
│       │   ├── 📄 __init__.py
│       │   └── 📁 v1/                 # API versión 1
│       │       └── 📄 __init__.py
│       │
│       ├── 📁 core/                   # Lógica core
│       │   ├── 📄 __init__.py
│       │   └── 📄 security.py         # JWT, passwords
│       │
│       ├── 📁 models/                 # Modelos SQLAlchemy
│       │   └── 📄 __init__.py
│       │
│       ├── 📁 schemas/                # Schemas Pydantic
│       │   └── 📄 __init__.py
│       │
│       └── 📁 services/               # Servicios
│           └── 📄 __init__.py
│
├── 📁 frontend/                       # Frontend React
│   ├── 📄 Dockerfile                  # Docker para frontend
│   ├── 📄 package.json                # Dependencias Node
│   ├── 📄 vite.config.js              # Configuración Vite
│   ├── 📄 index.html                  # HTML principal
│   ├── 📄 README.md                   # Documentación frontend
│   │
│   ├── 📁 public/                     # Archivos estáticos
│   │
│   └── 📁 src/                        # Código fuente
│       ├── 📄 main.jsx                # Punto de entrada
│       ├── 📄 App.jsx                 # Componente principal
│       ├── 📄 index.css               # Estilos globales
│       │
│       ├── 📁 components/             # Componentes reutilizables
│       ├── 📁 pages/                  # Páginas principales
│       ├── 📁 services/               # Servicios API
│       │   └── 📄 api.js              # Cliente Axios
│       ├── 📁 context/                # Context API
│       ├── 📁 hooks/                  # Custom hooks
│       └── 📁 utils/                  # Utilidades
│
├── 📁 database/                       # Scripts de base de datos
│   └── 📄 schema.sql                  # Schema inicial
│
├── 📁 docs/                           # Documentación
│   └── 📄 ESTRUCTURA_PROYECTO.md      # Este archivo
│
└── 📁 uploads/                        # Archivos subidos
    └── 📄 .gitkeep                    # Mantener carpeta en Git
```

## 🐳 Servicios Docker

### 1. Base de Datos (MariaDB)
- **Puerto**: 3306
- **Contenedor**: crm_db
- **Usuario**: crm_user
- **Base de datos**: crm_talleres

### 2. Backend (FastAPI)
- **Puerto**: 8000
- **Contenedor**: crm_backend
- **Framework**: FastAPI + Python 3.11
- **Docs**: http://localhost:8000/docs

### 3. Frontend (React)
- **Puerto**: 3000
- **Contenedor**: crm_frontend
- **Framework**: React 18 + Vite
- **URL**: http://localhost:3000

### 4. Adminer (Opcional)
- **Puerto**: 8080
- **Contenedor**: crm_adminer
- **Uso**: Gestión visual de BD

## 🔧 Tecnologías Implementadas

### Backend
- ✅ FastAPI (Framework web)
- ✅ SQLAlchemy (ORM)
- ✅ Pydantic (Validación)
- ✅ JWT (Autenticación)
- ✅ Bcrypt (Hash de passwords)
- ✅ Uvicorn (Servidor ASGI)

### Frontend
- ✅ React 18
- ✅ Vite (Build tool)
- ✅ React Router (Navegación)
- ✅ Material-UI (Componentes)
- ✅ Axios (Cliente HTTP)
- ✅ React Query (Estado del servidor)

### Base de Datos
- ✅ MariaDB 10.6
- ✅ Schema inicial creado
- ✅ Tablas principales definidas
- ✅ Usuario admin por defecto

## 📋 Archivos de Configuración

### .env.example
Variables de entorno de ejemplo para:
- Conexión a base de datos
- Secret key para JWT
- URLs de API
- Configuración de servicios

### docker-compose.yml
Orquestación de servicios:
- Base de datos con volumen persistente
- Backend con hot-reload
- Frontend con hot-reload
- Red interna para comunicación
- Health checks configurados

### .gitignore
Ignora:
- Archivos de Python (__pycache__, venv)
- Archivos de Node (node_modules)
- Variables de entorno (.env)
- Archivos de base de datos
- Uploads
- Archivos de IDEs

## 🚀 Comandos Disponibles

### Inicio Rápido
```powershell
# Con script
.\start.ps1

# Directo
docker-compose up -d
```

### Gestión de Servicios
```powershell
# Ver logs
docker-compose logs -f

# Reiniciar servicio
docker-compose restart [servicio]

# Detener
docker-compose down

# Reconstruir
docker-compose build
```

### Desarrollo Local
```powershell
# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## 📊 Base de Datos

### Tablas Creadas
1. **usuarios** - Usuarios del sistema con roles
2. **clientes** - Clientes del taller
3. **categorias** - Categorías de trabajos
4. **subcategorias** - Subcategorías de trabajos
5. **ordenes_trabajo** - Órdenes de trabajo principales
6. **materiales** - Materiales utilizados
7. **pagos** - Pagos y anticipos
8. **gastos** - Gastos del negocio
9. **notificaciones** - Notificaciones enviadas

### Usuario por Defecto
- **Username**: admin
- **Password**: admin123
- **Rol**: admin

## 🔐 Seguridad Implementada

### Backend
- ✅ JWT para autenticación
- ✅ Bcrypt para hash de passwords
- ✅ CORS configurado
- ✅ Validación de datos con Pydantic
- ✅ Variables de entorno para secrets

### Frontend
- ✅ Interceptores Axios para tokens
- ✅ Redirección automática en 401
- ✅ LocalStorage para tokens
- ✅ Rutas protegidas (pendiente implementar)

## 📝 Próximos Pasos

### Fase 1: Setup y Autenticación
1. ✅ Estructura del proyecto
2. ✅ Docker configurado
3. ⏳ Instalar dependencias frontend
4. ⏳ Probar inicio con Docker
5. ⏳ Crear modelo User
6. ⏳ Implementar endpoints de auth
7. ⏳ Crear página de Login

### Fase 2: Clientes y OT
1. ⏳ Modelo de Clientes
2. ⏳ CRUD de clientes
3. ⏳ Modelo de Órdenes de Trabajo
4. ⏳ Formulario de recepción

### Fase 3: Panel de Técnicos
1. ⏳ Vista de OT asignadas
2. ⏳ Cambio de estatus
3. ⏳ Registro de materiales

## 🎯 Estado Actual

### ✅ Completado
- Estructura completa del proyecto
- Docker Compose configurado
- Backend estructura creada
- Frontend estructura creada
- Base de datos schema inicial
- Documentación básica
- Scripts de inicio

### ⏳ Pendiente
- Instalar dependencias de frontend
- Probar inicio con Docker
- Implementar autenticación
- Crear modelos de datos
- Desarrollar interfaces de usuario

## 📚 Documentación Adicional

- [README Principal](../README.md) - Información general
- [QUICK_START](../QUICK_START.md) - Inicio rápido
- [GUIA_INICIO_PROYECTO](../GUIA_INICIO_PROYECTO.md) - Guía detallada
- [ESTRUCTURA_TECNICA_CRM](../ESTRUCTURA_TECNICA_CRM.html) - Documentación técnica
- [Backend README](../backend/README.md) - Documentación backend
- [Frontend README](../frontend/README.md) - Documentación frontend

---

**Versión**: 1.0.0  
**Fecha**: 22/01/2026  
**Estado**: Estructura inicial completada ✅
