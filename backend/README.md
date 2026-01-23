# Backend - CRM Talleres

Backend API desarrollado con FastAPI para el sistema de gestión de talleres.

## 🚀 Tecnologías

- **FastAPI** - Framework web moderno y rápido
- **SQLAlchemy** - ORM para Python
- **MariaDB** - Base de datos relacional
- **Pydantic** - Validación de datos
- **JWT** - Autenticación
- **Alembic** - Migraciones de base de datos

## 📁 Estructura

```
backend/
├── app/
│   ├── api/            # Endpoints de la API
│   ├── core/           # Configuración y seguridad
│   ├── models/         # Modelos SQLAlchemy
│   ├── schemas/        # Schemas Pydantic
│   ├── services/       # Servicios (email, whatsapp, pdf)
│   ├── config.py       # Configuración
│   ├── database.py     # Conexión a BD
│   └── main.py         # Punto de entrada
├── tests/              # Tests
├── Dockerfile          # Docker configuration
└── requirements.txt    # Dependencias Python
```

## 🛠️ Instalación Local (sin Docker)

### 1. Crear entorno virtual

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar:

```env
DATABASE_URL=mysql+pymysql://crm_user:password@localhost/crm_talleres
SECRET_KEY=tu-secret-key-super-segura
```

### 4. Ejecutar servidor

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🐳 Instalación con Docker

Desde la raíz del proyecto:

```bash
docker-compose up -d backend
```

## 📚 Documentación API

Una vez el servidor esté corriendo:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Tests

```bash
pytest
```

## 📝 Migraciones

```bash
# Crear migración
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head

# Revertir migración
alembic downgrade -1
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación.

### Obtener token:

```bash
POST /api/v1/auth/login
{
  "username": "usuario",
  "password": "password"
}
```

### Usar token:

```bash
Authorization: Bearer <token>
```

## 📦 Endpoints Principales

- `/api/v1/auth` - Autenticación
- `/api/v1/users` - Usuarios
- `/api/v1/clients` - Clientes
- `/api/v1/ordenes` - Órdenes de trabajo
- `/api/v1/pagos` - Pagos
- `/api/v1/reportes` - Reportes

## 🔧 Desarrollo

### Agregar nuevo endpoint:

1. Crear modelo en `app/models/`
2. Crear schema en `app/schemas/`
3. Crear router en `app/api/v1/`
4. Incluir router en `app/main.py`

### Ejemplo:

```python
# app/api/v1/ejemplo.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_ejemplos():
    return {"message": "Lista de ejemplos"}
```

## 📄 Licencia

Proyecto privado - CRM Talleres
