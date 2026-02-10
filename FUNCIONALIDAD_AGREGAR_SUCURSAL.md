# Nueva Funcionalidad: Agregar Sucursal desde Orden de Trabajo

## 📋 Descripción

Se ha implementado la capacidad de **crear sucursales directamente desde el formulario de nueva orden de trabajo** cuando el cliente seleccionado no tiene sucursales registradas.

---

## ✨ Características Principales

### 1. **Detección Automática**
- Cuando seleccionas un cliente que **no tiene sucursales registradas**, aparece automáticamente un botón "Agregar Sucursal"
- El sistema detecta si el cliente tiene o no sucursales y ajusta la interfaz

### 2. **Formulario de Captura Rápida**
Al hacer clic en "Agregar Sucursal", se abre un diálogo con los siguientes campos:

#### **Datos de la Sucursal:**
- ✅ **Nombre de la Sucursal*** (obligatorio) - Ej: "Sucursal Centro", "Planta Norte"
- Código de Sucursal (opcional) - Ej: "SUC-001"

#### **Dirección de la Sucursal:**
- Calle
- Número
- Colonia
- Ciudad
- Estado

#### **Contacto para Notificaciones:*** (obligatorio)
- ✅ **Nombre del Contacto*** - Persona que recibirá las notificaciones
- ✅ **Teléfono*** - Número de contacto (hasta 15 dígitos)

### 3. **Integración Automática**
Una vez creada la sucursal:
- ✅ Se guarda en la base de datos asociada al cliente
- ✅ Se actualiza automáticamente la lista de sucursales
- ✅ La nueva sucursal se **selecciona automáticamente** en el formulario
- ✅ Los datos de contacto se **copian automáticamente** a los campos de notificación de la orden

---

## 🎯 Flujo de Uso

### Paso 1: Seleccionar Cliente
1. En el formulario de "Nueva Orden de Trabajo"
2. Selecciona un cliente existente

### Paso 2: Verificar Sucursales
- Si el cliente **tiene sucursales**: Aparece un selector con todas sus sucursales
- Si el cliente **NO tiene sucursales**: Aparece el mensaje "Este cliente no tiene sucursales registradas" y un botón "Agregar Sucursal"

### Paso 3: Crear Sucursal (si es necesario)
1. Haz clic en el botón **"Agregar Sucursal"**
2. Se abre un diálogo con el formulario
3. Completa los campos obligatorios:
   - Nombre de la sucursal
   - Nombre del contacto
   - Teléfono del contacto
4. Opcionalmente, completa la dirección y código de sucursal
5. Haz clic en **"Guardar Sucursal"**

### Paso 4: Continuar con la Orden
- La sucursal se crea y selecciona automáticamente
- Los datos del contacto se copian a los campos de notificación
- Continúa llenando el resto del formulario normalmente

---

## 💡 Ventajas

### ✅ **Eficiencia**
- No necesitas salir del formulario de orden para crear una sucursal
- Proceso más rápido y fluido

### ✅ **Datos Persistentes**
- La sucursal queda registrada en el sistema
- La próxima vez que crees una orden para ese cliente, la sucursal ya estará disponible

### ✅ **Información Completa**
- Captura tanto datos de la sucursal como del contacto
- Toda la información queda centralizada

### ✅ **Reutilizable**
- Una vez creada, la sucursal puede usarse en múltiples órdenes
- Otros usuarios también pueden ver y usar la sucursal

---

## 📸 Interfaz de Usuario

### Cuando NO hay sucursales:
```
┌─────────────────────────────────────────────────────────┐
│ Sucursal                                   [+ Agregar   │
│ [Sin sucursal específica ▼]                  Sucursal] │
│ ℹ Este cliente no tiene sucursales registradas          │
└─────────────────────────────────────────────────────────┘
```

### Cuando SÍ hay sucursales:
```
┌─────────────────────────────────────────────────────────┐
│ Sucursal                                                 │
│ [Sucursal Centro (SUC-001) ▼]                          │
│ ℹ Selecciona la sucursal del cliente                    │
└─────────────────────────────────────────────────────────┘
```

