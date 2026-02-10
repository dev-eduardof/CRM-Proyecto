# Troubleshooting - Editor de Imágenes

## Problema: Solo aparece "Cargando imagen..." al editar

### Diagnóstico

El editor incluye logs detallados en la consola del navegador para ayudar a diagnosticar problemas.

**Pasos para diagnosticar:**

1. Abre las herramientas de desarrollador del navegador:
   - **Chrome/Edge**: Presiona `F12` o `Ctrl+Shift+I`
   - **Firefox**: Presiona `F12` o `Ctrl+Shift+K`
   - **Safari**: `Cmd+Option+I` (Mac)

2. Ve a la pestaña "Console"

3. Intenta editar una imagen

4. Busca los siguientes mensajes:

### Mensajes de Log Esperados

#### ✅ Funcionamiento Correcto:
```
Editando imagen de sección: 0
Sección: {id: ..., foto: File, preview: "data:image/jpeg;base64,...", ...}
Preview existe: true
Preview length: 50000
Editor abierto con URL: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...
ImageEditor abierto con URL: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA
🔄 Iniciando carga de imagen...
✅ Imagen cargada exitosamente: 800 x 600
✅ Canvas configurado: 800 x 600
```

#### ❌ Error: Preview no existe
```
Editando imagen de sección: 0
Sección: {id: ..., foto: File, preview: null, ...}
Preview existe: false
❌ No hay preview disponible para esta sección
```

**Causa**: La imagen no se cargó correctamente al seleccionarla o capturarla.

**Solución**:
1. Vuelve a seleccionar o capturar la foto
2. Verifica que el archivo sea una imagen válida (JPG, PNG, etc.)
3. Espera a que aparezca la vista previa antes de intentar editar

#### ❌ Error: Canvas ref no disponible
```
ImageEditor abierto con URL: data:image/jpeg;base64,...
❌ Canvas ref no disponible
```

**Causa**: El componente no se montó correctamente.

**Solución**:
1. Cierra y vuelve a abrir el diálogo
2. Recarga la página
3. Verifica que no haya errores de JavaScript en la consola

#### ❌ Error: Fallo al cargar imagen
```
ImageEditor abierto con URL: data:image/jpeg;base64,...
🔄 Iniciando carga de imagen...
❌ Error al cargar la imagen: Event {isTrusted: true, ...}
```

**Causa**: La URL de la imagen está corrupta o no es válida.

**Solución**:
1. Vuelve a cargar la imagen desde el archivo original
2. Verifica que el archivo no esté corrupto
3. Intenta con una imagen diferente

### Verificaciones Adicionales

#### 1. Verificar que la imagen se cargó correctamente

En la consola, después de seleccionar una imagen, deberías ver:

```javascript
// Puedes ejecutar esto en la consola para ver el estado actual
console.log(seccionesFotos);
```

Cada sección debe tener:
- `foto`: Objeto File
- `preview`: String que empieza con "data:image/..."

#### 2. Verificar el tamaño de la imagen

Si la imagen es muy grande, puede tardar en cargar:

```javascript
// En la consola
console.log(seccionesFotos[0].preview.length);
// Si es > 10,000,000 (10MB), la imagen es muy grande
```

**Solución**: Usa imágenes más pequeñas (< 5MB recomendado)

#### 3. Verificar CORS (Cross-Origin Resource Sharing)

Si estás cargando imágenes desde URLs externas:

```
❌ Error: Failed to execute 'toDataURL' on 'HTMLCanvasElement': 
   Tainted canvases may not be exported.
```

**Causa**: Problema de CORS con imágenes externas.

**Solución**: 
- El editor ya maneja esto con `crossOrigin='anonymous'`
- Asegúrate de que el servidor de imágenes permita CORS
- Usa imágenes locales (capturadas o seleccionadas del dispositivo)

### Soluciones Rápidas

#### Solución 1: Recargar la Página
El método más simple:
1. Presiona `F5` o `Ctrl+R`
2. Vuelve a crear la orden
3. Carga la imagen nuevamente

#### Solución 2: Limpiar Caché del Navegador
Si el problema persiste:
1. Presiona `Ctrl+Shift+Delete`
2. Selecciona "Imágenes y archivos en caché"
3. Limpia y recarga

#### Solución 3: Verificar Formato de Imagen
Formatos soportados:
- ✅ JPEG/JPG
- ✅ PNG
- ✅ WebP
- ❌ HEIC (iOS) - Convertir primero
- ❌ BMP - Convertir primero

#### Solución 4: Reducir Tamaño de Imagen
Si la imagen es muy grande:
1. Usa una herramienta de compresión
2. Redimensiona la imagen antes de cargarla
3. Tamaño recomendado: < 2000x2000 px, < 5MB

### Problemas Conocidos

#### 1. Timeout en Imágenes Grandes
**Síntoma**: "Cargando imagen..." por más de 10 segundos

**Causa**: La imagen es demasiado grande para procesar

**Solución**: 
- Reduce el tamaño de la imagen
- Comprime la imagen antes de cargarla

#### 2. Imágenes HEIC de iPhone
**Síntoma**: La imagen no se carga en absoluto

**Causa**: Los navegadores no soportan nativamente HEIC

**Solución**:
- En iPhone: Configuración > Cámara > Formatos > "Más compatible"
- O convierte las imágenes a JPEG antes de cargar

#### 3. Memoria Insuficiente
**Síntoma**: El navegador se congela o crashea

**Causa**: Demasiadas imágenes grandes en memoria

**Solución**:
- Cierra otras pestañas del navegador
- Reinicia el navegador
- Usa imágenes más pequeñas

### Código de Diagnóstico

Puedes ejecutar este código en la consola del navegador para diagnosticar:

```javascript
// Ver estado de las secciones
console.table(seccionesFotos.map((s, i) => ({
  index: i,
  tieneFoto: !!s.foto,
  tienePreview: !!s.preview,
  previewLength: s.preview?.length || 0,
  previewStart: s.preview?.substring(0, 30) || 'N/A'
})));

// Verificar que el editor esté disponible
console.log('Editor abierto:', openImageEditor);
console.log('URL de edición:', editingImageUrl?.substring(0, 50));
console.log('Índice de edición:', editingImageIndex);
```

### Contacto de Soporte

Si ninguna de estas soluciones funciona:

1. Copia todos los mensajes de la consola
2. Toma una captura de pantalla del error
3. Anota los pasos exactos que causaron el problema
4. Incluye información del navegador (Chrome 120, Firefox 115, etc.)

### Prevención

Para evitar problemas:

1. ✅ Usa imágenes de tamaño razonable (< 5MB)
2. ✅ Verifica que la vista previa aparezca antes de editar
3. ✅ Espera a que la imagen se cargue completamente
4. ✅ Usa formatos estándar (JPEG, PNG)
5. ✅ Mantén el navegador actualizado
6. ✅ Cierra pestañas innecesarias para liberar memoria
