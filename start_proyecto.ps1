# Script maestro para iniciar el proyecto CRM Talleres
# Este script inicia backend y frontend en terminales separadas

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRM TALLERES - Inicio del Proyecto  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
if (-Not (Test-Path "backend") -or -Not (Test-Path "frontend")) {
    Write-Host "Error: No se encuentran las carpetas backend o frontend" -ForegroundColor Red
    Write-Host "Asegurate de estar en la carpeta raiz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js $nodeVersion encontrado" -ForegroundColor Green
} catch {
    Write-Host "Node.js no encontrado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar Python
Write-Host "Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "$pythonVersion encontrado" -ForegroundColor Green
} catch {
    Write-Host "Python no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Iniciando servicios..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar Backend en nueva ventana
Write-Host "1. Iniciando Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; .\start_backend.ps1"
Start-Sleep -Seconds 2

# Iniciar Frontend en nueva ventana
Write-Host "2. Iniciando Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; .\start_frontend.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Servicios iniciados correctamente  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servicios disponibles en:" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales por defecto:" -ForegroundColor Cyan
Write-Host "  Usuario: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Para detener los servicios, cierra las ventanas de PowerShell" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Enter para cerrar..." -ForegroundColor Gray
Read-Host