### Diálogo de Nueva Sucursal:
```
┌─────────────────────────────────────────────────────────┐
│  Agregar Nueva Sucursal                          [X]    │
├─────────────────────────────────────────────────────────┤
│  ℹ Completa los datos de la sucursal y el contacto     │
│                                                          │
│  Datos de la Sucursal                                   │
│  ┌──────────────────────────────┬──────────────────┐   │
│  │ Nombre de la Sucursal *      │ Código           │   │
│  └──────────────────────────────┴──────────────────┘   │
│                                                          │
│  Dirección de la Sucursal                               │
│  ┌──────────────────────────────┬──────────────────┐   │
│  │ Calle                        │ Número           │   │
│  ├──────────────────────────────┼──────────────────┤   │
│  │ Colonia                      │ Ciudad           │   │
│  ├──────────────────────────────┴──────────────────┤   │
│  │ Estado                                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Contacto para Notificaciones *                         │
│  ┌──────────────────────────────┬──────────────────┐   │
│  │ Nombre del Contacto *        │ Teléfono *       │   │
│  └──────────────────────────────┴──────────────────┘   │
│                                                          │
│                          [Cancelar] [Guardar Sucursal]  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Validaciones

### Campos Obligatorios:
- ✅ Debe haber un cliente seleccionado
- ✅ Nombre de la sucursal
- ✅ Nombre del contacto
- ✅ Teléfono del contacto

### Mensajes de Error:
- "Debes seleccionar un cliente primero"
- "Por favor completa los campos obligatorios: Nombre de sucursal, Teléfono y Nombre de contacto"

### Mensajes de Éxito:
- "Sucursal creada correctamente"

---

## 📊 Datos que se Guardan

### En la tabla `sucursales`:
- cliente_id (relación con el cliente)
- nombre_sucursal
- codigo_sucursal
- telefono
- calle, numero_exterior, colonia, ciudad, estado
- activo (siempre TRUE al crear)
- created_at, updated_at

### En la orden de trabajo:
- sucursal_id (ID de la sucursal creada)
- nombre_contacto_notificacion (copiado del formulario)
- telefono_contacto_notificacion (copiado del formulario)

---

## 🎨 Mejoras de UX

1. **Botón contextual**: Solo aparece cuando es relevante (cliente sin sucursales)
2. **Selección automática**: La nueva sucursal se selecciona automáticamente
3. **Copia de datos**: El contacto se copia a los campos de notificación
4. **Feedback visual**: Alertas de éxito/error claras
5. **Diseño responsive**: Funciona en desktop y móvil

---

## 🔄 Casos de Uso

### Caso 1: Cliente Nuevo con Primera Sucursal
```
Usuario: Selecciona "Empresa ABC S.A. de C.V."
Sistema: "Este cliente no tiene sucursales registradas"
Usuario: Click en "Agregar Sucursal"
Usuario: Completa datos → "Planta Monterrey", "Ing. Juan Pérez", "8181234567"
Sistema: Crea sucursal, la selecciona automáticamente
Resultado: Orden lista con sucursal y contacto configurados
```

### Caso 2: Cliente con Múltiples Sucursales
```
Usuario: Selecciona "Empresa XYZ"
Sistema: Muestra selector con "Sucursal Norte", "Sucursal Sur", "Planta Central"
Usuario: Selecciona "Planta Central"
Resultado: Orden configurada para esa sucursal específica
```

### Caso 3: Agregar Segunda Sucursal
```
Usuario: Crea primera sucursal "Planta A"
Usuario: Crea nueva orden para el mismo cliente
Sistema: Ahora muestra selector con "Planta A"
Usuario: Puede seleccionar existente o agregar nueva
```

---

## 🚀 Beneficios para el Negocio

1. **Mayor Eficiencia**: Menos pasos para crear órdenes
2. **Datos Completos**: Captura información de contacto desde el inicio
3. **Trazabilidad**: Histórico de órdenes por sucursal
4. **Escalabilidad**: Soporta clientes con múltiples ubicaciones
5. **Mejor Comunicación**: Contactos específicos por sucursal

---

## 📝 Notas Técnicas

### Archivos Modificados:
- `frontend/src/pages/Ordenes.jsx`
  - Agregados estados para manejo de sucursales
  - Funciones `handleOpenSucursalDialog`, `handleCloseSucursalDialog`, `handleCreateSucursal`
  - Nuevo diálogo modal para crear sucursales
  - Botón condicional "Agregar Sucursal"

### API Utilizada:
- `POST /api/v1/sucursales` - Crear nueva sucursal
- `GET /api/v1/sucursales?cliente_id={id}` - Obtener sucursales de un cliente

### Dependencias:
- Material-UI (Dialog, TextField, Button, Grid, Alert)
- React Hooks (useState)
- Axios (API calls)

---

## ✅ Testing Recomendado

1. **Crear sucursal con datos mínimos** (solo obligatorios)
2. **Crear sucursal con datos completos** (incluyendo dirección)
3. **Validar campos obligatorios** (intentar guardar sin completar)
4. **Verificar selección automática** (sucursal se selecciona tras crear)
5. **Verificar copia de contacto** (datos se copian a notificación)
6. **Crear múltiples sucursales** para el mismo cliente
7. **Verificar persistencia** (sucursal disponible en nueva orden)

---

## 🎯 Próximas Mejoras Sugeridas

1. Permitir editar sucursales desde el formulario
2. Agregar campo de email en el contacto
3. Validación de formato de teléfono
4. Autocompletar dirección con API de Google Maps
5. Historial de órdenes por sucursal
6. Reportes por sucursal

---

**Fecha de Implementación**: 2026-02-10  
**Versión**: 1.0  
**Estado**: ✅ Implementado y Funcional
