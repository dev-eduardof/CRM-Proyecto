# 🚀 Inicio Rápido con Docker

## ⚡ Instalación en 3 Pasos

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/dev-eduardof/CRM-Proyecto.git
cd CRM-Proyecto
git checkout desarrollo
```

### 2️⃣ Configurar Variables de Entorno

**Opción A: Usar valores por defecto (desarrollo)**

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

**Opción B: Personalizar (recomendado para producción)**

Edita el archivo `.env` y cambia los valores:

```env
# Database
DB_ROOT_PASSWORD=TU_PASSWORD_SEGURO_AQUI
DB_NAME=crm_talleres
DB_USER=crm_user
DB_PASSWORD=TU_PASSWORD_USUARIO_AQUI

# Backend
SECRET_KEY=GENERA_UNA_CLAVE_SECRETA_MUY_LARGA_Y_SEGURA
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
VITE_API_URL=http://localhost:8000
```

### 3️⃣ Iniciar el Proyecto

```bash
docker-compose up -d
```

**¡Eso es todo! 🎉**

---

## 🌐 Acceder a la Aplicación

Espera unos 30-60 segundos para que todos los servicios inicien, luego accede a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| 🎨 **Frontend** | http://localhost:3000 | Interfaz de usuario |
| 🔧 **Backend API** | http://localhost:8000 | API REST |
| 📚 **API Docs** | http://localhost:8000/docs | Documentación interactiva |
| 🗄️ **Adminer** | http://localhost:8080 | Administrador de base de datos |

---

## 🔐 Credenciales Iniciales

### Aplicación Web
- **Usuario**: `ADMIN`
- **Contraseña**: `admin123`

### Base de Datos (Adminer)
- **Sistema**: `MySQL`
- **Servidor**: `db`
- **Usuario**: `root`
- **Contraseña**: (la que configuraste en `.env` como `DB_ROOT_PASSWORD`)
- **Base de datos**: `crm_talleres`

---

## ✅ Verificar que Todo Funciona

### Ver estado de los contenedores

```bash
docker-compose ps
```

Deberías ver algo como:

```
NAME                    STATUS              PORTS
crm-proyecto-backend    Up 2 minutes        0.0.0.0:8000->8000/tcp
crm-proyecto-frontend   Up 2 minutes        0.0.0.0:3000->3000/tcp
crm-proyecto-db         Up 2 minutes        0.0.0.0:3306->3306/tcp
crm-proyecto-adminer    Up 2 minutes        0.0.0.0:8080->8080/tcp
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Solo un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

---

## 🛠️ Comandos Útiles

### Detener el proyecto

```bash
docker-compose down
```

### Reiniciar el proyecto

```bash
docker-compose restart
```

### Reconstruir los contenedores (después de cambios en el código)

```bash
docker-compose up -d --build
```

### Detener y eliminar TODO (incluyendo base de datos)

⚠️ **CUIDADO**: Esto eliminará todos los datos

```bash
docker-compose down -v
```

### Ver logs de un servicio específico

```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### Acceder al contenedor de backend

```bash
docker-compose exec backend bash
```

### Acceder al contenedor de frontend

```bash
docker-compose exec frontend sh
```

### Acceder a MySQL desde la terminal

```bash
docker-compose exec db mysql -u root -p
```

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "port is already allocated"

**Problema**: Un puerto ya está en uso.

**Solución**:

```bash
# Windows - Ver qué proceso usa el puerto 3000
netstat -ano | findstr :3000

# Linux/Mac - Ver qué proceso usa el puerto 3000
lsof -i :3000

# Detener el proceso o cambiar el puerto en docker-compose.yml
```

### ❌ Error: "Cannot connect to the Docker daemon"

**Problema**: Docker no está corriendo.

**Solución**:
- Inicia Docker Desktop (Windows/Mac)
- Inicia el servicio Docker (Linux): `sudo systemctl start docker`

### ❌ Frontend muestra "Network Error"

**Problema**: El backend no está listo o hay un problema de CORS.

**Solución**:

```bash
# Ver logs del backend
docker-compose logs backend

# Reiniciar el backend
docker-compose restart backend

# Esperar 30 segundos e intentar de nuevo
```

### ❌ Base de datos no se conecta

**Problema**: MariaDB aún está iniciando.

**Solución**:

```bash
# Ver logs de la base de datos
docker-compose logs db

# Esperar a ver el mensaje: "ready for connections"
# Luego reiniciar el backend
docker-compose restart backend
```

### 🔄 Resetear completamente el proyecto

Si algo sale muy mal:

```bash
# 1. Detener todo
docker-compose down -v

# 2. Eliminar imágenes (opcional)
docker-compose down --rmi all

# 3. Limpiar Docker (opcional)
docker system prune -a

# 4. Iniciar de nuevo
docker-compose up -d --build
```

---

## 📊 Verificar que la Base de Datos Está Lista

### Opción 1: Desde Adminer
1. Ve a http://localhost:8080
2. Ingresa las credenciales
3. Deberías ver la base de datos `crm_talleres`
4. Verifica que existe la tabla `usuarios`

### Opción 2: Desde la terminal

```bash
docker-compose exec db mysql -u root -p -e "USE crm_talleres; SHOW TABLES;"
```

Deberías ver:

```
+-------------------------+
| Tables_in_crm_talleres  |
+-------------------------+
| usuarios                |
+-------------------------+
```

---

## 🔒 Primer Inicio de Sesión

1. Ve a http://localhost:3000
2. Ingresa:
   - **Usuario**: `ADMIN`
   - **Contraseña**: `admin123`
3. Deberías ver el Dashboard
4. **IMPORTANTE**: Ve a "Usuarios" y cambia la contraseña del administrador

---

## 📦 Estructura de Contenedores

```
┌─────────────────────────────────────────────┐
│           Docker Compose Network            │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Frontend │  │ Backend  │  │ MariaDB  │ │
│  │  React   │◄─┤  FastAPI │◄─┤   DB     │ │
│  │  :3000   │  │  :8000   │  │  :3306   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ┌──────────┐                               │
│  │ Adminer  │                               │
│  │  :8080   │◄──────────────────────────┐  │
│  └──────────┘                            │  │
│                                          │  │
└──────────────────────────────────────────┼──┘
                                           │
                                    ┌──────▼──────┐
                                    │   Usuario   │
                                    │  (Browser)  │
                                    └─────────────┘
```

---

## 🎯 Próximos Pasos

1. ✅ Iniciar sesión con las credenciales por defecto
2. ✅ Cambiar la contraseña del administrador
3. ✅ Explorar el panel de usuarios
4. ✅ Crear nuevos usuarios con diferentes roles
5. ✅ Revisar la documentación API en http://localhost:8000/docs

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica que todos los contenedores estén corriendo: `docker-compose ps`
3. Consulta la sección de "Solución de Problemas" arriba
4. Revisa el archivo `README.md` completo para más detalles

---

**¡Disfruta tu CRM! 🚗💨**
