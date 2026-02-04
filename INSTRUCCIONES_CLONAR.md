# 📋 Instrucciones para Clonar y Ejecutar el Proyecto en Otra PC

## ✅ Cambios Realizados Hoy (03/02/2026)

### 🆕 Nuevos Módulos Implementados:
1. **Clientes** - Gestión completa de clientes (Persona Física/Moral)
2. **Órdenes de Trabajo** - Sistema completo para taller de torno
3. **Vacaciones** - Gestión de solicitudes de vacaciones con PDF

### 🔧 Funcionalidades Agregadas:
- Sistema de captura de fotos (cámara y archivo)
- Generación automática de número de permiso/OC
- Cliente General y captura rápida de clientes
- Autocomplete con búsqueda en selector de clientes
- 21 categorías de servicios de torno con subcategorías
- Tabs scrolleables en móvil
- Dashboard mejorado (cards clickeables, panel colapsable)

---

## 🚀 Pasos para Clonar y Ejecutar

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/dev-eduardof/CRM-Proyecto.git
cd CRM-Proyecto
git checkout desarrollo
```

### 2️⃣ Crear Archivo `.env` en la Raíz

**⚠️ IMPORTANTE:** Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Database Configuration
DB_ROOT_PASSWORD=Hesoyam21
DB_NAME=crm_talleres
DB_USER=crm_user
DB_PASSWORD=tH9qaLh6v5KMNyQ3b8GWjZlX

# Backend Configuration
SECRET_KEY=H0Vpq@-g!vAn*cyS5QkTuMoJd9?G7xERZ4FIjemKL+lsUzw6%Y&XriONC1P=#3B8
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend Configuration
VITE_API_URL=http://localhost:8000
```

### 3️⃣ Crear Archivo `.env` en Frontend (Opcional)

Si quieres ejecutar el frontend sin Docker, crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

**Nota:** Si usas Docker, esto no es necesario porque `docker-compose.yml` ya tiene la variable configurada.

### 4️⃣ Levantar el Proyecto con Docker

```bash
# Opción 1: Usar el script de PowerShell (Windows)
.\start_proyecto.ps1

# Opción 2: Comandos manuales
docker-compose up -d
```

### 5️⃣ Ejecutar Scripts SQL Iniciales

**⚠️ IMPORTANTE:** Ejecuta estos scripts en orden para crear las categorías de torno:

```bash
# 1. Crear tablas de categorías y subcategorías
docker exec -i crm_db mysql -uroot -pHesoyam21 crm_talleres < database/create_categorias_subtareas.sql

# 2. Actualizar con categorías de torno
docker exec -i crm_db mysql -uroot -pHesoyam21 crm_talleres < database/update_categorias_torno.sql
```

### 6️⃣ Verificar que Todo Funciona

```bash
# Ver logs del backend
docker logs crm_backend --tail 50

# Ver logs del frontend
docker logs crm_frontend --tail 50

# Verificar que todos los contenedores están corriendo
docker ps
```

Deberías ver:
- ✅ `crm_db` (MariaDB)
- ✅ `crm_backend` (FastAPI)
- ✅ `crm_frontend` (React/Vite)
- ✅ `crm_adminer` (Administrador de BD)

### 7️⃣ Acceder a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs
- **Adminer (BD):** http://localhost:8080

**Credenciales de Login:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📝 Cambios en Variables de Entorno

### ✅ Variables Nuevas Agregadas:

#### En `.env` (raíz):
```env
VITE_API_URL=http://localhost:8000  # ← NUEVA
```

Esta variable se usa en `docker-compose.yml` para configurar el frontend.

#### En `docker-compose.yml`:
```yaml
frontend:
  environment:
    VITE_API_URL: http://localhost:8000  # ← NUEVA
```

### ⚠️ Cambios Importantes:

1. **Eliminado hardcodeo de localhost** en `frontend/src/services/api.js`
2. **Ahora usa variable de entorno:** `import.meta.env.VITE_API_URL`
3. **Para producción:** Solo cambia `VITE_API_URL` a tu dominio

---

## 🗄️ Estructura de Base de Datos

### Tablas Nuevas:
- `clientes` - Información de clientes
- `ordenes_trabajo` - Órdenes de trabajo del taller
- `categorias_orden` - Categorías de servicios (21 categorías)
- `subcategorias_orden` - Subcategorías de servicios
- `subtareas_orden` - Subtareas de las órdenes
- `solicitudes_vacaciones` - Solicitudes de vacaciones

### Cliente General Creado:
- ID: 4
- Nombre: CLIENTE GENERAL
- RFC: XAXX010101000
- Teléfono: 0000000000

---

## 🐛 Solución de Problemas Comunes

### Problema: "Error al cargar las órdenes"
**Solución:** Ejecuta los scripts SQL de categorías (paso 5)

### Problema: "Error al iniciar sesión"
**Solución:** Verifica que el archivo `.env` esté en la raíz con las variables correctas

### Problema: "No aparecen los clientes"
**Solución:** Ya está corregido en esta versión. Las rutas de API están correctas.

### Problema: Pantalla en blanco al crear orden
**Solución:** Ya está corregido. El schema de `tipo_permiso` ahora usa el enum correcto.

---

## 📦 Archivos que NO se Suben a Git

Los siguientes archivos NO están en el repositorio (están en `.gitignore`):
- `.env` (raíz)
- `frontend/.env`
- `backend/venv/`
- `frontend/node_modules/`
- `uploads/` (archivos subidos)

**Por eso debes crearlos manualmente** siguiendo el paso 2.

---

## 🎯 Resumen de Comandos Rápidos

```bash
# 1. Clonar
git clone https://github.com/dev-eduardof/CRM-Proyecto.git
cd CRM-Proyecto
git checkout desarrollo

# 2. Crear .env (copiar el contenido de arriba)

# 3. Levantar Docker
docker-compose up -d

# 4. Ejecutar scripts SQL
docker exec -i crm_db mysql -uroot -pHesoyam21 crm_talleres < database/create_categorias_subtareas.sql
docker exec -i crm_db mysql -uroot -pHesoyam21 crm_talleres < database/update_categorias_torno.sql

# 5. Abrir en navegador
# http://localhost:3000
```

---

## ✨ Listo!

Ahora deberías tener el proyecto funcionando exactamente igual que en esta PC.

**Usuario de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

**Módulos disponibles:**
- ✅ Dashboard
- ✅ Gestión de Usuarios
- ✅ Clientes
- ✅ Órdenes de Trabajo
- ✅ Vacaciones

---

**Última actualización:** 03/02/2026
**Rama:** desarrollo
**Commit:** 9799ee0
