# 🚀 INICIO RÁPIDO - CRM TALLERES

## ⚡ Opción 1: Docker (Recomendado)

### 1. Verificar Docker
```powershell
docker --version
docker-compose --version
```

### 2. Configurar variables de entorno
```powershell
# Copiar archivo de ejemplo
copy .env.example .env

# Editar .env (opcional, funciona con valores por defecto)
```

### 3. Iniciar proyecto
```powershell
# Opción A: Usar script
.\start.ps1

# Opción B: Comando directo
docker-compose up -d
```

### 4. Acceder a servicios
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs
- 💾 **Adminer (BD)**: http://localhost:8080

### 5. Credenciales por defecto
- **Usuario**: admin
- **Password**: admin123

---

## 🛠️ Opción 2: Instalación Local

### Backend
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### Frontend
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

### Base de Datos
```sql
mysql -u root -p
CREATE DATABASE crm_talleres;
USE crm_talleres;
SOURCE database/schema.sql;
```

---

## 📋 Comandos Útiles

### Docker
```powershell
# Ver logs
docker-compose logs -f

# Reiniciar servicio
docker-compose restart backend

# Detener todo
docker-compose down

# Limpiar todo
docker-compose down -v
```

### Git
```powershell
# Estado
git status

# Commit
git add .
git commit -m "mensaje"

# Push
git push origin desarrollo
```

---

## 🐛 Solución Rápida de Problemas

### Docker no inicia
```powershell
# Verificar Docker Desktop está corriendo
docker ps

# Limpiar y reiniciar
docker-compose down -v
docker-compose up -d
```

### Puerto ocupado
```powershell
# Ver qué usa el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Matar proceso (reemplaza PID)
taskkill /PID <numero> /F
```

### Error de conexión a BD
```powershell
# Ver logs de base de datos
docker-compose logs db

# Reiniciar BD
docker-compose restart db
```

---

## 📁 Estructura del Proyecto

```
CRM-Proyecto/
├── backend/           ← FastAPI (Python)
├── frontend/          ← React (JavaScript)
├── database/          ← Scripts SQL
├── uploads/           ← Archivos subidos
├── docker-compose.yml ← Configuración Docker
├── .env               ← Variables de entorno
└── start.ps1          ← Script de inicio
```

---

## 🎯 Próximos Pasos

1. ✅ Iniciar servicios con Docker
2. ✅ Acceder a http://localhost:3000
3. ✅ Login con admin/admin123
4. ✅ Explorar API en http://localhost:8000/docs
5. ✅ Comenzar desarrollo en rama `desarrollo`

---

## 📚 Documentación Completa

- [README Principal](README.md)
- [Guía de Inicio Detallada](GUIA_INICIO_PROYECTO.md)
- [Estructura Técnica](ESTRUCTURA_TECNICA_CRM.html)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

---

**¿Problemas?** Revisa los logs: `docker-compose logs -f`
