# 🔐 SISTEMA DE LOGIN - CRM TALLERES

## ✅ ESTADO: COMPLETAMENTE IMPLEMENTADO

El sistema de autenticación JWT está completamente funcional en backend y frontend.

---

## 🎯 CARACTERÍSTICAS IMPLEMENTADAS

### Backend (FastAPI)
- ✅ Modelo de Usuario con roles
- ✅ Autenticación JWT
- ✅ Endpoints de autenticación
- ✅ Protección de rutas
- ✅ Validación de tokens
- ✅ Gestión de roles

### Frontend (React)
- ✅ Context de autenticación
- ✅ Página de Login
- ✅ Dashboard
- ✅ Rutas protegidas
- ✅ Interceptores HTTP
- ✅ Manejo de sesión

---

## 🔑 CREDENCIALES DE PRUEBA

### Usuario Admin (ya existe en BD):
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: admin

---

## 🌐 URLS

### Backend:
- **API Docs**: http://localhost:8000/docs
- **Login**: POST http://localhost:8000/api/v1/auth/login
- **Register**: POST http://localhost:8000/api/v1/auth/register
- **Me**: GET http://localhost:8000/api/v1/auth/me

### Frontend:
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **Home**: http://localhost:3000 (redirige a dashboard)

---

## 📋 ROLES DISPONIBLES

### 1. Admin
- Acceso completo al sistema
- Gestión de usuarios
- Configuración del sistema
- Todos los módulos

### 2. Técnico
- Gestión de órdenes de trabajo
- Actualización de estatus
- Registro de materiales
- Panel de técnicos

### 3. Recepción
- Creación de órdenes
- Gestión de clientes
- Recepción de vehículos
- Consulta de estatus

---

## 🔐 FLUJO DE AUTENTICACIÓN

### 1. Login
```
Usuario ingresa credenciales
    ↓
Frontend envía POST /api/v1/auth/login
    ↓
Backend valida credenciales
    ↓
Backend genera token JWT
    ↓
Frontend guarda token en localStorage
    ↓
Frontend carga datos del usuario
    ↓
Redirige a /dashboard
```

### 2. Acceso a Rutas Protegidas
```
Usuario accede a ruta protegida
    ↓
ProtectedRoute verifica autenticación
    ↓
Si no hay token → Redirige a /login
    ↓
Si hay token → Carga componente
    ↓
Interceptor agrega token a peticiones
```

### 3. Logout
```
Usuario hace clic en "Cerrar Sesión"
    ↓
Frontend elimina token de localStorage
    ↓
Frontend limpia estado de usuario
    ↓
Redirige a /login
```

---

## 📁 ESTRUCTURA DE ARCHIVOS

### Backend:
```
backend/app/
├── models/
│   └── user.py              # Modelo de usuario
├── schemas/
│   └── user.py              # Schemas de validación
├── services/
│   └── auth_service.py      # Lógica de autenticación
├── core/
│   ├── security.py          # Funciones de seguridad
│   └── dependencies.py      # Dependencias de auth
├── api/v1/
│   └── auth.py              # Endpoints de autenticación
└── config.py                # Configuración (actualizado)
```

### Frontend:
```
frontend/src/
├── context/
│   └── AuthContext.jsx      # Context de autenticación
├── pages/
│   ├── Login.jsx            # Página de login
│   └── Dashboard.jsx        # Dashboard principal
├── components/
│   └── ProtectedRoute.jsx   # Componente de ruta protegida
├── services/
│   └── api.js               # Servicio API (actualizado)
└── App.jsx                  # Rutas principales (actualizado)
```

---

## 🔧 ENDPOINTS DE AUTENTICACIÓN

### 1. Login (Form Data)
```http
POST /api/v1/auth/login
Content-Type: multipart/form-data

username=admin&password=admin123
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 2. Login (JSON)
```http
POST /api/v1/auth/login/json
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 3. Registrar Usuario
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "nuevo_usuario",
  "email": "usuario@example.com",
  "nombre_completo": "Nombre Completo",
  "password": "password123",
  "rol": "RECEPCION"
}
```

### 4. Obtener Usuario Actual
```http
GET /api/v1/auth/me
Authorization: Bearer {token}
```

**Respuesta:**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@crm.com",
  "nombre_completo": "Administrador",
  "rol": "ADMIN",
  "activo": true,
  "created_at": "2026-01-22T00:00:00",
  "updated_at": null
}
```

### 5. Logout
```http
POST /api/v1/auth/logout
```

---

## 💻 USO EN FRONTEND

