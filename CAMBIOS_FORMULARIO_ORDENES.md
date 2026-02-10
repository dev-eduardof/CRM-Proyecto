# Cambios en el Formulario de Nueva Orden de Trabajo

## 📋 Fecha: 2026-02-10

---

## ✨ Cambios Implementados

### 1. **Reorganización de Pestañas**
Se redujo de **4 pestañas a 3 pestañas**:

#### Antes:
1. Información General
2. Detalles del Trabajo
3. Costos
4. Fotos

#### Ahora:
1. **Información General** (incluye detalles del trabajo)
2. **Costos**
3. **Foto de Entrada**

---

### 2. **Eliminación de la Pestaña "Detalles del Trabajo"**
- ✅ La pestaña independiente fue eliminada
- ✅ El contenido se movió a "Información General"

---

### 3. **Integración de Detalles del Trabajo**
Los campos de descripción y observaciones ahora están **dentro de la pestaña "Información General"**:

**Ubicación:** Al final de la pestaña "Información General", después de "Fecha Promesa de Entrega"

**Campos incluidos:**
- ✅ **Descripción del Trabajo*** (obligatorio)
  - Campo de texto multilínea (4 filas)
  - Placeholder: "Describe la pieza y el trabajo a realizar"
  
- ✅ **Observaciones** (opcional)
  - Campo de texto multilínea (3 filas)
  - Placeholder: "Notas adicionales, especificaciones, tolerancias, etc."

---

### 4. **Eliminación de Foto de Salida**
- ✅ **Removida completamente** del formulario de nueva orden
- ✅ La foto de salida se agregará posteriormente cuando se complete el trabajo
- ✅ Solo queda la **Foto de Entrada** en el formulario inicial

---

### 5. **Mejoras en la Pestaña "Foto de Entrada"**
- ✅ Ahora ocupa **todo el ancho** de la pantalla (antes era 50%)
- ✅ Mejor visualización de la foto
- ✅ Mensaje actualizado: "La foto de entrada se toma al recibir la pieza. La foto de salida se agregará al completar el trabajo."

---

## 🎯 Flujo Actualizado

### Pestaña 1: Información General
```
┌─────────────────────────────────────────────────────────┐
│ Información General                                      │
├─────────────────────────────────────────────────────────┤
│ ☑ Cliente Nuevo (Captura Rápida)                       │
│                                                          │
│ Cliente *                                               │
│ [Selector de cliente]                                   │
│                                                          │
│ Sucursal (si aplica)                                    │
│ [Selector de sucursal]                                  │
│                                                          │
│ Contacto para Notificaciones                            │
│ Nombre del Contacto | Teléfono del Contacto            │
│                                                          │
│ Categoría de Servicio | Subcategoría                   │
│ Tipo de Permiso/Documento | Número de Permiso/OC       │
│ Prioridad | Estado | Técnico Asignado                  │
│ Fecha Promesa de Entrega                                │
│                                                          │
│ ─── Detalles del Trabajo ───                           │
│                                                          │
│ Descripción del Trabajo *                               │
│ [Campo de texto multilínea]                             │
│                                                          │
│ Observaciones                                            │
│ [Campo de texto multilínea]                             │
└─────────────────────────────────────────────────────────┘
```

