# Script para promover cambios de Desarrollo a QA (rama testeo)
# Uso: .\scripts\promote-to-qa.ps1

$ErrorActionPreference = "Stop"

Write-Host "Promoviendo cambios de DESARROLLO a QA (testeo)..." -ForegroundColor Cyan

$status = git status -s
if ($status) {
    Write-Host "Error: Tienes cambios sin commitear." -ForegroundColor Red
    Write-Host "Por favor, commitea o descarta tus cambios primero." -ForegroundColor Red
    git status -s
    exit 1
}

$currentBranch = git branch --show-current

Write-Host "Actualizando rama desarrollo..." -ForegroundColor Yellow
git checkout desarrollo
git pull origin desarrollo

Write-Host "Mergeando desarrollo -> testeo (QA)..." -ForegroundColor Yellow
git checkout testeo
git pull origin testeo
git merge desarrollo -m "chore: promote desarrollo to QA"

Write-Host "`nSubiendo a origin testeo (QA)..." -ForegroundColor Yellow
git push origin testeo

Write-Host "Cambios promovidos a QA correctamente." -ForegroundColor Green
git checkout $currentBranch
Write-Host "Listo. Para desplegar en el servidor de prueba: git pull origin testeo y ./deploy.sh update" -ForegroundColor Cyan
Write-Host "Para llevar QA a produccion: ./scripts/promote-to-production.sh" -ForegroundColor Cyan
