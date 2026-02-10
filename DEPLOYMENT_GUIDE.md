# Guía de Despliegue CI/CD

## 🎯 Resumen

Este proyecto tiene configurado un pipeline de CI/CD con ambientes locales y producción en AWS:

```
desarrollo (LOCAL) → testeo/QA (LOCAL) → main (AWS PRODUCCIÓN)
```

## 📋 Checklist de Configuración

### 1. Preparar Ambientes

- [ ] Docker y Docker Compose instalados localmente
- [ ] Crear servidor de PRODUCCIÓN en AWS (Lightsail $10/mes)
- [ ] Configurar firewall en servidor AWS (puertos 22, 80, 443, 8000, 3000)
- [ ] Guardar la IP pública del servidor

### 2. Configurar Servidor de Producción

```bash
# Conectar por SSH al servidor AWS
ssh -i clave.pem ubuntu@IP_SERVIDOR

# Ejecutar setup
curl -o setup-server.sh https://raw.githubusercontent.com/TU_REPO/main/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh

# Salir y volver a conectar para aplicar cambios de Docker
exit
ssh -i clave.pem ubuntu@IP_SERVIDOR

# Clonar proyecto
cd ~/crm-proyecto
git clone https://github.com/TU_REPO/crm-proyecto.git .
git checkout main

# Configurar .env (usar config/env.production.example)
nano .env
# Pegar configuración de producción

# Dar permisos
chmod +x deploy.sh

# Iniciar
./deploy.sh start
```

### 3. Configurar GitHub Secrets

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions

Agrega los siguientes secrets para PRODUCCIÓN:

```
PROD_HOST=IP_SERVIDOR_AWS
PROD_USERNAME=ubuntu
PROD_SSH_KEY=<contenido completo de la clave privada>
PROD_URL=http://IP_SERVIDOR_AWS:3000
PROD_DB_ROOT_PASSWORD=<password seguro>
PROD_DB_NAME=crm_talleres
PROD_DB_USER=crm_user
PROD_DB_PASSWORD=<password seguro>
PROD_SECRET_KEY=<openssl rand -hex 32>
VITE_API_URL_PROD=http://IP_SERVIDOR_AWS:8000
```

### 4. Configurar GitHub Environments

1. Ve a Settings → Environments
2. Crea un environment: `production`
3. Configura `production`:
   - ✅ Required reviewers (recomendado)
   - ✅ Wait timer: 5 minutos (opcional)
   - ✅ Deployment branches: solo `main`

### 5. Verificar el Pipeline

```bash
# Hacer un cambio de prueba
git checkout desarrollo
echo "# Test" >> test.txt
git add test.txt
git commit -m "test: verificar pipeline"
git push origin desarrollo
```

Ve a GitHub → Actions y verifica que el workflow se ejecute correctamente.

## 🔄 Flujo de Trabajo Diario

### Desarrollo Local

```bash
# 1. Trabajar en desarrollo
git checkout desarrollo
git pull origin desarrollo

# 2. Iniciar ambiente local
docker-compose up -d

# 3. Hacer cambios y probar en http://localhost:3000
# ... editar archivos ...

# 4. Commit y push
git add .
git commit -m "feat: nueva funcionalidad"
git push origin desarrollo
```

### QA Local

Cuando desarrollo está estable y listo para pruebas:

```bash
# 1. Cambiar a rama de QA
git checkout testeo
git pull origin testeo

# 2. Mergear desarrollo
git merge desarrollo

# 3. Iniciar ambiente local
docker-compose up -d

# 4. Probar en http://localhost:3000
# ... hacer pruebas de calidad ...

# 5. Si todo está bien, hacer push
git push origin testeo
```

### Desplegar a Producción (AWS)

Cuando QA está aprobado:

**Windows:**
```powershell
.\scripts\promote-to-production.ps1
```

**Linux/Mac:**
```bash
./scripts/promote-to-production.sh
```

O manualmente:
```bash
git checkout main
git pull origin main
git merge testeo
git push origin main
# ✅ Se despliega automáticamente a AWS
```

## 🐛 Rollback en Caso de Error