### Pestaña 2: Costos
```
┌─────────────────────────────────────────────────────────┐
│ Costos                                                   │
├─────────────────────────────────────────────────────────┤
│ Precio Sugerido/Estimado | Anticipo | Precio Final     │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Precio Estimado: $0.00                          │    │
│ │ Anticipo: $0.00                                 │    │
│ │ Saldo Pendiente: $0.00                          │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Pestaña 3: Foto de Entrada
```
┌─────────────────────────────────────────────────────────┐
│ Foto de Entrada                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              Foto de Entrada                            │
│         [Tomar Foto] [Seleccionar]                      │
│                                                          │
│         ┌─────────────────────────┐                     │
│         │                         │                     │
│         │   [Vista previa foto]   │                     │
│         │                         │                     │
│         └─────────────────────────┘                     │
│                                                          │
│ ℹ La foto de entrada se toma al recibir la pieza.      │
│   La foto de salida se agregará al completar el        │
│   trabajo.                                              │
└─────────────────────────────────────────────────────────┘
```

---

## 💡 Ventajas de los Cambios

### ✅ **Simplicidad**
- Menos pestañas = navegación más rápida
- Todo lo esencial en una sola vista

### ✅ **Flujo Lógico**
- La información se organiza de forma más natural
- Detalles del trabajo junto con información general

### ✅ **Enfoque Correcto**
- La foto de salida no es necesaria al crear la orden
- Se agregará cuando corresponda (al finalizar el trabajo)

### ✅ **Mejor UX**
- Menos clics para completar el formulario
- Campos relacionados están juntos
- Foto de entrada más visible (ancho completo)

---

## 🔄 Proceso de Trabajo Actualizado

### Al Crear una Nueva Orden:
1. **Pestaña 1**: Completa información del cliente, sucursal, contacto y detalles del trabajo
2. **Pestaña 2**: Define costos (estimado, anticipo, precio final)
3. **Pestaña 3**: Toma la foto de entrada de la pieza
4. **Guardar**: Crea la orden de trabajo

### Al Completar el Trabajo:
- La foto de salida se agregará en un paso posterior
- Esto se manejará desde la edición de la orden o cambio de estado

---

## 📊 Campos del Formulario

### Pestaña "Información General":

#### Información del Cliente:
- ☑ Cliente Nuevo (checkbox)
- Cliente* (obligatorio)
- Sucursal (opcional, si el cliente tiene sucursales)

#### Contacto para Notificaciones:
- Nombre del Contacto
- Teléfono del Contacto

#### Información del Servicio:
- Categoría de Servicio
- Subcategoría
- Tipo de Permiso/Documento
- Número de Permiso/OC
- Prioridad
- Estado
- Técnico Asignado
- Fecha Promesa de Entrega

#### Detalles del Trabajo:
- **Descripción del Trabajo*** (obligatorio)
- Observaciones

### Pestaña "Costos":
- Precio Sugerido/Estimado
- Anticipo
- Precio Final
- Resumen de saldo pendiente

### Pestaña "Foto de Entrada":
- Botones: Tomar Foto / Seleccionar
- Vista previa de la foto
- Mensaje informativo

---

## 🎨 Mejoras Visuales

1. **Sección "Detalles del Trabajo"**:
   - Título con estilo `subtitle2` y color `text.secondary`
   - Separación visual clara del resto del formulario
   - Campos con placeholders descriptivos

2. **Foto de Entrada**:
   - Ocupa todo el ancho disponible
   - Mejor aprovechamiento del espacio
   - Más fácil de visualizar

3. **Mensaje Informativo**:
   - Alert de tipo "info"
   - Explica claramente cuándo se toma cada foto

---

## 📝 Notas Técnicas

### Archivos Modificados:
- `frontend/src/pages/Ordenes.jsx`
  - Reducción de 4 a 3 pestañas
  - Movimiento de campos de descripción y observaciones
  - Eliminación de sección de foto de salida
  - Ajuste de índices de pestañas (tabValue)

### Cambios en el Código:
1. **Tabs**: Cambio de 4 a 3 tabs
2. **Tab 0** (Información General): Agregados campos de descripción y observaciones
3. **Tab 1** (antes Tab 2): Costos (sin cambios en contenido)
4. **Tab 2** (antes Tab 4): Solo foto de entrada (eliminada foto de salida)
5. **Eliminado**: Tab completo de "Detalles del Trabajo"

### Validaciones Mantenidas:
- ✅ Descripción del trabajo sigue siendo obligatoria
- ✅ Todos los campos obligatorios funcionan igual
- ✅ Validaciones de cliente y datos básicos intactas

---

## ✅ Testing Recomendado

1. **Crear orden con datos mínimos**
2. **Crear orden con todos los campos**
3. **Verificar que descripción sea obligatoria**
4. **Probar captura de foto de entrada**
5. **Verificar que no aparezca foto de salida**
6. **Confirmar que se guarda correctamente**
7. **Probar en diferentes tamaños de pantalla**

---

## 🚀 Próximos Pasos

### Funcionalidad de Foto de Salida:
La foto de salida se agregará en una funcionalidad separada, probablemente:
- Al cambiar el estado a "TERMINADO"
- En la vista de detalles de la orden
- En un proceso de "Completar Trabajo"

---

## 📌 Resumen de Cambios

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| **Número de pestañas** | 4 | 3 |
| **Detalles del Trabajo** | Pestaña separada | Dentro de "Información General" |
| **Foto de Salida** | En formulario inicial | Se agregará después |
| **Foto de Entrada** | 50% de ancho | 100% de ancho |
| **Flujo** | 4 pasos | 3 pasos |

---

**Estado**: ✅ Implementado y Funcional  
**Fecha**: 2026-02-10  
**Versión**: 2.0
