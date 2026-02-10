# 🚀 Setup Rápido - CI/CD con Ambientes Locales

## 📋 Arquitectura

```
┌─────────────────┐
│ Desarrollo      │  → Docker Compose Local (localhost:3000)
│ rama: desarrollo│     Costo: $0
└─────────────────┘
        ↓
┌─────────────────┐
│ QA              │  → Docker Compose Local (localhost:3000)
│ rama: testeo    │     Costo: $0
└─────────────────┘
        ↓
┌─────────────────┐
│ Producción      │  → AWS Lightsail (IP_AWS:3000)
│ rama: main      │     Costo: $10/mes (3 meses gratis)
└─────────────────┘     Deploy automático con GitHub Actions
```

## ✅ Requisitos

- [x] Docker y Docker Compose instalados localmente
- [x] Git configurado
- [x] Cuenta de GitHub
- [ ] Cuenta de AWS (para producción)

## 🎯 Paso 1: Desarrollo Local (5 min)

```bash
# Clonar proyecto
git clone https://github.com/TU_REPO/crm-proyecto.git
cd crm-proyecto

# Checkout a desarrollo
git checkout desarrollo

# Copiar variables de entorno
cp .env.example .env
# Editar .env con valores locales

# Iniciar con Docker
docker-compose up -d

# Acceder a:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
# Adminer: http://localhost:8080
```

## 🧪 Paso 2: QA Local (5 min)

```bash
# Cambiar a rama de QA
git checkout testeo

# Mergear cambios de desarrollo
git merge desarrollo

# Iniciar ambiente
docker-compose up -d

# Probar aplicación en http://localhost:3000
```

## ☁️ Paso 3: Configurar Producción en AWS (30 min)

### 3.1 Crear Servidor AWS

1. Ve a https://lightsail.aws.amazon.com/
2. Click en "Create instance"
3. Selecciona:
   - Región: US East (Ohio) o la más cercana
   - Plataforma: Linux/Unix
   - Blueprint: Ubuntu 22.04 LTS
   - Plan: $10/mes (2 GB RAM)
4. Nombre: `crm-produccion`
5. Click "Create instance"

### 3.2 Configurar Firewall

1. Click en tu instancia
2. Networking → IPv4 Firewall
3. Agregar reglas:
   - HTTP (80)
   - HTTPS (443)
   - Custom TCP (8000) - Backend
   - Custom TCP (3000) - Frontend

### 3.3 Configurar Servidor

```bash
# Conectar por SSH
ssh -i clave.pem ubuntu@IP_AWS

# Descargar y ejecutar setup
curl -o setup-server.sh https://raw.githubusercontent.com/TU_REPO/main/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh

# Salir y reconectar
exit
ssh -i clave.pem ubuntu@IP_AWS

# Clonar proyecto
cd ~/crm-proyecto
git clone https://github.com/TU_REPO/crm-proyecto.git .
git checkout main

# Configurar .env
nano .env
```

Contenido del `.env` para producción:

```env
DB_ROOT_PASSWORD=password_seguro_123
DB_NAME=crm_talleres
DB_USER=crm_user
DB_PASSWORD=password_seguro_456
SECRET_KEY=genera_con_openssl_rand_hex_32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
VITE_API_URL=http://IP_AWS:8000
NODE_ENV=production
TZ=America/Mexico_City
```

```bash
# Iniciar aplicación
chmod +x deploy.sh
./deploy.sh start

# Verificar que funciona
curl http://localhost:8000/api/health
```

## 🔐 Paso 4: Configurar GitHub Secrets (10 min)

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Agrega estos secrets:

```
PROD_HOST = IP_AWS
PROD_USERNAME = ubuntu
PROD_SSH_KEY = <contenido completo de tu clave privada>
PROD_URL = http://IP_AWS:3000
PROD_DB_ROOT_PASSWORD = password_seguro_123
PROD_DB_NAME = crm_talleres
PROD_DB_USER = crm_user
PROD_DB_PASSWORD = password_seguro_456
PROD_SECRET_KEY = genera_con_openssl_rand_hex_32
VITE_API_URL_PROD = http://IP_AWS:8000
```

