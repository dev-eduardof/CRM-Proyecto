# 🐳 GUÍA DE USO CON DOCKER

## ✅ ESTADO ACTUAL: DOCKER OPERATIVO

El proyecto CRM Talleres está corriendo completamente en contenedores Docker.

---

## 🚀 SERVICIOS ACTIVOS

### Contenedores corriendo:
- ✅ **crm_db** - MariaDB 10.6 (puerto 3306)
- ✅ **crm_backend** - FastAPI (puerto 8000)
- ✅ **crm_frontend** - React/Vite (puerto 3000)
- ✅ **crm_adminer** - Adminer (puerto 8080)

---

## 📋 COMANDOS PRINCIPALES

### Iniciar el proyecto
```powershell
docker compose up -d
```

### Detener el proyecto
```powershell
docker compose down
```

### Ver estado de contenedores
```powershell
docker compose ps
```

### Ver logs
```powershell
# Todos los servicios
docker compose logs

# Un servicio específico
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Seguir logs en tiempo real
docker compose logs -f backend
```

### Reiniciar servicios
```powershell
# Reiniciar todo
docker compose restart

# Reiniciar un servicio específico
docker compose restart backend
docker compose restart frontend
```

### Detener y eliminar todo (incluyendo volúmenes)
```powershell
docker compose down -v
```

---

## 🌐 URLS DE ACCESO

### Aplicación:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Administración:
- **Adminer** (gestor de BD): http://localhost:8080
  - Sistema: MySQL
  - Servidor: db
  - Usuario: crm_user
  - Password: tH9qaLh6v5KMNyQ3b8GWjZlX
  - Base de datos: crm_talleres

---

## 🔑 CREDENCIALES

### Base de Datos:
- **Host**: localhost (o `db` desde otros contenedores)
- **Puerto**: 3306
- **Base de datos**: crm_talleres
- **Usuario**: crm_user
- **Password**: tH9qaLh6v5KMNyQ3b8GWjZlX
- **Root Password**: Hesoyam21

### Aplicación:
- **Usuario**: admin
- **Password**: admin123

---

## 🛠️ COMANDOS ÚTILES

### Acceder a un contenedor
```powershell
# Backend (Python)
docker compose exec backend bash

# Frontend (Node)
docker compose exec frontend sh

# Base de datos
docker compose exec db bash
```

### Ejecutar comandos en contenedores
```powershell
# Ejecutar migraciones en backend
docker compose exec backend alembic upgrade head

# Instalar dependencia en backend
docker compose exec backend pip install nombre-paquete

# Instalar dependencia en frontend
docker compose exec frontend npm install nombre-paquete
```

### Conectar a la base de datos
```powershell
# Desde PowerShell
docker compose exec db mysql -u crm_user -ptH9qaLh6v5KMNyQ3b8GWjZlX crm_talleres

# Como root
docker compose exec db mysql -u root -pHesoyam21
```

### Ver uso de recursos
```powershell
docker stats
```

---

## 🔄 ACTUALIZAR CÓDIGO

### Backend:
Los cambios en `backend/` se reflejan automáticamente gracias al hot-reload de uvicorn.

### Frontend:
Los cambios en `frontend/` se reflejan automáticamente gracias al hot-reload de Vite.

### Si necesitas reconstruir las imágenes:
```powershell
# Reconstruir todo
docker compose up -d --build

# Reconstruir un servicio específico
docker compose up -d --build backend
docker compose up -d --build frontend
```

---

## 🗄️ GESTIÓN DE BASE DE DATOS

### Backup de la base de datos
```powershell
docker compose exec db mysqldump -u root -pHesoyam21 crm_talleres > backup.sql
```

### Restaurar backup
```powershell
Get-Content backup.sql | docker compose exec -T db mysql -u root -pHesoyam21 crm_talleres
```

### Reiniciar base de datos (CUIDADO: elimina datos)
```powershell
docker compose down -v
docker compose up -d
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Contenedor no inicia
```powershell
# Ver logs del contenedor
docker compose logs nombre_servicio

# Ejemplo:
docker compose logs backend
```

### Puerto ocupado
```powershell
# Ver qué usa el puerto
netstat -ano | findstr :8000

# Detener contenedores
docker compose down

# Cambiar puerto en docker-compose.yml si es necesario
```

### Cambios no se reflejan
```powershell
# Reconstruir imágenes
docker compose up -d --build
```

### Error de permisos en volúmenes
```powershell
# Detener todo
docker compose down -v

# Limpiar volúmenes
docker volume prune

# Reiniciar
docker compose up -d
```

### Base de datos no conecta
```powershell
# Verificar salud del contenedor
docker compose ps

# Ver logs
docker compose logs db

# Esperar a que esté healthy
docker compose up -d
```

---

## 📊 ESTRUCTURA DE VOLÚMENES

### Volúmenes persistentes:
- **db_data**: Datos de MariaDB (persiste entre reinicios)
- **uploads**: Archivos subidos (mapeado a ./uploads)

### Volúmenes de código (bind mounts):
- **./backend**: Código del backend
- **./frontend**: Código del frontend
- **./database**: Scripts SQL

---

## 🔧 DESARROLLO

### Modo desarrollo (actual):
```powershell
docker compose up -d
```
- Hot-reload activado
- Logs en tiempo real
- Código mapeado desde host

### Modo producción (futuro):
```powershell
docker compose -f docker-compose.prod.yml up -d
```
- Sin hot-reload
- Optimizado para performance
- Variables de entorno de producción

---

## 📝 NOTAS IMPORTANTES

1. **Hot Reload**: Los cambios en el código se reflejan automáticamente
2. **Volúmenes**: Los datos de la BD persisten entre reinicios
3. **Network**: Todos los contenedores están en la misma red
4. **Healthcheck**: La BD tiene healthcheck, otros servicios esperan a que esté lista
5. **Adminer**: Útil para gestionar la BD visualmente

---

## 🎯 COMANDOS RÁPIDOS

```powershell
# Iniciar
docker compose up -d

# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Detener
docker compose down

# Reiniciar
docker compose restart

# Reconstruir
docker compose up -d --build
```

---

## 🆚 DOCKER vs LOCAL

### Ventajas de Docker:
✅ Todo en contenedores aislados
✅ Fácil de iniciar/detener
✅ No contamina el sistema
✅ Mismo entorno en todos lados
✅ Adminer incluido

### Ventajas de Local:
✅ Más rápido para desarrollo
✅ Menos consumo de recursos
✅ Acceso directo a archivos
✅ Debugging más fácil

---

## 🔄 CAMBIAR ENTRE DOCKER Y LOCAL

### De Docker a Local:
```powershell
# Detener Docker
docker compose down

# Iniciar local
.\start_proyecto.ps1
```

### De Local a Docker:
```powershell
# Cerrar ventanas de PowerShell del proyecto local

# Iniciar Docker
docker compose up -d
```

---

## 📚 RECURSOS

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [FastAPI con Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [React con Docker](https://mherman.org/blog/dockerizing-a-react-app/)

---

**Última actualización**: 22/01/2026  
**Docker Compose**: v5.0.1  
**Estado**: ✅ OPERATIVO
