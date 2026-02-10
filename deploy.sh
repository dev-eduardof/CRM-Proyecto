#!/bin/bash

# Script de despliegue para AWS
# Uso: ./deploy.sh [start|stop|restart|logs|update]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar que existe docker-compose
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose no está instalado"
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    print_error "Archivo .env no encontrado. Crea uno basado en .env.example"
    exit 1
fi

# Función para iniciar los servicios
start_services() {
    print_message "Iniciando servicios..."
    docker-compose -f docker-compose.prod.yml up -d
    print_message "Servicios iniciados correctamente"
    print_message "Backend API: http://$(curl -s ifconfig.me):8000"
    print_message "Frontend: http://$(curl -s ifconfig.me):3000"
    print_message "Adminer: http://$(curl -s ifconfig.me):8080"
}

# Función para detener los servicios
stop_services() {
    print_message "Deteniendo servicios..."
    docker-compose -f docker-compose.prod.yml down
    print_message "Servicios detenidos"
}

# Función para reiniciar los servicios
restart_services() {
    print_message "Reiniciando servicios..."
    docker-compose -f docker-compose.prod.yml restart
    print_message "Servicios reiniciados"
}

# Función para ver logs
show_logs() {
    print_message "Mostrando logs (Ctrl+C para salir)..."
    docker-compose -f docker-compose.prod.yml logs -f
}

# Función para actualizar el proyecto
update_project() {
    print_message "Actualizando proyecto..."
    
    # Backup de la base de datos
    print_message "Creando backup de la base de datos..."
    docker exec crm_db mysqldump -u ${DB_USER:-crm_user} -p${DB_PASSWORD:-crm_password} ${DB_NAME:-crm_talleres} > backup_$(date +%Y%m%d_%H%M%S).sql
    print_message "Backup creado: backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Si existe git, hacer pull
    if [ -d .git ]; then
        print_message "Actualizando código desde Git..."
        git pull
    fi
    
    # Reconstruir imágenes
    print_message "Reconstruyendo imágenes..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Reiniciar servicios
    print_message "Reiniciando servicios..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d
    
    print_message "Proyecto actualizado correctamente"
}

# Función para mostrar el estado
show_status() {
    print_message "Estado de los servicios:"
    docker-compose -f docker-compose.prod.yml ps
    
    print_message "\nUso de recursos:"
    docker stats --no-stream
}

# Función para hacer backup
backup_database() {
    print_message "Creando backup de la base de datos..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    docker exec crm_db mysqldump -u ${DB_USER:-crm_user} -p${DB_PASSWORD:-crm_password} ${DB_NAME:-crm_talleres} > $BACKUP_FILE
    print_message "Backup creado: $BACKUP_FILE"
}

# Función para limpiar Docker
clean_docker() {
    print_warning "Esto eliminará contenedores, imágenes y volúmenes no utilizados"
    read -p "¿Estás seguro? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_message "Limpiando Docker..."
        docker system prune -a --volumes -f
        print_message "Limpieza completada"
    else
        print_message "Limpieza cancelada"
    fi
}

# Menú principal
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    update)
        update_project
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    clean)
        clean_docker
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|logs|update|status|backup|clean}"
        echo ""
        echo "Comandos disponibles:"
        echo "  start   - Iniciar todos los servicios"
        echo "  stop    - Detener todos los servicios"
        echo "  restart - Reiniciar todos los servicios"
        echo "  logs    - Ver logs en tiempo real"
        echo "  update  - Actualizar el proyecto y reconstruir"
        echo "  status  - Ver estado de los servicios"
        echo "  backup  - Crear backup de la base de datos"
        echo "  clean   - Limpiar Docker (liberar espacio)"
        exit 1
        ;;
esac

exit 0