**Nota**: Para PROD_SSH_KEY, copia todo el contenido de tu archivo `.pem`

## 🎭 Paso 5: Configurar GitHub Environment (5 min)

1. Settings → Environments
2. Click "New environment"
3. Nombre: `production`
4. Click "Configure environment"
5. (Opcional) Agrega "Required reviewers"
6. Deployment branches: Selecciona "Selected branches" → `main`
7. Save

## 🧪 Paso 6: Probar el Pipeline (10 min)

```bash
# Hacer un cambio de prueba
git checkout desarrollo
echo "# Test CI/CD" >> test.txt
git add test.txt
git commit -m "test: verificar pipeline"
git push origin desarrollo

# Pasar a QA
git checkout testeo
git merge desarrollo
git push origin testeo

# Desplegar a producción
git checkout main
git merge testeo
git push origin main
```

Ve a GitHub → Actions y verifica que el workflow se ejecute.

## 🎉 ¡Listo!

Tu aplicación ahora tiene:

✅ Desarrollo local funcionando  
✅ QA local funcionando  
✅ Producción en AWS  
✅ Despliegue automático configurado  

## 📝 Flujo de Trabajo Diario

### Desarrollar

```bash
git checkout desarrollo
docker-compose up -d
# Hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push origin desarrollo
```

### Probar en QA

```bash
git checkout testeo
git merge desarrollo
docker-compose up -d
# Probar
git push origin testeo
```

### Desplegar a Producción

```powershell
# Windows
.\scripts\promote-to-production.ps1

# Linux/Mac
./scripts/promote-to-production.sh
```

## 🔧 Comandos Útiles

### Local

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reconstruir
docker-compose up -d --build
```

### Producción (en el servidor AWS)

```bash
# Ver estado
./deploy.sh status

# Ver logs
./deploy.sh logs

# Reiniciar
./deploy.sh restart

# Backup
./deploy.sh backup

# Actualizar
./deploy.sh update
```

## 💰 Costos

- **Desarrollo**: $0 (local)
- **QA**: $0 (local)
- **Producción**: $10/mes
- **Primeros 3 meses**: GRATIS

**Total: $10/mes después de 3 meses**

## 🆘 Problemas Comunes

### No puedo conectarme al servidor AWS

```bash
# Verificar permisos de la clave
chmod 400 clave.pem

# Intentar conexión
ssh -v -i clave.pem ubuntu@IP_AWS
```

### El pipeline falla en GitHub Actions

1. Verifica que todos los secrets estén configurados
2. Revisa los logs en GitHub Actions
3. Verifica que el servidor AWS esté accesible

### La aplicación local no inicia

```bash
# Ver logs
docker-compose logs

# Reconstruir
docker-compose down
docker-compose up -d --build
```

## 📚 Documentación Completa

- [README.md](README.md) - Documentación principal
- [CICD_SETUP.md](CICD_SETUP.md) - Configuración detallada del CI/CD
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía completa de despliegue
- [INFRAESTRUCTURA.md](INFRAESTRUCTURA.md) - Especificaciones de servidores
- [WORKFLOW.md](WORKFLOW.md) - Flujo de trabajo y mejores prácticas
- [RESUMEN_CICD.md](RESUMEN_CICD.md) - Resumen ejecutivo

## ✅ Checklist Final

- [ ] Docker instalado localmente
- [ ] Proyecto clonado y funcionando en local
- [ ] Servidor AWS creado y configurado
- [ ] GitHub Secrets configurados
- [ ] GitHub Environment configurado
- [ ] Pipeline probado exitosamente
- [ ] Aplicación accesible en AWS

---

**¿Necesitas ayuda?** Revisa la documentación completa o los logs para más información.
