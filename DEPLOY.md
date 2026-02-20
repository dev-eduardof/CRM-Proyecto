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
