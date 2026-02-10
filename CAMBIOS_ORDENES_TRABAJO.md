# Cambios en el Sistema de Órdenes de Trabajo

## Fecha: 2026-02-10

## Resumen de Cambios

Se han implementado mejoras significativas en el módulo de órdenes de trabajo para soportar:

1. **Gestión de Sucursales**: Permite relacionar múltiples sucursales con un mismo RFC de cliente
2. **Contacto para Notificaciones**: Campos específicos para definir quién recibirá las notificaciones de cada orden

---

## 📋 Cambios Implementados

### Backend

#### 1. Nuevos Modelos

**Modelo Sucursal** (`backend/app/models/sucursal.py`)
- Tabla `sucursales` con relación a clientes
- Campos: nombre_sucursal, codigo_sucursal, teléfonos, email, dirección completa
- Relación one-to-many con clientes (un cliente puede tener múltiples sucursales)

**Modificaciones al Modelo OrdenTrabajo** (`backend/app/models/orden_trabajo.py`)
- Nuevo campo: `sucursal_id` (relación opcional con sucursales)
- Nuevo campo: `nombre_contacto_notificacion` (nombre del contacto)
- Nuevo campo: `telefono_contacto_notificacion` (teléfono del contacto)

**Modificaciones al Modelo Cliente** (`backend/app/models/cliente.py`)
- Agregada relación `sucursales` con cascade delete

#### 2. Nuevos Schemas

**Schema Sucursal** (`backend/app/schemas/sucursal.py`)
- `SucursalBase`: Schema base con todos los campos
- `SucursalCreate`: Para crear nuevas sucursales
- `SucursalUpdate`: Para actualizar sucursales existentes
- `SucursalResponse`: Para respuestas de API con información del cliente

**Modificaciones a Schemas de OrdenTrabajo** (`backend/app/schemas/orden_trabajo.py`)
- Agregados campos de sucursal y contacto de notificación en:
  - `OrdenTrabajoBase`
  - `OrdenTrabajoUpdate`
  - `OrdenTrabajoResponse`
  - `OrdenTrabajoListResponse`

#### 3. Nuevos Endpoints API

**API de Sucursales** (`backend/app/api/v1/sucursales.py`)
- `GET /api/v1/sucursales` - Listar sucursales con filtros
- `GET /api/v1/sucursales/{id}` - Obtener una sucursal específica
- `POST /api/v1/sucursales` - Crear nueva sucursal
- `PUT /api/v1/sucursales/{id}` - Actualizar sucursal
- `DELETE /api/v1/sucursales/{id}` - Eliminar sucursal

**Modificaciones a API de Órdenes** (`backend/app/api/v1/ordenes.py`)
- Actualizado para incluir información de sucursal en todas las respuestas
- Agregado `joinedload` de sucursal en todas las consultas

#### 4. Migración de Base de Datos

**Script SQL** (`backend/migrations/001_add_sucursales_and_notificaciones.sql`)
- Crea tabla `sucursales` con índices
- Agrega campos `sucursal_id`, `nombre_contacto_notificacion` y `telefono_contacto_notificacion` a `ordenes_trabajo`
- Incluye comentarios descriptivos en columnas

---

### Frontend

#### 1. Servicios API

**Modificaciones a `frontend/src/services/api.js`**
- Agregado `sucursalesAPI` con métodos:
  - `getAll()` - Obtener todas las sucursales
  - `getById(id)` - Obtener sucursal por ID
  - `getByCliente(clienteId)` - Obtener sucursales de un cliente específico
  - `create()` - Crear nueva sucursal
  - `update()` - Actualizar sucursal
  - `delete()` - Eliminar sucursal

#### 2. Formulario de Órdenes

**Modificaciones a `frontend/src/pages/Ordenes.jsx`**

**Estados agregados:**
- `sucursales` - Lista de sucursales del cliente seleccionado

**Campos agregados al formulario:**
- `sucursal_id` - Selector de sucursal (aparece cuando se selecciona un cliente)
- `nombre_contacto_notificacion` - Nombre del contacto para notificaciones
- `telefono_contacto_notificacion` - Teléfono del contacto para notificaciones

**Funciones agregadas:**
- `fetchSucursales(clienteId)` - Carga las sucursales de un cliente
- `handleClienteChange(clienteId)` - Maneja el cambio de cliente y carga sus sucursales

