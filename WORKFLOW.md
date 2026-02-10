# Workflow CI/CD - Diagrama de Flujo

## 📊 Flujo Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESARROLLO LOCAL                              │
│                                                                  │
│  Rama: desarrollo                                                │
│  Ubicación: Docker Compose local                                │
│  URL: http://localhost:3000                                     │
│  Costo: $0                                                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Developer trabaja en local                           │  │
│  │  2. docker-compose up -d                                 │  │
│  │  3. Hacer cambios y probar                               │  │
│  │  4. git commit y push                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Cuando está estable
                              │ git merge desarrollo
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        QA LOCAL                                  │
│                                                                  │
│  Rama: testeo                                                    │
│  Ubicación: Docker Compose local                                │
│  URL: http://localhost:3000                                     │
│  Costo: $0                                                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Merge de 'desarrollo' a 'testeo'                     │  │
│  │  2. docker-compose up -d                                 │  │
│  │  3. QA Team prueba la aplicación                         │  │
│  │  4. Aprobar o rechazar                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Cuando QA aprueba
                              │ ./scripts/promote-to-production.ps1
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN AWS                                │
│                                                                  │
│  Rama: main                                                      │
│  Servidor: AWS Lightsail                                         │
│  URL: http://IP_AWS:3000                                        │
│  Costo: $10/mes (3 meses gratis)                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Merge de 'testeo' a 'main'                           │  │
│  │  2. Push a GitHub                                         │  │
│  │  3. GitHub Actions ejecuta:                              │  │
│  │     - Tests                                               │  │
│  │     - Build Docker images                                │  │
│  │     - Backup de BD                                        │  │
│  │     - Deploy a AWS                                        │  │
│  │     - Health check                                        │  │
│  │     - Crear tag de release                               │  │
│  │  4. ✅ Aplicación actualizada en producción              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Ciclo de Vida de un Feature

```
1. DESARROLLO LOCAL
   ├─ Developer trabaja en rama 'desarrollo'
   ├─ docker-compose up -d (ambiente local)
   ├─ Desarrolla y prueba localmente
   ├─ git commit y push a 'desarrollo'
   └─ ✅ Cambios en repositorio

2. QA LOCAL
   ├─ git checkout testeo
   ├─ git merge desarrollo
   ├─ docker-compose up -d (ambiente local)
   ├─ QA Team prueba
   ├─ Si hay bugs → volver a paso 1
   └─ Si todo OK → continuar a paso 3

3. PRODUCCIÓN AWS
   ├─ Cuando QA aprueba
   ├─ Ejecutar: .\scripts\promote-to-production.ps1
   ├─ git push origin main
   ├─ ✅ GitHub Actions despliega automáticamente a AWS
   ├─ Crear tag de release
   ├─ Monitorear aplicación
   └─ Si hay problemas → Rollback
```

## 🎯 Estrategia de Branching

```
main (producción)
  │
  ├─ testeo (QA)
  │    │
  │    ├─ desarrollo (dev)
  │    │    │
  │    │    ├─ feature/nueva-funcionalidad
  │    │    ├─ fix/corregir-bug
  │    │    └─ chore/actualizar-deps
  │    │
  │    └─ hotfix/bug-critico (directo a testeo si es urgente)
  │
  └─ hotfix/bug-produccion (directo a main en emergencias)
```

## 📅 Calendario de Deploys Sugerido

### Desarrollo Local (Continuo)
- **Frecuencia**: Múltiples veces al día
- **Horario**: Cualquier momento
- **Ubicación**: Local
- **Aprobación**: Automática

### QA Local (Semanal)
- **Frecuencia**: 1-2 veces por semana
- **Horario**: Lunes y Jueves por la mañana
- **Ubicación**: Local
- **Aprobación**: Tech Lead

### Producción AWS (Quincenal)
- **Frecuencia**: Cada 2 semanas
- **Horario**: Viernes después de QA aprobado
- **Ubicación**: AWS
- **Aprobación**: Product Owner + Tech Lead
- **Ventana**: Fuera de horario pico

## 🚨 Proceso de Hotfix

Para bugs críticos en producción:

```bash
# 1. Crear hotfix desde main
git checkout main
git checkout -b hotfix/descripcion-bug
git push origin hotfix/descripcion-bug

# 2. Hacer el fix
# ... corregir el bug ...

# 3. Crear PR a main
# En GitHub: Pull Request a main

# 4. Después de merge a main, backport a otras ramas
git checkout testeo
git cherry-pick COMMIT_HASH
git push origin testeo

git checkout desarrollo
git cherry-pick COMMIT_HASH
git push origin desarrollo
```

## 📊 Métricas de Despliegue

### Objetivos
- **Tiempo de deploy**: < 5 minutos
- **Tasa de éxito**: > 95%
- **Tiempo de rollback**: < 2 minutos
- **Downtime**: 0 (zero-downtime deployment)

### Monitorear
- Frecuencia de deploys
- Tasa de fallos
- Tiempo promedio de deploy
- Número de rollbacks

## 🔐 Seguridad en el Pipeline

### Secrets Management
- ✅ Todos los secrets en GitHub Secrets
- ✅ Nunca en código
- ✅ Diferentes por ambiente
- ✅ Rotación periódica (cada 3 meses)

### Acceso a Servidores
- ✅ Solo por SSH con clave
- ✅ Sin acceso root directo
- ✅ Firewall configurado
- ✅ Logs de acceso habilitados

### Backups
- ✅ Automáticos antes de cada deploy a QA/PROD
- ✅ Retención: 30 días
- ✅ Pruebas de restauración mensuales

## 📈 Escalabilidad

### Agregar Más Ambientes

Para agregar staging, preview, etc:

1. Crear nueva rama (ej: `staging`)
2. Crear nuevo servidor
3. Agregar secrets en GitHub
4. Agregar job en `.github/workflows/ci-cd-pipeline.yml`
5. Crear script de promoción

### Múltiples Regiones

Para desplegar en múltiples regiones:

1. Crear servidores en cada región
2. Configurar load balancer
3. Replicar base de datos
4. Actualizar pipeline para deploy paralelo

## ✅ Checklist Pre-Deploy

Antes de cada deploy a producción:

- [ ] Tests pasan en CI
- [ ] QA aprobó los cambios
- [ ] Backup de BD creado
- [ ] Changelog actualizado
- [ ] Documentación actualizada
- [ ] Stakeholders notificados
- [ ] Ventana de mantenimiento comunicada
- [ ] Plan de rollback listo

## 🎓 Mejores Prácticas

1. **Commits Pequeños y Frecuentes**
   - Más fácil de revisar
   - Más fácil de revertir
   - Menos conflictos

2. **Siempre Pasar por QA**
   - No saltarse ambientes
   - Probar en condiciones similares a producción

3. **Automatizar Todo**
   - Tests
   - Builds
   - Deploys
   - Backups

4. **Monitorear Constantemente**
   - Logs
   - Métricas
   - Health checks
   - Alertas

5. **Documentar Cambios**
   - Commits descriptivos
   - Pull requests con contexto
   - Changelog actualizado

## 🔗 Referencias

- [README.md](README.md) - Documentación principal
- [CICD_SETUP.md](CICD_SETUP.md) - Configuración detallada
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía de despliegue
- [INFRAESTRUCTURA.md](INFRAESTRUCTURA.md) - Especificaciones de servidores
