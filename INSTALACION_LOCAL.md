# 📦 INSTALACIÓN LOCAL - CRM TALLERES

## ✅ Estado Actual

### Completado:
- ✅ MariaDB instalado y configurado
- ✅ Base de datos `crm_talleres` creada
- ✅ Usuario `crm_user` creado
- ✅ Schema de base de datos importado
- ✅ Python 3.12 instalado
- ✅ Backend configurado (entorno virtual creado)
- ✅ Dependencias de Python instaladas
- ✅ Archivo `.env` configurado

### Pendiente:
- ⏳ Node.js (para el frontend)
- ⏳ Iniciar backend correctamente
- ⏳ Instalar dependencias del frontend
- ⏳ Iniciar frontend

---

## 🔧 PASOS SIGUIENTES

### 1. Instalar Node.js

#### Opción A: Descargar desde el sitio oficial
1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (recomendada)
3. Ejecuta el instalador
4. Sigue las instrucciones
5. Reinicia PowerShell

#### Opción B: Usar winget (Windows 11)
```powershell
winget install OpenJS.NodeJS.LTS
```

#### Verificar instalación:
```powershell
node --version
npm --version
```

---

### 2. Iniciar el Backend

```powershell
# Navegar a la carpeta backend
cd backend

# Ejecutar script de inicio
.\start_backend.ps1
```

El backend estará disponible en:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

---

### 3. Configurar el Frontend

**En una nueva terminal PowerShell:**

```powershell
# Navegar a la carpeta frontend
cd frontend

# Instalar dependencias
npm install

# Copiar archivo .env
copy ..\.env .env

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en:
- **App**: http://localhost:3000

---

## 📋 CREDENCIALES

### Base de Datos:
- **Host**: localhost
- **Puerto**: 3306
- **Base de datos**: crm_talleres
- **Usuario**: crm_user
- **Password**: tH9qaLh6v5KMNyQ3b8GWjZlX
- **Root Password**: Hesoyam21

### Usuario Admin (aplicación):
- **Username**: admin
- **Password**: admin123

---

## 🚀 INICIO RÁPIDO

### Terminal 1 - Backend:
```powershell
cd "G:\CRM Proyecto\backend"
.\start_backend.ps1
```

### Terminal 2 - Frontend:
```powershell
cd "G:\CRM Proyecto\frontend"
npm run dev
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Backend no inicia

**Error: "No module named 'app'"**
```powershell
# Asegúrate de estar en la carpeta backend
cd backend

# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Verificar que existe app/main.py
ls app\main.py

# Iniciar servidor
python -m uvicorn app.main:app --reload
```

**Error: "Cannot connect to database"**
```powershell
# Verificar que MariaDB está corriendo
# Busca "MariaDB" en Servicios de Windows

# O desde PowerShell:
Get-Service | Where-Object {$_.Name -like "*maria*"}

# Iniciar servicio si está detenido:
Start-Service MariaDB
```

### Frontend no inicia

**Error: "node: command not found"**
- Instala Node.js (ver paso 1 arriba)
- Reinicia PowerShell después de instalar

**Error: "Cannot find module"**
```powershell
# Eliminar node_modules y reinstalar
Remove-Item -Recurse -Force node_modules
npm install
```

### Puerto ocupado

**Backend (Puerto 8000):**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8000

# Matar proceso (reemplaza PID con el número que aparece)
taskkill /PID <numero> /F
```

**Frontend (Puerto 3000):**
```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar proceso
taskkill /PID <numero> /F
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
G:\CRM Proyecto\
├── backend/
│   ├── venv/                    ← Entorno virtual Python
│   ├── app/                     ← Código del backend
│   ├── start_backend.ps1        ← Script de inicio
│   ├── requirements.txt         ← Dependencias
│   └── .env                     ← Variables de entorno
│
├── frontend/
│   ├── src/                     ← Código del frontend
│   ├── package.json             ← Dependencias Node
│   └── .env                     ← Variables de entorno
│
├── database/
│   ├── schema.sql               ← Schema de BD (ya importado)
│   └── setup.sql                ← Script de configuración
│
└── .env                         ← Variables de entorno principal
```

---

## ✅ CHECKLIST DE INSTALACIÓN

### Base de Datos:
- [x] MariaDB instalado
- [x] Base de datos creada
- [x] Usuario creado
- [x] Schema importado
- [x] Datos iniciales cargados

### Backend:
- [x] Python instalado
- [x] Entorno virtual creado
- [x] Dependencias instaladas
- [x] Archivo .env configurado
- [ ] Servidor iniciado

### Frontend:
- [ ] Node.js instalado
- [ ] Dependencias instaladas (npm install)
- [ ] Archivo .env configurado
- [ ] Servidor iniciado

---

## 🎯 PRÓXIMOS PASOS

1. **Instalar Node.js** (si no está instalado)
2. **Abrir 2 terminales PowerShell**
3. **Terminal 1**: Iniciar backend
4. **Terminal 2**: Instalar dependencias e iniciar frontend
5. **Acceder a http://localhost:3000**
6. **Login con admin/admin123**

---

## 📞 COMANDOS ÚTILES

### Backend:
```powershell
# Activar entorno virtual
cd backend
.\venv\Scripts\Activate.ps1

# Instalar nueva dependencia
pip install nombre-paquete

# Ver dependencias instaladas
pip list

# Actualizar requirements.txt
pip freeze > requirements.txt
```

### Frontend:
```powershell
# Instalar dependencia
npm install nombre-paquete

# Actualizar dependencias
npm update

# Limpiar caché
npm cache clean --force
```

### Base de Datos:
```powershell
# Conectar a MariaDB
& "C:\Program Files\MariaDB 12.1\bin\mysql.exe" -u root -pHesoyam21

# Conectar a base de datos específica
& "C:\Program Files\MariaDB 12.1\bin\mysql.exe" -u crm_user -ptH9qaLh6v5KMNyQ3b8GWjZlX crm_talleres

# Backup de base de datos
& "C:\Program Files\MariaDB 12.1\bin\mysqldump.exe" -u root -pHesoyam21 crm_talleres > backup.sql

# Restaurar backup
& "C:\Program Files\MariaDB 12.1\bin\mysql.exe" -u root -pHesoyam21 crm_talleres < backup.sql
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

- [README Principal](README.md)
- [QUICK_START](QUICK_START.md)
- [GUIA_INICIO_PROYECTO](GUIA_INICIO_PROYECTO.md)
- [RESUMEN_ESTRUCTURA](RESUMEN_ESTRUCTURA.md)

---

**Última actualización**: 22/01/2026  
**Versión**: 1.0.0 - Instalación Local
