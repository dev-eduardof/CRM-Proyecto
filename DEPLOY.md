# Despliegue: QA y Producción

Flujo de ramas: **desarrollo** → **testeo (QA)** → **main (producción)**.

## 1. Subir a QA (servidor de prueba)

### En tu máquina (con los cambios ya commiteados en `desarrollo`)

**Windows (PowerShell):**
```powershell
.\scripts\promote-to-qa.ps1
```

**Linux/Mac o Git Bash:**
```bash
./scripts/promote-to-qa.sh
```

Esto hace: actualiza `desarrollo`, hace merge a `testeo` y hace `push origin testeo`.

### En el servidor de prueba (QA)

```bash
cd /ruta/del/proyecto
git pull origin testeo
./deploy.sh update
```

---

## 2. Subir a Producción (después de validar QA)

### En tu máquina (cuando QA esté validado)

**Linux/Mac o Git Bash:**
```bash
./scripts/promote-to-production.sh
```

Te pedirá escribir `PRODUCCION` para confirmar. Luego hace merge `testeo` → `main`, push a `main` y crea un tag de release.

### En el servidor de producción

```bash
cd /ruta/del/proyecto
git pull origin main
./deploy.sh update
```

---

## Antes de promover: commit en desarrollo

Si tienes cambios sin commitear:

```powershell
git add backend/ frontend/ scripts/ *.txt
git status
git commit -m "feat: descripción de los cambios"
git push origin desarrollo
```

Luego ejecuta el script de promover a QA (paso 1).

**No subas** la carpeta `pem/` (está en `.gitignore`). `database/` y archivos sensibles tampoco deben ir al repo.

---

## 3. Desplegar en el servidor (ej. 16.148.80.123)

Conectado por SSH al servidor:

```bash
cd /ruta/del/proyecto   # ej. /home/ubuntu/CRM-Proyecto
git fetch origin
git checkout main
git pull origin main
./deploy.sh update
```

`deploy.sh update` hace: backup de BD (si aplica), `git pull`, build de imágenes con `docker-compose.prod.yml` y reinicio de servicios. Asegúrate de tener el `.env` configurado en el servidor (CORS, BD, etc.).

### Si el servidor tiene poca RAM (~1 GB) y el build del frontend falla por "heap out of memory"

1. **En tu PC** (con el repo actualizado), construir el frontend y subir `dist`:
   ```powershell
   cd frontend
   $env:VITE_API_URL="http://16.148.80.123:8000"
   npm run build
   cd ..
   scp -i "ruta\al\key.pem" -r frontend\dist\* usuario@16.148.80.123:/home/ec2-user/crm-proyecto/frontend/dist/
   scp -i "ruta\al\key.pem" frontend\Dockerfile.prod.nginx-only usuario@16.148.80.123:/home/ec2-user/crm-proyecto/frontend/
   ```
2. **En el servidor** (SSH), construir solo la imagen frontend y levantar:
   ```bash
   cd /home/ec2-user/crm-proyecto
   docker build -f frontend/Dockerfile.prod.nginx-only -t crm-proyecto_frontend .
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## 4. Validar que producción = local (16.148.80.123:3000)

Si en http://16.148.80.123:3000/dashboard no se ve lo mismo que en local, el servidor no tiene el último build. Comprueba lo siguiente.

### En el servidor (SSH)

```bash
cd /ruta/del/proyecto
git branch
git log -1 --oneline
git fetch origin
git pull origin main
./deploy.sh update
```

- Debe estar en rama **main** y el último commit debe ser el que subiste (ej. "feat: modulo Caja...").
- **`./deploy.sh update`** es obligatorio: hace **build de las imágenes Docker** y reinicia contenedores. Solo `git pull` no actualiza el frontend hasta que no reconstruyas la imagen.

### Qué debe verse en producción (igual que en local)

| Dónde | Qué comprobar |
|-------|----------------|
| **Menú lateral** | Entradas: Dashboard, Usuarios, Mis Vacaciones, Clientes, Órdenes de Trabajo, **Bodega / Almacén**, Compras, Gastos, **Caja**, Reportes |
| **Rutas** | `/caja` debe abrir la página "Sistemas de caja"; `/bodega` debe abrir Bodega |
| **Dashboard** | Mismo contenido y enlaces que en local |
| **Footer** | Texto "© 2026 CRM Talleres" y línea **Build: prod** (o el valor de `VITE_APP_VERSION` si lo defines en `.env`) |

Si falta **Caja** o **Bodega** en el menú, o `/caja` da 404, el frontend desplegado es una versión antigua: hay que ejecutar **`./deploy.sh update`** en el servidor (o volver a construir y subir el frontend como en la sección 3).

### Opcional: versión visible en el footer

En el servidor, en el `.env` del proyecto, puedes definir:

```env
VITE_APP_VERSION=2025-03-16
```

Luego ejecuta `./deploy.sh update`. En el footer de la app verás **Build: 2025-03-16**. Así confirmas que se desplegó el build nuevo. Si no defines esta variable, se mostrará **Build: prod**.

### Forzar reconstrucción completa (sin caché)

```bash
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```
