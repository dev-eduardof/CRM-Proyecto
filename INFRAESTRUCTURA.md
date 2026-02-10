# Infraestructura - Ambientes

## Arquitectura

```
┌─────────────────────┐
│  Desarrollo Local   │  → Docker Compose
│  rama: desarrollo   │     localhost:3000
└─────────────────────┘

┌─────────────────────┐
│     QA Local        │  → Docker Compose
│   rama: testeo      │     localhost:3000
└─────────────────────┘

┌─────────────────────┐
│  Producción AWS     │  → Servidor en la nube
│    rama: main       │     IP_AWS:3000
└─────────────────────┘
```

## Ambientes Locales (DEV y QA)

### Desarrollo
- **Ubicación**: Computadora local
- **Tecnología**: Docker Compose
- **Rama Git**: `desarrollo`
- **URL**: http://localhost:3000
- **Costo**: $0

### QA
- **Ubicación**: Computadora local
- **Tecnología**: Docker Compose
- **Rama Git**: `testeo`
- **URL**: http://localhost:3000
- **Costo**: $0

## Servidor de Producción (AWS)

### Especificaciones Recomendadas
- **RAM**: 2 GB mínimo (4 GB recomendado)
- **vCPU**: 2
- **Almacenamiento**: 50 GB SSD
- **Transferencia**: 2 TB/mes
- **Backups**: Automáticos
- **SSL/HTTPS**: Recomendado

### Opciones de Servidor

#### Opción 1: AWS Lightsail (Recomendado)
- **$10/mes**: 2 GB RAM, 1 vCPU, 60 GB SSD
- **$20/mes**: 4 GB RAM, 2 vCPU, 80 GB SSD
- **Ventajas**: Fácil de configurar, precio fijo
- **3 meses gratis** para nuevas cuentas

#### Opción 2: AWS EC2
- **t3.small**: ~$15/mes (2 GB RAM, 2 vCPU)
- **t3.medium**: ~$30/mes (4 GB RAM, 2 vCPU)
- **Ventajas**: Más flexible, escalable
- **12 meses gratis** con Free Tier (t2.micro)

#### Opción 3: DigitalOcean
- **$12/mes**: 2 GB RAM, 1 vCPU, 50 GB SSD
- **$24/mes**: 4 GB RAM, 2 vCPU, 80 GB SSD
- **Ventajas**: Interfaz simple, buen soporte
- **$200 crédito** para nuevas cuentas

## Configuración del Servidor de Producción

### Pasos:

1. **Crear instancia en AWS Lightsail**
   - Ve a https://lightsail.aws.amazon.com/
   - Create instance
   - Ubuntu 22.04 LTS
   - Plan: $10/mes (2 GB RAM)

2. **Configurar firewall**
   - Networking → IPv4 Firewall
   - Agregar: 22 (SSH), 80 (HTTP), 443 (HTTPS), 8000 (Backend), 3000 (Frontend)

3. **Conectar por SSH**
```bash
ssh -i clave.pem ubuntu@IP_SERVIDOR
```

4. **Ejecutar setup**
```bash
./setup-server.sh
```

5. **Clonar repositorio**
```bash
cd ~/crm-proyecto
git clone https://github.com/TU_REPO/crm-proyecto.git .
git checkout main
```

6. **Configurar .env**
```bash
nano .env
# Copiar configuración de producción
```

7. **Iniciar aplicación**
```bash
chmod +x deploy.sh
./deploy.sh start
```

## Costos Mensuales

### Recomendado para Empezar
- **Producción**: AWS Lightsail $10/mes (2 GB RAM)
- **DEV/QA**: Local (gratis)
- **Total: $10/mes**

### Para Más Tráfico
- **Producción**: AWS Lightsail $20/mes (4 GB RAM)
- **DEV/QA**: Local (gratis)
- **Total: $20/mes**

### Primeros 3 Meses
- AWS Lightsail ofrece **3 meses gratis**
- **Costo inicial: $0**
