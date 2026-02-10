# CRM Talleres - Sistema de Gestión

Sistema completo de CRM para gestión de talleres con módulos de clientes, órdenes de trabajo, sucursales, usuarios, vacaciones e incidencias.

## 🏗️ Arquitectura

- **Backend**: FastAPI (Python 3.11)
- **Frontend**: React + Vite + Material-UI
- **Base de datos**: MariaDB 10.6
- **Despliegue**: Docker + Docker Compose

## 🌍 Ambientes

```
desarrollo (local) → testeo/QA (local) → main (AWS Producción)
```

- **desarrollo**: Ambiente local de desarrollo con cambios frecuentes
- **testeo**: Ambiente local de QA para pruebas antes de producción
- **main**: Ambiente de producción en AWS con despliegue automático

## 🚀 CI/CD Pipeline

El proyecto cuenta con despliegue continuo automático a producción:

- **DEV y QA**: Ambientes locales usando Docker Compose
- **Producción**: Push a `main` → Despliega automáticamente a AWS

Ver [CICD_SETUP.md](CICD_SETUP.md) para configuración completa.

## 📋 Requisitos

### Para Desarrollo Local
- Docker y Docker Compose
- Git
- Node.js 18+ (opcional, para desarrollo frontend)
- Python 3.11+ (opcional, para desarrollo backend)

### Para Servidor de Producción
- 1 servidor AWS (producción)
- Ubuntu 22.04 LTS
- Docker y Docker Compose
- Ver [INFRAESTRUCTURA.md](INFRAESTRUCTURA.md)

## 🛠️ Instalación Local

```bash
# Clonar repositorio
git clone https://github.com/TU_REPO/crm-proyecto.git
cd crm-proyecto

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Iniciar con Docker
docker-compose up -d

# Acceder a:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
# Adminer: http://localhost:8080
```

## 📦 Despliegue

### Desarrollo y QA Local

```bash
# Iniciar ambiente local
docker-compose up -d

# Acceder a:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

### Configuración del Servidor de Producción

```bash
# Conectar al servidor AWS
ssh -i clave.pem ubuntu@IP_SERVIDOR

# Ejecutar setup
./setup-server.sh

# Clonar proyecto
cd ~/crm-proyecto
git clone https://github.com/TU_REPO/crm-proyecto.git .
git checkout main

# Configurar .env
nano .env

# Iniciar
./deploy.sh start
```

### Flujo de Trabajo

#### 1. Desarrollo Local
```bash
git checkout desarrollo
# Hacer cambios y probar localmente
docker-compose up -d
# Hacer pruebas
git add .
git commit -m "feat: nueva funcionalidad"
git push origin desarrollo
```

#### 2. QA Local
```bash
git checkout testeo
git merge desarrollo
# Probar en ambiente local de QA
docker-compose up -d
# Hacer pruebas de calidad
```

#### 3. Desplegar a Producción
```bash
# Opción A: Usar script (recomendado)
# Windows
.\scripts\promote-to-production.ps1

# Linux/Mac
./scripts/promote-to-production.sh

# Opción B: Manual
git checkout main
git merge testeo
git push origin main
# ✅ Se despliega automáticamente a AWS
```

## 🔧 Comandos Útiles

```bash
# Iniciar aplicación
./deploy.sh start

# Ver logs
./deploy.sh logs

# Ver estado
./deploy.sh status

# Reiniciar
./deploy.sh restart

# Detener
./deploy.sh stop

# Actualizar
./deploy.sh update

# Backup de BD
./deploy.sh backup

# Limpiar Docker
./deploy.sh clean
```

## 📁 Estructura del Proyecto

```
crm-proyecto/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── api/v1/      # Endpoints
│   │   ├── models/      # Modelos SQLAlchemy
│   │   ├── schemas/     # Schemas Pydantic
│   │   └── main.py      # Aplicación principal
│   ├── Dockerfile
│   └── Dockerfile.prod
├── frontend/            # Aplicación React
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas
│   │   └── services/    # Servicios API
│   ├── Dockerfile
│   └── Dockerfile.prod
├── database/            # Scripts SQL
├── scripts/             # Scripts de utilidad
├── config/              # Configuraciones por ambiente
├── .github/workflows/   # CI/CD
├── docker-compose.yml   # Desarrollo
├── docker-compose.prod.yml  # Producción
└── deploy.sh           # Script de despliegue
```

## 🔐 Configuración de Secrets

Ver [CICD_SETUP.md](CICD_SETUP.md) para configurar los secrets en GitHub.

## 📚 Documentación

- [CICD_SETUP.md](CICD_SETUP.md) - Configuración del pipeline CI/CD
- [INFRAESTRUCTURA.md](INFRAESTRUCTURA.md) - Especificaciones de servidores
- [config/](config/) - Ejemplos de configuración por ambiente

## 🧪 Testing

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## 📊 Monitoreo

- **Health check**: `/api/health`
- **Documentación API**: `/docs`
- **Logs**: `./deploy.sh logs`

## 🤝 Contribución

1. Crea una rama desde `desarrollo`
2. Haz tus cambios
3. Crea un Pull Request a `desarrollo`
4. Después de revisión, se mergea y despliega automáticamente

## 📝 Licencia

Privado - Todos los derechos reservados

## 👥 Equipo

- Desarrollo: [Tu equipo]
- DevOps: [Tu equipo]

## 🆘 Soporte

Para problemas o preguntas:
1. Revisa los logs: `./deploy.sh logs`
2. Consulta la documentación
3. Abre un issue en GitHub
