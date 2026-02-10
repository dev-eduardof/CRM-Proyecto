# CI/CD Pipeline - Configuración

## Flujo de Despliegue

```
desarrollo (local) → testeo/QA (local) → main (AWS Producción)
```

- **DEV y QA**: Ambientes locales con Docker Compose
- **Producción**: Servidor AWS con despliegue automático

## Configuración de GitHub Secrets

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions

### Secrets para PRODUCCIÓN (únicos necesarios)

```
PROD_HOST=IP_SERVIDOR_AWS
PROD_USERNAME=ubuntu
PROD_SSH_KEY=<contenido de la clave privada SSH>
PROD_URL=http://IP_SERVIDOR_AWS:3000
PROD_DB_ROOT_PASSWORD=<password MUY seguro>
PROD_DB_NAME=crm_talleres
PROD_DB_USER=crm_user
PROD_DB_PASSWORD=<password MUY seguro>
PROD_SECRET_KEY=<openssl rand -hex 32>
VITE_API_URL_PROD=http://IP_SERVIDOR_AWS:8000
```

**Nota**: Si tienes dominio, usa:
- `PROD_URL=https://tudominio.com`
- `VITE_API_URL_PROD=https://api.tudominio.com`

## Flujo de Trabajo

### 1. Desarrollo Local
```bash
# Trabajas en la rama desarrollo
git checkout desarrollo

# Iniciar ambiente local
docker-compose up -d

# Haces tus cambios y pruebas
git add .
git commit -m "feat: nueva funcionalidad"
git push origin desarrollo
```

### 2. QA Local
```bash
# Cuando desarrollo está estable, lo pasas a QA
git checkout testeo
git merge desarrollo

# Probar en ambiente local
docker-compose up -d

# Si todo está bien, hacer push
git push origin testeo
```

### 3. Desplegar a Producción (AWS)
```bash
# Cuando QA está aprobado, lo pasas a producción
git checkout main
git merge testeo
git push origin main
# ✅ Se despliega automáticamente a AWS
```

## Comandos Útiles

### Ver estado del pipeline
```bash
# En GitHub: Actions tab
```

### Desplegar manualmente
```bash
# En GitHub: Actions → CI/CD Pipeline → Run workflow
```

### Rollback en caso de error
```bash
# Producción
git checkout main
git revert HEAD
git push origin main

# QA
git checkout testeo
git revert HEAD
git push origin testeo
```

## Configuración de Environments en GitHub

1. Ve a Settings → Environments
2. Crea un environment:
   - `production`

3. Configura `production`:
   - Required reviewers (recomendado)
   - Wait timer: 5 minutos (opcional)
   - Deployment branches: solo `main`

## Health Check

El pipeline verifica que la aplicación esté funcionando después del despliegue.
Asegúrate de tener un endpoint de health en tu backend:

```python
# backend/app/main.py
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
```
