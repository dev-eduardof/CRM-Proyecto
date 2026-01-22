# Script para iniciar el frontend
Write-Host "Iniciando Frontend CRM Talleres..." -ForegroundColor Cyan

# Verificar que estamos en la carpeta correcta
if (-Not (Test-Path "package.json")) {
    Write-Host "Error: No se encuentra package.json" -ForegroundColor Red
    Write-Host "Asegúrate de estar en la carpeta frontend" -ForegroundColor Red
    exit 1
}

# Verificar que node_modules existe
if (-Not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

# Iniciar servidor
Write-Host "Iniciando servidor React en http://localhost:3000..." -ForegroundColor Green
Write-Host ""
Write-Host "Presiona CTRL+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

npm run dev
