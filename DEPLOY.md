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
