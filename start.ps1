# Script para iniciar el proyecto CRM Talleres
# PowerShell script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRM TALLERES - Inicio del Proyecto  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está instalado
Write-Host "Verificando Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✓ Docker encontrado" -ForegroundColor Green
    docker --version
} else {
    Write-Host "✗ Docker no encontrado. Por favor instala Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar si existe .env
if (-Not (Test-Path ".env")) {
    Write-Host "⚠ Archivo .env no encontrado" -ForegroundColor Yellow
    Write-Host "Copiando .env.example a .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Archivo .env creado" -ForegroundColor Green
    Write-Host "⚠ Por favor edita .env con tus configuraciones" -ForegroundColor Yellow
    Write-Host ""
}

# Preguntar qué hacer
Write-Host "¿Qué deseas hacer?" -ForegroundColor Cyan
Write-Host "1. Iniciar todos los servicios (Docker)"
Write-Host "2. Detener todos los servicios"
Write-Host "3. Ver logs"
Write-Host "4. Reconstruir imágenes"
Write-Host "5. Limpiar todo (contenedores y volúmenes)"
Write-Host "6. Ver estado de servicios"
Write-Host "0. Salir"
Write-Host ""

$opcion = Read-Host "Selecciona una opción"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "Iniciando servicios..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host ""
        Write-Host "✓ Servicios iniciados" -ForegroundColor Green
        Write-Host ""
        Write-Host "Accede a:" -ForegroundColor Cyan
        Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
        Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
        Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor White
        Write-Host "  Adminer:   http://localhost:8080" -ForegroundColor White
        Write-Host ""
        Write-Host "Ver logs: docker-compose logs -f" -ForegroundColor Gray
    }
    "2" {
        Write-Host ""
        Write-Host "Deteniendo servicios..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✓ Servicios detenidos" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Yellow
        docker-compose logs -f
    }
    "4" {
        Write-Host ""
        Write-Host "Reconstruyendo imágenes..." -ForegroundColor Yellow
        docker-compose build
        Write-Host "✓ Imágenes reconstruidas" -ForegroundColor Green
    }
    "5" {
        Write-Host ""
        Write-Host "⚠ ADVERTENCIA: Esto eliminará todos los contenedores y volúmenes" -ForegroundColor Red
        $confirmar = Read-Host "¿Estás seguro? (s/n)"
        if ($confirmar -eq "s") {
            Write-Host "Limpiando..." -ForegroundColor Yellow
            docker-compose down -v
            Write-Host "✓ Limpieza completada" -ForegroundColor Green
        } else {
            Write-Host "Operación cancelada" -ForegroundColor Yellow
        }
    }
    "6" {
        Write-Host ""
        Write-Host "Estado de los servicios:" -ForegroundColor Yellow
        docker-compose ps
    }
    "0" {
        Write-Host "Saliendo..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Opción no válida" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Presiona Enter para continuar..."
Read-Host
