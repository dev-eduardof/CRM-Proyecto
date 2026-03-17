# Script para construir y levantar todos los contenedores del CRM Talleres
# Ejecutar desde la raíz del proyecto: .\levantar-contenedores.ps1

Set-Location $PSScriptRoot

Write-Host "=== CRM Talleres - Construyendo y levantando contenedores ===" -ForegroundColor Cyan
Write-Host ""

# Construir imágenes y levantar servicios
Write-Host "Construyendo imágenes y arrancando contenedores..." -ForegroundColor Yellow
docker compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Contenedores en ejecución:" -ForegroundColor Green
    docker compose ps
    Write-Host ""
    Write-Host "Servicios disponibles:" -ForegroundColor Green
    Write-Host "  - Backend (API):     http://localhost:8000"
    Write-Host "  - Frontend:          http://localhost:3000"
    Write-Host "  - Adminer (BD):      http://localhost:8080"
    Write-Host "  - MariaDB:           localhost:3306"
} else {
    Write-Host "Error al levantar contenedores. Revisa que Docker esté en marcha." -ForegroundColor Red
    exit 1
}