### 1. Usar el Context de Autenticación
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Hacer login
  const handleLogin = async () => {
    const result = await login('admin', 'admin123');
    if (result.success) {
      // Login exitoso
    } else {
      // Mostrar error: result.message
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user.nombre_completo}</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 2. Proteger Rutas
```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### 3. Hacer Peticiones Autenticadas
```javascript
import api from './services/api';

// El token se agrega automáticamente
const response = await api.get('/api/v1/clientes');
```

---

## 🔒 SEGURIDAD

### Token JWT
- **Algoritmo**: HS256
- **Expiración**: 30 minutos
- **Contenido**:
  - `sub`: username
  - `user_id`: ID del usuario
  - `rol`: Rol del usuario
  - `exp`: Fecha de expiración

### Passwords
- **Hash**: Bcrypt
- **Verificación**: Comparación segura
- **Mínimo**: 6 caracteres

### Protección
- ✅ CORS configurado
- ✅ Tokens en headers Authorization
- ✅ Validación de tokens en cada petición
- ✅ Verificación de usuario activo
- ✅ Verificación de roles

---

## 🧪 PROBAR EL SISTEMA

### 1. Desde el Frontend
```
1. Abre http://localhost:3000
2. Serás redirigido a /login
3. Ingresa: admin / admin123
4. Serás redirigido a /dashboard
5. Verás tu información de usuario
```

### 2. Desde la API Docs
```
1. Abre http://localhost:8000/docs
2. Busca POST /api/v1/auth/login
3. Click en "Try it out"
4. Ingresa: admin / admin123
5. Copia el access_token
6. Click en "Authorize" (arriba)
7. Pega el token
8. Ahora puedes probar endpoints protegidos
```

### 3. Desde cURL
```bash
# Login
curl -X POST "http://localhost:8000/api/v1/auth/login/json" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Obtener usuario (reemplaza TOKEN)
curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 ESTRUCTURA DE LA BASE DE DATOS

### Tabla: usuarios
```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('ADMIN', 'TECNICO', 'RECEPCION') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP
);
```

### Usuario por Defecto
```sql
INSERT INTO usuarios (
    username, 
    email, 
    nombre_completo, 
    password_hash, 
    rol, 
    activo
) VALUES (
    'admin',
    'admin@crm.com',
    'Administrador',
    '$2b$12$...',  -- Hash de 'admin123'
    'ADMIN',
    TRUE
);
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Usuario o contraseña incorrectos"
- Verifica que el usuario exista en la BD
- Verifica que la contraseña sea correcta
- Verifica que el usuario esté activo

### Error: "No se pudo validar las credenciales"
- Token expirado o inválido
- Token no enviado en el header
- SECRET_KEY diferente entre generación y validación

### Error: "Usuario inactivo"
- El usuario tiene `activo = FALSE` en la BD
- Actualiza: `UPDATE usuarios SET activo = TRUE WHERE username = 'admin'`

### Frontend no redirige después del login
- Verifica que el token se guarde en localStorage
- Abre DevTools → Application → Local Storage
- Debe haber una key "token" con el JWT

### Backend no acepta el token
- Verifica que el header sea: `Authorization: Bearer {token}`
- Verifica que el token no haya expirado
- Verifica la configuración de CORS

---

## 🎯 PRÓXIMOS PASOS

### Mejoras Sugeridas:
1. ✅ Sistema de login implementado
2. ⏳ Refresh tokens para sesiones largas
3. ⏳ Recuperación de contraseña
4. ⏳ Verificación de email
5. ⏳ Historial de sesiones
6. ⏳ Autenticación de dos factores (2FA)
7. ⏳ Límite de intentos de login
8. ⏳ Registro de actividad de usuarios

### Módulos por Desarrollar:
1. Gestión de Clientes
2. Órdenes de Trabajo
3. Materiales
4. Pagos y Caja
5. Reportes
6. Configuración

---

## 📚 RECURSOS

- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT.io](https://jwt.io/)
- [React Context](https://react.dev/reference/react/useContext)
- [Material-UI](https://mui.com/)

---

**Última actualización**: 22/01/2026  
**Versión**: 1.0.0  
**Estado**: ✅ COMPLETAMENTE FUNCIONAL

---

## ✨ ¡SISTEMA DE LOGIN LISTO!

El sistema de autenticación está completamente implementado y funcionando.  
Puedes iniciar sesión en http://localhost:3000 con admin/admin123.

**¡Comienza a desarrollar los módulos del CRM! 🚀**
