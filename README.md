# 🚗 CRM Talleres - Sistema de Gestión de Talleres

Sistema completo de gestión para talleres mecánicos desarrollado con FastAPI (Backend) y React (Frontend).

## 📋 Características Principales

- ✅ Gestión de órdenes de trabajo
- ✅ Control de clientes
- ✅ Panel para técnicos
- ✅ Sistema de pagos y caja
- ✅ Reportes y análisis
- ✅ Notificaciones WhatsApp y Email
- ✅ Responsive (Tablet/Móvil/Desktop)
- ✅ Autenticación JWT
- ✅ Roles y permisos

## 🏗️ Arquitectura

```
CRM-Proyecto/
├── backend/          # FastAPI + Python
├── frontend/         # React + Vite
├── database/         # Scripts SQL
├── docs/             # Documentación
├── uploads/          # Archivos subidos
└── docker-compose.yml
```

## 🚀 Inicio Rápido con Docker

### Prerrequisitos

- Docker Desktop instalado
- Git

### 1. Clonar repositorio

```bash
git clone https://github.com/dev-eduardof/CRM-Proyecto.git
cd CRM-Proyecto
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
copy .env.example .env

# Editar .env con tus configuraciones
```

### 3. Iniciar servicios

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### 4. Acceder a los servicios

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **Adminer (BD)**: http://localhost:8080

### Credenciales por defecto

- **Usuario**: admin
- **Password**: admin123

## 🛠️ Instalación Local (Sin Docker)

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
copy .env.example .env

# Ejecutar servidor
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar .env
copy .env.example .env

# Ejecutar en desarrollo
npm run dev
```

### Base de Datos

```bash
# Conectar a MariaDB
mysql -u root -p

# Crear base de datos
CREATE DATABASE crm_talleres;

# Importar schema
mysql -u root -p crm_talleres < database/schema.sql
```

## 📦 Stack Tecnológico

### Backend
- **FastAPI** - Framework web Python
- **SQLAlchemy** - ORM
- **MariaDB** - Base de datos
- **JWT** - Autenticación
- **Pydantic** - Validación de datos

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **Material-UI** - Componentes
- **React Router** - Navegación
- **Axios** - Cliente HTTP

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación

## 📚 Documentación

- [Estructura Técnica](ESTRUCTURA_TECNICA_CRM.html)
- [Guía de Inicio](GUIA_INICIO_PROYECTO.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

## 🔐 Roles del Sistema

- **Admin** - Acceso total
- **Recepción** - Gestión de OT y clientes
- **Técnico** - Panel de trabajos asignados
- **Caja** - Pagos y cortes
- **Auxiliar** - Reportes financieros
- **Jefe de Taller** - Supervisión

## 📱 Módulos

### 1. Recepción (Tablet/Móvil)
- Crear órdenes de trabajo
- Gestión de clientes
- Captura de fotos
- Asignación a técnicos

### 2. Panel de Técnicos (Tablet/Móvil)
- Ver trabajos asignados
- Cambiar estatus
- Registrar materiales
- Agregar notas

### 3. Caja
- Registro de pagos
- Control de anticipos
- Cortes de caja

### 4. Reportes
- Trabajos entrantes/salientes
- Análisis financiero
- Comisiones
- Filtros avanzados

### 5. Administración
- Gestión de usuarios
- Configuración del sistema
- Monitoreo

## 🧪 Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm run test
```

## 📊 Base de Datos

### Tablas Principales

- `usuarios` - Usuarios del sistema
- `clientes` - Clientes del taller
- `ordenes_trabajo` - Órdenes de trabajo
- `materiales` - Materiales utilizados
- `pagos` - Pagos y anticipos
- `gastos` - Gastos del negocio
- `notificaciones` - Notificaciones enviadas

## 🔄 Flujo de Trabajo

1. **Recepción** → Cliente llega, se crea OT
2. **Técnico** → Recibe notificación, trabaja en OT
3. **Post-Trabajo** → Recepción revisa y crea borrador
4. **Aprobación** → Admin aprueba precios
5. **Notificación** → Cliente recibe WhatsApp/Email
6. **Caja** → Cliente paga y retira trabajo

## 🚀 Comandos Útiles

### Docker

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f [servicio]

# Reiniciar servicio
docker-compose restart [servicio]

# Detener servicios
docker-compose down

# Reconstruir imágenes
docker-compose build

# Limpiar todo
docker-compose down -v
```

### Git

```bash
# Ver estado
git status

# Cambiar de rama
git checkout desarrollo

# Commit
git add .
git commit -m "descripción"

# Push
git push origin desarrollo
```

## 🐛 Solución de Problemas

### Docker no inicia

```bash
# Verificar Docker Desktop está corriendo
docker --version

# Limpiar contenedores antiguos
docker-compose down -v
docker system prune -a
```

### Error de conexión a BD

```bash
# Verificar que el contenedor de BD está corriendo
docker-compose ps

# Ver logs de BD
docker-compose logs db
```

### Puerto en uso

```bash
# Cambiar puertos en docker-compose.yml
# Por ejemplo: "3001:3000" en lugar de "3000:3000"
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar documentación
2. Consultar logs: `docker-compose logs -f`
3. Verificar .env está configurado correctamente

## 📄 Licencia

Proyecto privado - CRM Talleres

## 👥 Equipo de Desarrollo

- Backend: Python/FastAPI
- Frontend: React
- Base de Datos: MariaDB
- DevOps: Docker

---

**Versión**: 1.0.0  
**Última actualización**: 22/01/2026
