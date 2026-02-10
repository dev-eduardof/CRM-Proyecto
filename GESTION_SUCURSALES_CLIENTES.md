# Gestión de Sucursales en el Módulo de Clientes

## 📋 Descripción

Se ha implementado una **sección completa de gestión de sucursales** dentro del módulo de Clientes, permitiendo ver, crear, editar y eliminar sucursales directamente desde la ficha del cliente.

---

## ✨ Características Implementadas

### 1. **Nuevo Tab "Sucursales"**
- Ubicado después del tab "Notas" en el diálogo de edición de cliente
- Solo disponible cuando se está editando un cliente existente
- Muestra todas las sucursales asociadas al cliente

### 2. **Lista de Sucursales**
Cada sucursal se muestra en una tarjeta con:
- ✅ Nombre de la sucursal
- ✅ Código de sucursal (si existe)
- ✅ Teléfono principal y alternativo
- ✅ Email
- ✅ Dirección completa
- ✅ Notas
- ✅ Botones de Editar y Eliminar

### 3. **Crear Nueva Sucursal**
- Botón "Agregar Sucursal" en la parte superior del tab
- Formulario completo con todos los campos necesarios
- Validación de campos obligatorios

### 4. **Editar Sucursal**
- Botón de edición en cada tarjeta de sucursal
- Carga los datos existentes en el formulario
- Actualiza la información en tiempo real

### 5. **Eliminar Sucursal**
- Botón de eliminación en cada tarjeta
- Confirmación antes de eliminar
- Actualización automática de la lista

---

## 🎯 Flujo de Uso

### Acceder a las Sucursales de un Cliente:

1. **Ir al módulo "Gestión de Clientes"**
2. **Hacer clic en el botón "Editar"** (ícono de lápiz) de cualquier cliente
3. **Navegar al tab "Sucursales"** (el cuarto tab)
4. Ver la lista de sucursales existentes

### Agregar una Nueva Sucursal:

1. En el tab "Sucursales", hacer clic en **"Agregar Sucursal"**
2. Completar el formulario:

**Información de la Sucursal:**
- ✅ Nombre de la Sucursal* (obligatorio)
- Código (opcional)

**Información de Contacto:**
- ✅ Teléfono* (obligatorio)
- Teléfono Alternativo (opcional)
- Email (opcional)

**Dirección:**
- Calle
- Número
- Número Interior
- Colonia
- Código Postal
- Ciudad
- Estado

**Notas:**
- Información adicional sobre la sucursal

3. Hacer clic en **"Crear"**
4. La sucursal aparece inmediatamente en la lista

### Editar una Sucursal:

1. Hacer clic en el **ícono de lápiz** en la tarjeta de la sucursal
2. Modificar los campos necesarios
3. Hacer clic en **"Actualizar"**
4. Los cambios se reflejan inmediatamente

### Eliminar una Sucursal:

1. Hacer clic en el **ícono de basura** en la tarjeta de la sucursal
2. Confirmar la eliminación en el diálogo
3. La sucursal se elimina de la lista

---

## 📸 Interfaz de Usuario

### Tab de Sucursales:
```
┌─────────────────────────────────────────────────────────────┐
│ 🏪 Sucursales del Cliente          [+ Agregar Sucursal]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 📍 Sucursal Centro [SUC-001]              [✏️] [🗑️]│    │
│ │                                                      │    │
│ │ 📞 Teléfono: 5551234567                            │    │
│ │ 📞 Tel. Alt: 5559876543                            │    │
│ │ 📧 sucursal.centro@empresa.com                     │    │
│ │ 🏠 Av. Principal #123, Col. Centro, CDMX           │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 📍 Planta Norte [PLT-002]                 [✏️] [🗑️]│    │
│ │                                                      │    │
│ │ 📞 Teléfono: 8181234567                            │    │
│ │ 🏠 Carretera Industrial Km 5, Monterrey, NL        │    │
│ └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Formulario de Sucursal:
```
┌─────────────────────────────────────────────────────────────┐
│  Nueva Sucursal                                      [X]    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Información de la Sucursal                                 │
│  ┌──────────────────────────────┬──────────────────┐       │
│  │ Nombre de la Sucursal *      │ Código           │       │
│  └──────────────────────────────┴──────────────────┘       │
│                                                              │
│  Información de Contacto                                    │
│  ┌──────────────────────────────┬──────────────────┐       │
│  │ Teléfono *                   │ Teléfono Alt     │       │
│  ├──────────────────────────────┴──────────────────┤       │
│  │ Email                                            │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│  Dirección                                                  │
│  ┌──────────────────────────────┬──────────────────┐       │
│  │ Calle                        │ Número           │       │
│  ├──────────────────────────────┼──────────────────┤       │
│  │ Número Interior              │ Colonia          │       │
│  ├──────────────────────────────┼──────────────────┤       │
│  │ Código Postal                │ Ciudad           │       │
│  ├──────────────────────────────┼──────────────────┤       │
│  │ Estado                                           │       │
│  ├──────────────────────────────────────────────────┤       │
│  │ Notas                                            │       │
│  │                                                  │       │
│  └──────────────────────────────────────────────────┘       │
│                                                              │
│                            [Cancelar] [Crear]               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Validaciones

### Campos Obligatorios:
- ✅ Nombre de la sucursal
- ✅ Teléfono

### Restricciones:
- El cliente debe estar guardado antes de agregar sucursales
- El tab "Sucursales" está deshabilitado al crear un nuevo cliente
- Confirmación requerida para eliminar sucursales

