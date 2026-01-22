# Script Maestro para iniciar el Proyecto CRM Talleres
# Este script inicia tanto el backend como el frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CRM TALLERES - Inicio del Proyecto  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-Not (Test-Path "backend") -or -Not (Test-Path "frontend")) {
    Write-Host "Error: No se encuentran las carpetas backend y frontend" -ForegroundColor Red
    Write-Host "Asegúrate de ejecutar este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar MariaDB
Write-Host "Verificando MariaDB..." -ForegroundColor Yellow
$mariadbService = Get-Service | Where-Object {$_.Name -like "*maria*"}
if ($mariadbService) {
    if ($mariadbService.Status -eq "Running") {
        Write-Host "✓ MariaDB está corriendo" -ForegroundColor Green
    } else {
        Write-Host "⚠ MariaDB no está corriendo. Intentando iniciar..." -ForegroundColor Yellow
        try {
            Start-Service $mariadbService.Name
            Write-Host "✓ MariaDB iniciado" -ForegroundColor Green
        } catch {
            Write-Host "✗ No se pudo iniciar MariaDB automáticamente" -ForegroundColor Red
            Write-Host "Inicia MariaDB manualmente desde Servicios de Windows" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⚠ No se encontró el servicio de MariaDB" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Iniciando servicios..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para iniciar en nueva ventana
function Start-InNewWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    $encodedCommand = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($Command))
    Start-Process powershell -ArgumentList "-NoExit", "-EncodedCommand", $encodedCommand -WorkingDirectory $WorkingDirectory
    Write-Host "✓ $Title iniciado en nueva ventana" -ForegroundColor Green
}

# Iniciar Backend
Write-Host "Iniciando Backend..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "backend"
$backendCommand = @"
Write-Host 'Iniciando Backend CRM Talleres...' -ForegroundColor Cyan
Write-Host ''
& '.\venv\Scripts\Activate.ps1'
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"@
Start-InNewWindow -Title "Backend" -Command $backendCommand -WorkingDirectory $backendPath
Start-Sleep -Seconds 2

# Iniciar Frontend
Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $PSScriptRoot "frontend"
$frontendCommand = @"
Write-Host 'Iniciando Frontend CRM Talleres...' -ForegroundColor Cyan
Write-Host ''
npm run dev
"@
Start-InNewWindow -Title "Frontend" -Command $frontendCommand -WorkingDirectory $frontendPath
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Proyecto Iniciado Exitosamente    " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Servicios disponibles:" -ForegroundColor Cyan
Write-Host "  • Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "  • Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "  • API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Credenciales:" -ForegroundColor Cyan
Write-Host "  • Usuario: admin" -ForegroundColor White
Write-Host "  • Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Para detener los servicios, cierra las ventanas de PowerShell" -ForegroundColor Yellow
Write-Host ""
Write-Host "Presiona Enter para cerrar esta ventana..." -ForegroundColor Gray
Read-Host
