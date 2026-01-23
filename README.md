# 🚗 Sistema CRM para Talleres

Sistema de gestión de relaciones con clientes (CRM) diseñado específicamente para talleres mecánicos.

## 📋 Requisitos Previos

- **Git** instalado
- **Docker** y **Docker Compose** instalados
- Puertos disponibles: `3000` (Frontend), `8000` (Backend), `3306` (MariaDB), `8080` (Adminer)

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/eduardofelixlopez/CRM-Proyecto.git
cd CRM-Proyecto
```

### 2. Configurar Variables de Entorno

Crea el archivo `.env` en la raíz del proyecto:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Edita el archivo `.env` con tus valores (o usa los valores por defecto para desarrollo):

```env
# Database
MYSQL_ROOT_PASSWORD=tu_password_seguro
MYSQL_DATABASE=crm_talleres
MYSQL_USER=crm_user
MYSQL_PASSWORD=tu_password_usuario

# Backend
DATABASE_URL=mysql+pymysql://crm_user:tu_password_usuario@db:3306/crm_talleres
SECRET_KEY=tu_clave_secreta_muy_larga_y_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
REACT_APP_API_URL=http://localhost:8000
```

### 3. Iniciar el Proyecto con Docker

```bash
docker-compose up -d
```

Este comando iniciará:
- 🗄️ **MariaDB** en el puerto `3306`
- 🐍 **Backend (FastAPI)** en el puerto `8000`
- ⚛️ **Frontend (React)** en el puerto `3000`
- 🔧 **Adminer** en el puerto `8080`

### 4. Verificar que Todo Esté Funcionando

```bash
docker-compose ps
```

Deberías ver todos los servicios en estado `Up`.

### 5. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Adminer (DB Manager)**: http://localhost:8080

### 6. Credenciales Iniciales

**Usuario Administrador por defecto:**
- **Usuario**: `ADMIN`
- **Contraseña**: `admin123`

⚠️ **IMPORTANTE**: Cambia estas credenciales después del primer inicio de sesión.

## 📦 Estructura del Proyecto

```
CRM-Proyecto/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints
│   │   ├── core/           # Configuración y seguridad
│   │   ├── models/         # Modelos de base de datos
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── services/       # Lógica de negocio
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── contexts/      # Context API
│   │   ├── pages/         # Páginas principales
│   │   └── services/      # Servicios API
│   ├── package.json
│   └── Dockerfile
├── database/              # Scripts SQL
├── docs/                  # Documentación
├── docker-compose.yml
└── .env.example
```

## 🛠️ Comandos Útiles

### Ver logs de los servicios

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### Detener los servicios

```bash
docker-compose down
```

### Detener y eliminar volúmenes (⚠️ elimina la base de datos)

```bash
docker-compose down -v
```

### Reiniciar un servicio específico

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Reconstruir los contenedores

```bash
docker-compose up -d --build
```

### Acceder a la base de datos

```bash
docker-compose exec db mysql -u root -p
```

## 🔧 Instalación Local (Sin Docker)

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

# Configurar .env (ajustar DATABASE_URL para tu MySQL local)

# Iniciar servidor
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

### Base de Datos

```bash
# Crear base de datos
mysql -u root -p

CREATE DATABASE crm_talleres;

# Ejecutar script de inicialización
mysql -u root -p crm_talleres < database/init.sql
```

## 👥 Roles de Usuario

El sistema incluye los siguientes roles:

- **ADMIN**: Administrador con acceso total
- **TECNICO**: Técnico mecánico
- **RECEPCION**: Personal de recepción
- **CAJA**: Cajero
- **AUXILIAR**: Personal auxiliar
- **JEFE_TALLER**: Jefe de taller

## 🔒 Seguridad

- Autenticación mediante JWT (JSON Web Tokens)
- Contraseñas hasheadas con bcrypt
- Protección CORS configurada
- Rutas protegidas por roles
- Validación de datos con Pydantic

## 📚 Documentación API

Una vez iniciado el backend, puedes acceder a la documentación interactiva:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐛 Solución de Problemas

### El contenedor de backend no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar que el puerto 8000 no esté en uso
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux/Mac
```

### El contenedor de frontend no inicia

```bash
# Ver logs detallados
docker-compose logs frontend

# Verificar que el puerto 3000 no esté en uso
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac
```

### Error de conexión a la base de datos

```bash
# Verificar que MariaDB esté corriendo
docker-compose ps

# Verificar logs de la base de datos
docker-compose logs db

# Reiniciar el servicio de base de datos
docker-compose restart db
```

### Resetear la base de datos

```bash
# Detener servicios
docker-compose down

# Eliminar volúmenes
docker volume rm crm-proyecto_mysql_data

# Iniciar nuevamente
docker-compose up -d
```

## 🔄 Ramas del Repositorio

- **main**: Rama de producción (estable)
- **desarrollo**: Rama de desarrollo (nuevas características)
- **testeo**: Rama de pruebas

## 📝 Contribuir

1. Clona el repositorio
2. Crea una rama desde `desarrollo`
3. Realiza tus cambios
4. Haz commit con mensajes descriptivos
5. Push a tu rama
6. Crea un Pull Request a `desarrollo`

## 📧 Contacto

Para soporte o consultas: eduardofelixlopez@gmail.com

## 📄 Licencia

Este proyecto es privado y de uso interno.

---

**¡Listo para usar! 🚀**
