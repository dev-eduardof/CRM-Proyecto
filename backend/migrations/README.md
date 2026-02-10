# Migraciones de Base de Datos

Este directorio contiene las migraciones SQL para la base de datos del CRM.

## Cómo aplicar las migraciones

### Opción 1: Usando Docker (Recomendado)

Si estás usando Docker Compose, puedes ejecutar la migración con:

```bash
# Copiar el archivo SQL al contenedor
docker cp migrations/001_add_sucursales_and_notificaciones.sql crm-db:/tmp/

# Ejecutar la migración
docker exec -it crm-db psql -U postgres -d crm_talleres -f /tmp/001_add_sucursales_and_notificaciones.sql
```

### Opción 2: Conexión directa a PostgreSQL

Si tienes acceso directo a PostgreSQL:

```bash
psql -U postgres -d crm_talleres -f migrations/001_add_sucursales_and_notificaciones.sql
```

### Opción 3: Desde pgAdmin u otra herramienta GUI

1. Abre el archivo SQL en tu editor
2. Copia el contenido
3. Ejecuta el script en tu herramienta de administración de base de datos

## Lista de Migraciones

| Archivo | Fecha | Descripción |
|---------|-------|-------------|
| 001_add_sucursales_and_notificaciones.sql | 2026-02-10 | Agrega tabla de sucursales y campos de notificación en órdenes |

## Notas Importantes

- Las migraciones están diseñadas para ser idempotentes (se pueden ejecutar múltiples veces sin causar errores)
- Siempre haz un respaldo de la base de datos antes de aplicar migraciones en producción
- Las migraciones deben ejecutarse en orden secuencial
