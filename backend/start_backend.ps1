# Script para iniciar el backend
Write-Host "Iniciando Backend CRM Talleres..." -ForegroundColor Cyan

# Activar entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Verificar que estamos en la carpeta correcta
if (-Not (Test-Path "app\main.py")) {
    Write-Host "Error: No se encuentra app\main.py" -ForegroundColor Red
    Write-Host "Asegúrate de estar en la carpeta backend" -ForegroundColor Red
    exit 1
}

# Iniciar servidor
Write-Host "Iniciando servidor FastAPI en http://localhost:8000..." -ForegroundColor Green
Write-Host "API Docs disponible en: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona CTRL+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
