# 👥 MÓDULO DE GESTIÓN DE USUARIOS

**Fecha**: 22 de Enero de 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Operativo

---

## 📋 DESCRIPCIÓN

Módulo completo de administración de usuarios y roles del sistema CRM Talleres. Permite a los administradores crear, editar, visualizar y eliminar usuarios, así como asignar roles y gestionar permisos.

---

## 🎯 FUNCIONALIDADES

### ✅ Implementadas

1. **Listado de Usuarios**
   - Tabla completa con todos los usuarios
   - Información: ID, Username, Nombre, Email, Rol, Estado
   - Indicadores visuales de rol y estado activo/inactivo

2. **Crear Usuario**
   - Formulario completo de registro
   - Validaciones en frontend y backend
   - Asignación de rol
   - Generación segura de contraseña

3. **Editar Usuario**
   - Modificar información del usuario
   - Cambiar rol
   - Actualizar contraseña (opcional)
   - No se puede editar el username

4. **Eliminar Usuario**
   - Eliminación con confirmación
   - Protección: no se puede eliminar el propio usuario

5. **Control de Acceso**
   - Solo usuarios con rol ADMIN pueden acceder
   - Protección en backend y frontend
   - Validación de permisos en cada operación

---

## 🔐 SEGURIDAD

### Autenticación y Autorización

- **Endpoint protegido**: Requiere JWT válido
- **Rol requerido**: ADMIN
- **Validación**: En cada request

### Validaciones

**Backend:**
- Username único (solo al crear)
- Email único
- Longitud mínima de contraseña: 6 caracteres
- Validación de formato de email
- No permitir eliminar el propio usuario

**Frontend:**
- Validación de campos requeridos
- Confirmación de contraseña
- Validación de formato de email
- Mensajes de error descriptivos

---

## 🛠️ ESTRUCTURA TÉCNICA

### Backend (FastAPI)

#### Archivo: `backend/app/api/v1/users.py`

**Endpoints:**

```python
GET    /api/v1/users/              # Listar usuarios
GET    /api/v1/users/{id}          # Obtener usuario por ID
POST   /api/v1/users/              # Crear usuario
PUT    /api/v1/users/{id}          # Actualizar usuario
DELETE /api/v1/users/{id}          # Eliminar usuario
GET    /api/v1/users/roles/list    # Listar roles disponibles
```

**Dependencias:**
- `require_role(["ADMIN"])` - Protección por rol
- `get_db()` - Sesión de base de datos

#### Modelos y Schemas

**Modelo**: `backend/app/models/user.py`
```python
class User(Base):
    id: int
    username: str
    email: str
    nombre_completo: str
    password_hash: str
    rol: RolEnum
    activo: bool
    created_at: datetime
    updated_at: datetime
```

**Schemas**: `backend/app/schemas/user.py`
- `UserCreate` - Crear usuario
- `UserUpdate` - Actualizar usuario
- `UserResponse` - Respuesta de usuario

### Frontend (React)

#### Archivo: `frontend/src/pages/Users.jsx`

**Componentes:**
- Tabla de usuarios con Material-UI
- Diálogo de crear/editar usuario
- Formulario con validaciones
- Indicadores visuales (chips, iconos)

#### Servicios: `frontend/src/services/api.js`

```javascript
usersAPI.getAll()           // Obtener todos los usuarios
usersAPI.getById(id)        // Obtener usuario por ID
usersAPI.create(userData)   // Crear usuario
usersAPI.update(id, data)   // Actualizar usuario
usersAPI.delete(id)         // Eliminar usuario
usersAPI.getRoles()         // Obtener roles disponibles
```

---

## 📱 INTERFAZ DE USUARIO

### Página Principal (`/users`)

**Header:**
- Título: "Gestión de Usuarios"
- Botón: "Nuevo Usuario"

**Tabla de Usuarios:**
- Columnas: ID, Usuario, Nombre Completo, Email, Rol, Estado, Acciones
- Chips de color para roles
- Indicadores de estado activo/inactivo
- Acciones: Editar, Eliminar

**Acciones:**
- ✏️ Editar: Abre diálogo de edición
- 🗑️ Eliminar: Confirmación y eliminación
- ➕ Nuevo: Abre diálogo de creación

### Diálogo de Crear/Editar

**Campos:**
1. Nombre de Usuario (solo crear, no editable)
2. Email
3. Nombre Completo
4. Rol (selector)
5. Contraseña (requerida al crear, opcional al editar)
6. Confirmar Contraseña

**Validaciones:**
- Campos requeridos marcados con *
- Validación en tiempo real
- Mensajes de error descriptivos
- Confirmación de contraseña

---

## 🎨 ROLES DISPONIBLES

| Rol | Color | Descripción |
|-----|-------|-------------|
| ADMIN | Rojo | Administrador del sistema |
| TECNICO | Azul | Técnico mecánico |
| RECEPCION | Verde | Personal de recepción |
| CAJA | Naranja | Personal de caja |
| AUXILIAR | Celeste | Personal auxiliar |
| JEFE_TALLER | Morado | Jefe de taller |

---

## 🔄 FLUJO DE TRABAJO

### Crear Usuario

1. Admin hace clic en "Nuevo Usuario"
2. Se abre el diálogo de creación
3. Admin completa el formulario
4. Sistema valida los datos
5. Si es válido, se crea el usuario
6. Se muestra mensaje de éxito
7. La tabla se actualiza automáticamente

### Editar Usuario

1. Admin hace clic en el icono de editar
2. Se abre el diálogo con datos del usuario
3. Admin modifica los campos deseados
4. Sistema valida los cambios
5. Si es válido, se actualiza el usuario
6. Se muestra mensaje de éxito
7. La tabla se actualiza automáticamente