### Rollback en Desarrollo
```bash
git checkout desarrollo
git revert HEAD
git push origin desarrollo
```

### Rollback en QA
```bash
git checkout testeo
git revert HEAD
git push origin testeo
```

### Rollback en Producción
```bash
git checkout main
git revert HEAD
git push origin main
```

O restaurar a un commit específico:
```bash
git checkout main
git reset --hard COMMIT_HASH
git push origin main --force
```

## 📊 Monitoreo

### Ver Estado del Pipeline
- GitHub → Actions → CI/CD Pipeline

### Ver Logs del Servidor
```bash
ssh -i clave.pem ubuntu@IP_SERVIDOR
cd ~/crm-proyecto
./deploy.sh logs
```

### Health Checks
- DEV: http://IP_DEV:8000/api/health
- QA: http://IP_QA:8000/api/health
- PROD: https://tudominio.com/api/health

## 🔧 Comandos Útiles

### En el Servidor
```bash
# Ver estado
./deploy.sh status

# Ver logs
./deploy.sh logs

# Reiniciar
./deploy.sh restart

# Backup
./deploy.sh backup

# Actualizar manualmente
./deploy.sh update
```

### En Local
```bash
# Ver ramas
git branch -a

# Ver último deploy
git log --oneline -5

# Ver diferencias entre ambientes
git diff testeo..desarrollo
git diff main..testeo
```

## 📈 Mejores Prácticas

1. **Siempre desarrollar en `desarrollo`**
   - Nunca hacer commits directos a `testeo` o `main`

2. **Probar en QA antes de producción**
   - No saltarse el ambiente de QA

3. **Hacer backups antes de desplegar a producción**
   - El script lo hace automáticamente

4. **Usar commits descriptivos**
   - `feat:` para nuevas funcionalidades
   - `fix:` para correcciones
   - `chore:` para tareas de mantenimiento
   - `docs:` para documentación

5. **Revisar los logs después de cada deploy**
   ```bash
   ./deploy.sh logs
   ```

6. **Monitorear el health check**
   - Verificar que responda OK después de cada deploy

## 🆘 Solución de Problemas

### El pipeline falla en GitHub Actions

1. Revisa los logs en GitHub Actions
2. Verifica que los secrets estén configurados correctamente
3. Verifica que el servidor esté accesible por SSH

### El deploy falla en el servidor

```bash
# Conectar al servidor
ssh -i clave.pem ubuntu@IP_SERVIDOR

# Ver logs
cd ~/crm-proyecto
./deploy.sh logs

# Verificar estado de Docker
docker-compose -f docker-compose.prod.yml ps

# Reiniciar servicios
./deploy.sh restart
```

### La aplicación no responde después del deploy

```bash
# Verificar que los contenedores estén corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs específicos
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs db

# Verificar health check
curl http://localhost:8000/api/health
```

### Error de base de datos

```bash
# Reiniciar base de datos
docker-compose -f docker-compose.prod.yml restart db

# Ver logs de la BD
docker-compose -f docker-compose.prod.yml logs db

# Conectar a la BD
docker exec -it crm_db mysql -u crm_user -p
```

## 📞 Soporte

- **Documentación**: [README.md](README.md)
- **CI/CD Setup**: [CICD_SETUP.md](CICD_SETUP.md)
- **Infraestructura**: [INFRAESTRUCTURA.md](INFRAESTRUCTURA.md)
- **GitHub Issues**: Para reportar problemas

## ✅ Verificación Final

Después de configurar todo, verifica:

- [ ] Los 3 servidores están corriendo
- [ ] Puedes acceder a cada ambiente por su URL
- [ ] El health check responde en cada ambiente
- [ ] Un push a `desarrollo` despliega automáticamente
- [ ] Un merge a `testeo` despliega automáticamente
- [ ] Un merge a `main` despliega automáticamente
- [ ] Los backups se crean correctamente
- [ ] Puedes ver los logs de cada ambiente

## 🎉 ¡Listo!

Tu pipeline de CI/CD está configurado. Ahora cada push desplegará automáticamente al ambiente correspondiente.
