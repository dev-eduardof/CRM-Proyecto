# 🚀 GUÍA DE INICIO - PROYECTO CRM TALLERES

## 📋 ÍNDICE
1. [Preparación del Entorno](#1-preparación-del-entorno)
2. [Configuración del Repositorio](#2-configuración-del-repositorio)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Configuración de Base de Datos](#4-configuración-de-base-de-datos)
5. [Backend - FastAPI](#5-backend---fastapi)
6. [Frontend - React](#6-frontend---react)
7. [Primeros Pasos de Desarrollo](#7-primeros-pasos-de-desarrollo)
8. [Checklist de Inicio](#8-checklist-de-inicio)

---

## 1. PREPARACIÓN DEL ENTORNO

### 1.1 Software Requerido

#### Instalar Python 3.9+
```bash
# Verificar instalación
python --version
# Debe mostrar: Python 3.9.x o superior
```

#### Instalar Node.js 18+
```bash
# Verificar instalación
node --version
npm --version
# Node debe ser v18.x o superior
```

#### Instalar MariaDB 10.6+
```bash
# Windows: Descargar desde https://mariadb.org/download/
# Verificar instalación
mysql --version
```

#### Instalar Git
```bash
# Verificar instalación
git --version
```

#### Editor de Código Recomendado
- **Visual Studio Code** con extensiones:
  - Python
  - Pylance
  - ES7+ React/Redux/React-Native snippets
  - ESLint
  - Prettier

---

## 2. CONFIGURACIÓN DEL REPOSITORIO

### 2.1 Crear Estructura de Carpetas

```bash
# Ya tienes el repositorio inicializado
cd "G:\CRM Proyecto"

# Verificar estado
git status
git branch -a
```

### 2.2 Crear Estructura de Directorios

```bash
# Crear estructura del proyecto
mkdir backend
mkdir frontend
mkdir docs
mkdir database
mkdir uploads
```

### 2.3 Crear .gitignore

Crear archivo `.gitignore` en la raíz:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
build/
dist/
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Database
*.sql
*.sqlite
*.db

# Uploads
uploads/*
!uploads/.gitkeep

# Environment variables
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
```

---

## 3. ESTRUCTURA DEL PROYECTO

### 3.1 Estructura Completa

```
CRM-Proyecto/
│
├── backend/                    # Backend FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # Punto de entrada FastAPI
│   │   ├── config.py          # Configuración
│   │   ├── database.py        # Conexión BD
│   │   │
│   │   ├── models/            # Modelos SQLAlchemy
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── client.py
│   │   │   ├── orden_trabajo.py
│   │   │   └── ...
│   │   │
│   │   ├── schemas/           # Schemas Pydantic
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── client.py
│   │   │   └── ...
│   │   │
│   │   ├── api/               # Endpoints API
│   │   │   ├── __init__.py
│   │   │   ├── deps.py        # Dependencias
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── users.py
│   │   │       ├── clients.py
│   │   │       ├── ordenes.py
│   │   │       └── ...
│   │   │
│   │   ├── core/              # Lógica core
│   │   │   ├── __init__.py
│   │   │   ├── security.py    # JWT, passwords
│   │   │   └── config.py
│   │   │
│   │   └── services/          # Servicios
│   │       ├── __init__.py
│   │       ├── email.py
│   │       ├── whatsapp.py
│   │       └── pdf.py
│   │
│   ├── alembic/               # Migraciones BD
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── tests/                 # Tests
│   │   ├── __init__.py
│   │   └── test_api.py
│   │
│   ├── requirements.txt       # Dependencias Python
│   ├── .env.example          # Ejemplo variables entorno
│   └── README.md
│
├── frontend/                  # Frontend React
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── forms/
│   │   │
│   │   ├── pages/             # Páginas principales
│   │   │   ├── Login.jsx
│   │   │   ├── Recepcion.jsx
│   │   │   ├── Tecnicos.jsx
│   │   │   ├── Caja.jsx
│   │   │   ├── Admin.jsx
│   │   │   └── Reportes.jsx
│   │   │
│   │   ├── services/          # Servicios API
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   └── ordenes.js
│   │   │
│   │   ├── context/           # Context API
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/             # Custom hooks
│   │   │   └── useAuth.js
│   │   │
│   │   ├── utils/             # Utilidades
│   │   │   └── helpers.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── database/                  # Scripts BD
│   ├── schema.sql
│   ├── seed.sql
│   └── backup/
│
├── uploads/                   # Archivos subidos
│   ├── fotos/
│   └── .gitkeep
│
├── docs/                      # Documentación
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── README.md
├── ESTRUCTURA_TECNICA_CRM.html
└── GUIA_INICIO_PROYECTO.md
```

---

## 4. CONFIGURACIÓN DE BASE DE DATOS

### 4.1 Crear Base de Datos

```sql
-- Conectar a MariaDB
mysql -u root -p

-- Crear base de datos
CREATE DATABASE crm_talleres CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON crm_talleres.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificar
USE crm_talleres;
SHOW TABLES;
```

### 4.2 Crear Archivo de Schema Inicial

Crear `database/schema.sql`:

```sql
-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol ENUM('admin', 'recepcion', 'tecnico', 'caja', 'auxiliar', 'jefe_taller') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Más tablas se agregarán progresivamente...
```

---

## 5. BACKEND - FastAPI

### 5.1 Crear Entorno Virtual

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate
```

### 5.2 Crear requirements.txt

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pymysql==1.1.0
cryptography==41.0.7
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==2.5.0
pydantic-settings==2.1.0
alembic==1.13.0
python-dotenv==1.0.0
email-validator==2.1.0
```

### 5.3 Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 5.4 Crear Estructura Básica

#### backend/app/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CRM Talleres API",
    description="API para Sistema de Gestión de Talleres",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "CRM Talleres API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

#### backend/app/config.py

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+pymysql://crm_user:tu_password@localhost/crm_talleres"
    
    # Security
    SECRET_KEY: str = "tu-secret-key-super-segura-cambiala"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

#### backend/app/database.py

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### backend/.env.example

```env
# Database
DATABASE_URL=mysql+pymysql://crm_user:password@localhost/crm_talleres

# Security
SECRET_KEY=tu-secret-key-super-segura-cambiala-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### 5.5 Probar Backend

```bash
# Desde la carpeta backend con venv activado
python -m app.main

# O usar uvicorn directamente
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Abrir navegador en: `http://localhost:8000/docs` (Swagger UI automático)

---

## 6. FRONTEND - React

### 6.1 Crear Proyecto React

```bash
cd frontend

# Crear proyecto con Vite (más rápido que CRA)
npm create vite@latest . -- --template react

# O con Create React App
npx create-react-app .
```

### 6.2 Instalar Dependencias

```bash
# Dependencias principales
npm install react-router-dom axios

# UI Framework (elegir uno)
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
# O
npm install antd

# Otras utilidades
npm install date-fns
npm install react-hook-form
npm install @tanstack/react-query
```

### 6.3 Crear Estructura Básica

#### frontend/src/services/api.js

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
```

#### frontend/src/App.jsx

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
```

#### frontend/.env.example

```env
VITE_API_URL=http://localhost:8000
```

### 6.4 Probar Frontend

```bash
# Desde la carpeta frontend
npm run dev

# Abrir navegador en: http://localhost:3000
```

---

## 7. PRIMEROS PASOS DE DESARROLLO

### 7.1 Orden de Desarrollo Recomendado

#### Semana 1: Setup y Autenticación

**Día 1-2: Setup Completo**
- ✅ Configurar entorno de desarrollo
- ✅ Crear estructura de carpetas
- ✅ Configurar base de datos
- ✅ Inicializar backend y frontend

**Día 3-4: Modelo de Usuarios**
- [ ] Crear modelo User en SQLAlchemy
- [ ] Crear endpoints de autenticación (login, registro)
- [ ] Implementar JWT
- [ ] Crear página de login en React

**Día 5: Testing Inicial**
- [ ] Probar login/logout
- [ ] Verificar tokens JWT
- [ ] Documentar API en Swagger

#### Semana 2: Clientes y OT Básico

**Día 1-2: Modelo de Clientes**
- [ ] Crear modelo Client
- [ ] CRUD de clientes (API)
- [ ] Interfaz de gestión de clientes

**Día 3-5: Órdenes de Trabajo Básicas**
- [ ] Crear modelo OrdenTrabajo
- [ ] Endpoints CRUD de OT
- [ ] Formulario de recepción básico
- [ ] Generación de folio automático

### 7.2 Comandos Útiles para Desarrollo

```bash
# Backend
cd backend
source venv/bin/activate  # o venv\Scripts\activate en Windows
uvicorn app.main:app --reload

# Frontend (en otra terminal)
cd frontend
npm run dev

# Base de datos
mysql -u crm_user -p crm_talleres

# Git
git status
git add .
git commit -m "feat: descripción del cambio"
git push origin desarrollo
```

---

## 8. CHECKLIST DE INICIO

### ✅ Fase 1: Preparación (Día 1)

- [ ] Instalar Python 3.9+
- [ ] Instalar Node.js 18+
- [ ] Instalar MariaDB 10.6+
- [ ] Instalar Git
- [ ] Instalar VS Code con extensiones
- [ ] Verificar todas las instalaciones

### ✅ Fase 2: Repositorio (Día 1)

- [x] Repositorio Git inicializado
- [x] Ramas creadas (main, desarrollo, testeo)
- [x] Repositorio remoto configurado
- [ ] Crear .gitignore
- [ ] Crear estructura de carpetas

### ✅ Fase 3: Base de Datos (Día 1-2)

- [ ] Crear base de datos crm_talleres
- [ ] Crear usuario de BD
- [ ] Probar conexión
- [ ] Crear schema inicial (usuarios, clientes)
- [ ] Documentar en database/schema.sql

### ✅ Fase 4: Backend (Día 2)

- [ ] Crear entorno virtual Python
- [ ] Instalar dependencias (requirements.txt)
- [ ] Crear estructura de carpetas backend
- [ ] Configurar FastAPI básico
- [ ] Crear archivo .env
- [ ] Probar endpoint raíz (http://localhost:8000)
- [ ] Verificar Swagger UI (http://localhost:8000/docs)

### ✅ Fase 5: Frontend (Día 2-3)

- [ ] Crear proyecto React
- [ ] Instalar dependencias
- [ ] Configurar estructura de carpetas
- [ ] Crear servicio API
- [ ] Configurar rutas básicas
- [ ] Probar frontend (http://localhost:3000)

### ✅ Fase 6: Integración (Día 3)

- [ ] Conectar frontend con backend
- [ ] Probar llamadas API desde React
- [ ] Configurar CORS correctamente
- [ ] Verificar comunicación completa

### ✅ Fase 7: Primer Módulo (Día 4-5)

- [ ] Implementar autenticación completa
- [ ] Crear modelo User
- [ ] Endpoints login/register
- [ ] Página de login funcional
- [ ] Protección de rutas
- [ ] Almacenar token JWT

---

## 🎯 PRÓXIMOS PASOS

Una vez completado el checklist anterior:

1. **Commit inicial:**
```bash
git add .
git commit -m "feat: configuración inicial del proyecto"
git push origin desarrollo
```

2. **Comenzar desarrollo de módulos:**
   - Autenticación y usuarios
   - Gestión de clientes
   - Órdenes de trabajo básicas
   - Panel de técnicos
   - Y así sucesivamente...

3. **Mantener documentación actualizada:**
   - Documentar cada endpoint en Swagger
   - Actualizar README.md
   - Documentar decisiones técnicas

---

## 📚 RECURSOS ÚTILES

### Documentación Oficial
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [Material-UI](https://mui.com/)
- [MariaDB](https://mariadb.org/documentation/)

### Tutoriales Recomendados
- FastAPI + SQLAlchemy: https://fastapi.tiangolo.com/tutorial/sql-databases/
- React Router: https://reactrouter.com/
- JWT Authentication: https://fastapi.tiangolo.com/tutorial/security/

---

## 🆘 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "No module named 'app'"
```bash
# Asegúrate de estar en la carpeta backend
cd backend
# Y que el entorno virtual esté activado
source venv/bin/activate  # o venv\Scripts\activate
```

### Error: "Cannot connect to database"
```bash
# Verificar que MariaDB esté corriendo
# Windows: Servicios > MariaDB
# Linux: sudo systemctl status mariadb

# Verificar credenciales en .env
```

### Error: "Port 8000 already in use"
```bash
# Cambiar puerto en main.py o matar proceso
# Windows: netstat -ano | findstr :8000
# Linux: lsof -i :8000
```

### Error: CORS en Frontend
```python
# Verificar en backend/app/main.py que el origen esté permitido
allow_origins=["http://localhost:3000"]
```

---

## 📞 CONTACTO Y SOPORTE

Si encuentras problemas durante el setup:
1. Revisar esta guía paso a paso
2. Consultar documentación oficial
3. Buscar en Stack Overflow
4. Documentar el problema para futuras referencias

---

**¡Listo para comenzar! 🚀**

Sigue los pasos en orden y verifica cada checkbox. El proyecto está diseñado para ser construido de forma incremental.

**Última actualización:** 22/01/2026
