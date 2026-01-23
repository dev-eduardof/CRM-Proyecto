# 📝 CAMBIOS EN BASE DE DATOS

## Fecha: 22/01/2026

### 🔧 Modificaciones Realizadas

#### 1. Actualización del ENUM de roles
**Tabla**: `usuarios`  
**Columna**: `rol`

**Antes**:
```sql
rol ENUM('admin','recepcion','tecnico','caja','auxiliar','jefe_taller')
```

**Después**:
```sql
rol ENUM('ADMIN','TECNICO','RECEPCION','CAJA','AUXILIAR','JEFE_TALLER')
```

**Comando ejecutado**:
```sql
ALTER TABLE usuarios 
MODIFY COLUMN rol ENUM('ADMIN','TECNICO','RECEPCION','CAJA','AUXILIAR','JEFE_TALLER') NOT NULL;
```

**Razón**: Consistencia con el modelo Python que usa valores en MAYÚSCULAS.

---

#### 2. Actualización del usuario admin

**Usuario**: `admin`

**Cambios realizados**:
- ✅ Rol actualizado de `'admin'` a `'ADMIN'`
- ✅ Hash de contraseña regenerado y verificado

**Comando ejecutado**:
```sql
UPDATE usuarios 
SET rol = 'ADMIN',
    password_hash = '$2b$12$pbmllVqOdHViIwMNAkisnOR2Edkk.MM4v1IMWwjSQImrajPGrPPS.'
WHERE username = 'admin';
```

**Contraseña**: `admin123`  
**Hash verificado**: ✅ Sí (60 caracteres, formato bcrypt correcto)

---

### 📊 Estado Final del Usuario Admin

```sql
SELECT * FROM usuarios WHERE username = 'admin';
```

**Resultado**:
- **ID**: 1
- **Username**: admin
- **Email**: admin@crmtalleres.com
- **Nombre completo**: Administrador
- **Rol**: ADMIN
- **Activo**: 1 (Sí)
- **Password hash**: $2b$12$pbmllVqOdHViIwMNAkisnOR2Edkk.MM4v1IMWwjSQImrajPGrPPS.
- **Created at**: (timestamp original)
- **Updated at**: (timestamp de actualización)

---

### ✅ Verificaciones Realizadas

1. ✅ ENUM actualizado correctamente
2. ✅ Rol del usuario admin en MAYÚSCULAS
3. ✅ Hash de contraseña con longitud correcta (60 caracteres)
4. ✅ Hash verificado con bcrypt
5. ✅ Usuario activo
6. ✅ Login funcional desde el frontend

---

### 🔐 Credenciales de Acceso

**Usuario**: `admin`  
**Contraseña**: `admin123`  
**Rol**: ADMIN  
**Permisos**: Acceso completo al sistema

---

### 📝 Notas Importantes

1. El ENUM ahora usa valores en MAYÚSCULAS para consistencia con el código Python
2. El hash de contraseña fue generado usando bcrypt con salt aleatorio
3. La contraseña cumple con los requisitos mínimos de seguridad
4. El usuario está activo y listo para usar

---

### 🔄 Para Replicar en Otros Ambientes

Si necesitas replicar estos cambios en otro ambiente (desarrollo, producción):

```sql
-- 1. Actualizar ENUM de roles
ALTER TABLE usuarios 
MODIFY COLUMN rol ENUM('ADMIN','TECNICO','RECEPCION','CAJA','AUXILIAR','JEFE_TALLER') NOT NULL;

-- 2. Actualizar roles existentes (si es necesario)
UPDATE usuarios SET rol = 'ADMIN' WHERE rol = 'admin';
UPDATE usuarios SET rol = 'TECNICO' WHERE rol = 'tecnico';
UPDATE usuarios SET rol = 'RECEPCION' WHERE rol = 'recepcion';

-- 3. Crear usuario admin si no existe
-- (Generar hash con: python -c "import bcrypt; print(bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode())")
INSERT INTO usuarios (username, email, nombre_completo, password_hash, rol, activo)
VALUES ('admin', 'admin@crmtalleres.com', 'Administrador', 
        '$2b$12$pbmllVqOdHViIwMNAkisnOR2Edkk.MM4v1IMWwjSQImrajPGrPPS.', 
        'ADMIN', TRUE)
ON DUPLICATE KEY UPDATE 
    rol = 'ADMIN',
    password_hash = '$2b$12$pbmllVqOdHViIwMNAkisnOR2Edkk.MM4v1IMWwjSQImrajPGrPPS.';
```

---

**Última actualización**: 22/01/2026  
**Estado**: ✅ COMPLETADO Y VERIFICADO