**Mejoras en la UI:**
- Selector de sucursal con código de sucursal entre paréntesis
- Sección dedicada "Contacto para Notificaciones" con campos específicos
- Mensajes de ayuda (helperText) en los campos nuevos
- El selector de sucursal solo aparece cuando hay un cliente seleccionado

---

## 🔄 Flujo de Uso

### Crear una Orden de Trabajo con Sucursal

1. Seleccionar un cliente existente
2. Si el cliente tiene sucursales registradas, aparecerá un selector
3. Seleccionar la sucursal específica (opcional)
4. Ingresar nombre y teléfono del contacto para notificaciones
5. Completar el resto del formulario normalmente

### Gestionar Sucursales

Para agregar sucursales a un cliente, se puede usar directamente la API:

```bash
POST /api/v1/sucursales
{
  "cliente_id": 1,
  "nombre_sucursal": "Sucursal Centro",
  "codigo_sucursal": "SUC-001",
  "telefono": "5551234567",
  "calle": "Av. Principal",
  "numero_exterior": "123",
  "ciudad": "Ciudad de México",
  "estado": "CDMX"
}
```

---

## 📊 Migración de Datos

### Aplicar la Migración

**Usando Docker (MySQL/MariaDB):**
```bash
# Copiar el archivo al contenedor
docker cp backend/migrations/001_add_sucursales_and_notificaciones_mysql.sql crm_db:/tmp/migration.sql

# Obtener las credenciales de la base de datos
docker exec crm_db env | findstr MYSQL

# Ejecutar la migración (reemplaza las credenciales con las obtenidas)
docker exec -i crm_db sh -c "mysql -u crm_user -p[TU_PASSWORD] crm_talleres < /tmp/migration.sql"
```

**Conexión directa (MySQL/MariaDB):**
```bash
mysql -u crm_user -p crm_talleres < backend/migrations/001_add_sucursales_and_notificaciones_mysql.sql
```

### Notas Importantes

- La migración es idempotente (se puede ejecutar múltiples veces)
- Los campos nuevos en `ordenes_trabajo` son opcionales (nullable)
- Las órdenes existentes no se verán afectadas
- La relación con sucursal es opcional, las órdenes pueden existir sin sucursal específica

---

## 🎯 Casos de Uso

### Caso 1: Cliente con Múltiples Sucursales
Un cliente corporativo (Persona Moral) tiene varias sucursales en diferentes ciudades. Cada sucursal puede tener su propio contacto y dirección. Al crear una orden, se puede especificar exactamente a qué sucursal corresponde.

### Caso 2: Contacto de Notificación Diferente
El cliente registrado es una empresa, pero quien debe recibir las notificaciones es el supervisor de planta o el encargado de mantenimiento. Se puede especificar su nombre y teléfono en la orden.

### Caso 3: Cliente sin Sucursales
Para clientes que no tienen sucursales registradas, el flujo sigue siendo el mismo. El campo de sucursal simplemente no se muestra o se deja vacío.

---

## ✅ Validaciones

- El cliente debe existir antes de crear una sucursal
- La sucursal debe pertenecer al cliente especificado en la orden
- Los campos de contacto de notificación son opcionales pero recomendados
- El teléfono de contacto tiene un límite de 15 caracteres

---

## 🔐 Permisos

- **ADMIN y RECEPCION**: Pueden crear, editar y eliminar sucursales
- **TECNICO**: Puede ver las sucursales pero no modificarlas
- Todos los roles pueden ver la información de sucursal en las órdenes

---

## 📝 Próximos Pasos Sugeridos

1. Crear una interfaz de usuario dedicada para gestionar sucursales desde el módulo de clientes
2. Implementar sistema de notificaciones automáticas usando los datos de contacto
3. Agregar reportes por sucursal
4. Implementar búsqueda de órdenes por sucursal

---

## 🐛 Solución de Problemas

### Error: Tabla sucursales no existe
**Solución:** Ejecutar la migración SQL

### No aparece el selector de sucursales
**Solución:** Verificar que el cliente seleccionado tenga sucursales registradas

### Error al crear orden con sucursal
**Solución:** Verificar que la sucursal pertenezca al cliente seleccionado