### Mensajes:
- **Éxito al crear**: "Sucursal creada correctamente"
- **Éxito al actualizar**: "Sucursal actualizada correctamente"
- **Éxito al eliminar**: "Sucursal eliminada correctamente"
- **Error sin cliente**: "Debes guardar el cliente primero antes de agregar sucursales"
- **Error campos vacíos**: "El nombre de la sucursal y el teléfono son obligatorios"

---

## 💡 Casos de Uso

### Caso 1: Cliente con Múltiples Plantas
```
Cliente: "Industrias ABC S.A. de C.V."
Sucursales:
  - Planta Monterrey (Producción)
  - Planta Querétaro (Ensamble)
  - Oficinas CDMX (Administrativo)
```

### Caso 2: Cadena de Tiendas
```
Cliente: "Comercializadora XYZ"
Sucursales:
  - Sucursal Centro
  - Sucursal Norte
  - Sucursal Sur
  - Bodega Principal
```

### Caso 3: Empresa con Oficinas Regionales
```
Cliente: "Servicios Profesionales"
Sucursales:
  - Oficina Guadalajara
  - Oficina Puebla
  - Oficina Tijuana
```

---

## 🔄 Integración con Órdenes de Trabajo

Las sucursales creadas aquí están **completamente integradas** con el módulo de órdenes de trabajo:

1. Al crear una orden para un cliente con sucursales, aparece el selector de sucursales
2. Puedes elegir la sucursal específica para la orden
3. Los datos de contacto de la sucursal pueden usarse para notificaciones

---

## 📊 Datos Almacenados

### Tabla: `sucursales`
- `id` - Identificador único
- `cliente_id` - Relación con el cliente
- `nombre_sucursal` - Nombre de la sucursal
- `codigo_sucursal` - Código interno
- `telefono` - Teléfono principal
- `telefono_alternativo` - Teléfono secundario
- `email` - Correo electrónico
- `calle`, `numero_exterior`, `numero_interior` - Dirección
- `colonia`, `codigo_postal`, `ciudad`, `estado` - Ubicación
- `notas` - Información adicional
- `activo` - Estado activo/inactivo
- `created_at`, `updated_at` - Timestamps

---

## 🎨 Características de UX

1. **Tab Deshabilitado para Nuevos Clientes**: 
   - Evita confusión
   - Asegura que el cliente exista antes de agregar sucursales

2. **Tarjetas Visuales**:
   - Información organizada y fácil de leer
   - Iconos para identificar rápidamente cada tipo de dato

3. **Acciones Rápidas**:
   - Botones de editar y eliminar siempre visibles
   - Confirmación para acciones destructivas

4. **Feedback Inmediato**:
   - Mensajes de éxito/error claros
   - Actualización automática de la lista

5. **Formulario Completo**:
   - Todos los campos necesarios en un solo lugar
   - Organización lógica por secciones

---

## 🚀 Beneficios

### Para el Negocio:
- ✅ Gestión centralizada de sucursales
- ✅ Información completa de cada ubicación
- ✅ Trazabilidad de órdenes por sucursal
- ✅ Mejor organización de clientes corporativos

### Para los Usuarios:
- ✅ Interfaz intuitiva y fácil de usar
- ✅ Acceso rápido desde el módulo de clientes
- ✅ No necesita cambiar de pantalla
- ✅ Edición y eliminación sencillas

### Para el Sistema:
- ✅ Datos estructurados y relacionados
- ✅ Reutilización de información
- ✅ Integración con órdenes de trabajo
- ✅ Base para futuras funcionalidades

---

## 📝 Notas Técnicas

### Archivos Modificados:
- `frontend/src/pages/Clientes.jsx`
  - Agregados imports: `LocationIcon`, `StoreIcon`, `sucursalesAPI`
  - Nuevos estados para gestión de sucursales
  - Funciones: `loadSucursales`, `handleOpenSucursalDialog`, `handleCloseSucursalDialog`, `handleSucursalChange`, `handleSaveSucursal`, `handleDeleteSucursal`
  - Nuevo tab "Sucursales" con lista y formularios
  - Diálogo modal para crear/editar sucursales

### API Utilizada:
- `GET /api/v1/sucursales?cliente_id={id}` - Obtener sucursales de un cliente
- `POST /api/v1/sucursales` - Crear nueva sucursal
- `PUT /api/v1/sucursales/{id}` - Actualizar sucursal
- `DELETE /api/v1/sucursales/{id}` - Eliminar sucursal

### Dependencias:
- Material-UI (Dialog, Tab, Grid, Paper, Chip, etc.)
- React Hooks (useState, useEffect)
- Axios / API Service

---

## ✅ Testing Recomendado

1. **Crear sucursal con datos mínimos** (solo obligatorios)
2. **Crear sucursal con datos completos** (todos los campos)
3. **Editar sucursal existente**
4. **Eliminar sucursal**
5. **Verificar que el tab esté deshabilitado** para clientes nuevos
6. **Crear múltiples sucursales** para un mismo cliente
7. **Verificar integración** con módulo de órdenes
8. **Probar validaciones** de campos obligatorios

---

## 🎯 Próximas Mejoras Sugeridas

1. Búsqueda y filtrado de sucursales
2. Exportar lista de sucursales a Excel/PDF
3. Mapa de ubicación de sucursales
4. Estadísticas por sucursal
5. Asignación de contactos múltiples por sucursal
6. Horarios de atención por sucursal
7. Fotos de la sucursal
8. Historial de cambios en sucursales

---

**Fecha de Implementación**: 2026-02-10  
**Versión**: 1.0  
**Estado**: ✅ Implementado y Funcional