### Eliminar Usuario

1. Admin hace clic en el icono de eliminar
2. Sistema muestra confirmación
3. Si confirma, se elimina el usuario
4. Se muestra mensaje de éxito
5. La tabla se actualiza automáticamente

---

## 📊 VALIDACIONES

### Backend

```python
# Username
- Requerido (solo al crear)
- Único en el sistema
- Longitud: 3-50 caracteres

# Email
- Requerido
- Formato válido
- Único en el sistema

# Nombre Completo
- Requerido
- Longitud: 3-100 caracteres

# Contraseña
- Requerida (al crear)
- Opcional (al editar)
- Longitud mínima: 6 caracteres
- Hash con bcrypt

# Rol
- Requerido
- Debe ser un RolEnum válido
```

### Frontend

```javascript
// Validaciones en tiempo real
- Campos vacíos
- Formato de email
- Longitud mínima
- Coincidencia de contraseñas
- Mensajes de error descriptivos
```

---

## 🚀 CÓMO USAR

### Acceder al Módulo

1. Iniciar sesión como ADMIN
2. En el Dashboard, hacer clic en "Usuarios"
3. Se abre la página de gestión de usuarios

### Crear un Usuario

```
1. Clic en "Nuevo Usuario"
2. Completar formulario:
   - Username: usuario_nuevo
   - Email: usuario@ejemplo.com
   - Nombre: Juan Pérez
   - Rol: TECNICO
   - Contraseña: ******
   - Confirmar: ******
3. Clic en "Crear"
4. Usuario creado exitosamente
```

### Editar un Usuario

```
1. Localizar usuario en la tabla
2. Clic en icono de editar (lápiz)
3. Modificar campos deseados
4. Clic en "Actualizar"
5. Cambios guardados
```

### Eliminar un Usuario

```
1. Localizar usuario en la tabla
2. Clic en icono de eliminar (papelera)
3. Confirmar eliminación
4. Usuario eliminado
```

---

## 🐛 MANEJO DE ERRORES

### Errores Comunes

**Username ya existe:**
```
Error: El nombre de usuario ya está registrado
Solución: Usar un username diferente
```

**Email ya existe:**
```
Error: El email ya está registrado
Solución: Usar un email diferente
```

**Contraseñas no coinciden:**
```
Error: Las contraseñas no coinciden
Solución: Verificar y volver a escribir
```

**Intentar eliminar propio usuario:**
```
Error: No puedes eliminar tu propio usuario
Solución: Usar otra cuenta de admin
```

---

## 📝 EJEMPLOS DE USO

### Crear Usuario Técnico

```javascript
// Datos del formulario
{
  username: "tecnico1",
  email: "tecnico1@taller.com",
  nombre_completo: "Carlos Martínez",
  rol: "TECNICO",
  password: "tecnico123"
}
```

### Actualizar Rol de Usuario

```javascript
// Solo actualizar rol
{
  rol: "JEFE_TALLER"
}
```

### Cambiar Contraseña

```javascript
// Actualizar con nueva contraseña
{
  password: "nueva_contraseña_segura"
}
```

---

## 🔧 CONFIGURACIÓN

### Permisos Requeridos

```python
# En backend/app/api/v1/users.py
@router.get("/")
def get_users(
    current_user: User = Depends(require_role(["ADMIN"]))
):
    # Solo usuarios ADMIN pueden acceder
```

### Rutas Protegidas

```javascript
// En frontend/src/App.jsx
<Route
  path="/users"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <Users />
    </ProtectedRoute>
  }
/>
```

---

## 📈 MEJORAS FUTURAS

### Fase 1
- [ ] Filtros de búsqueda
- [ ] Ordenamiento de columnas
- [ ] Paginación de resultados
- [ ] Exportar a Excel/CSV

### Fase 2
- [ ] Activar/Desactivar usuarios
- [ ] Historial de cambios
- [ ] Foto de perfil
- [ ] Cambio de contraseña por usuario

### Fase 3
- [ ] Permisos granulares
- [ ] Grupos de usuarios
- [ ] Auditoría de acciones
- [ ] Notificaciones por email

---

## 🧪 TESTING

### Casos de Prueba

1. **Crear usuario válido** ✅
2. **Crear usuario con username duplicado** ✅
3. **Crear usuario con email duplicado** ✅
4. **Editar información de usuario** ✅
5. **Cambiar rol de usuario** ✅
6. **Eliminar usuario** ✅
7. **Intentar eliminar propio usuario** ✅
8. **Acceso sin permisos ADMIN** ✅

---

## 📞 SOPORTE

### Documentación API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Archivos Relacionados

**Backend:**
- `backend/app/api/v1/users.py`
- `backend/app/models/user.py`
- `backend/app/schemas/user.py`
- `backend/app/core/dependencies.py`

**Frontend:**
- `frontend/src/pages/Users.jsx`
- `frontend/src/services/api.js`
- `frontend/src/components/Layout.jsx`

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Endpoints CRUD en backend
- [x] Validaciones en backend
- [x] Protección por rol ADMIN
- [x] Página de gestión en frontend
- [x] Formulario de crear/editar
- [x] Tabla de usuarios
- [x] Validaciones en frontend
- [x] Manejo de errores
- [x] Mensajes de éxito/error
- [x] Integración con Layout
- [x] Documentación completa

---

**Última actualización**: 22/01/2026  
**Desarrollado por**: Eduardo Felix  
**Estado**: ✅ Módulo Operativo
