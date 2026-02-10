# Script PowerShell para promover cambios de desarrollo a QA

Write-Host "🚀 Promoviendo cambios de DESARROLLO a QA..." -ForegroundColor Green

# Verificar que estamos en un estado limpio
$status = git status -s
if ($status) {
    Write-Host "❌ Error: Tienes cambios sin commitear" -ForegroundColor Red
    Write-Host "Por favor, commitea o descarta tus cambios primero" -ForegroundColor Yellow
    exit 1
}

# Guardar rama actual
$currentBranch = git branch --show-current

# Actualizar desarrollo
Write-Host "📥 Actualizando rama desarrollo..." -ForegroundColor Cyan
git checkout desarrollo
git pull origin desarrollo

# Cambiar a testeo y mergear
Write-Host "🔀 Mergeando desarrollo → testeo..." -ForegroundColor Cyan
git checkout testeo
git pull origin testeo
git merge desarrollo -m "chore: promote desarrollo to QA"

# Mostrar cambios
Write-Host ""
Write-Host "📋 Cambios que se van a desplegar a QA:" -ForegroundColor Yellow
git log testeo..desarrollo --oneline

Write-Host ""
$confirm = Read-Host "¿Deseas continuar con el push a QA? (s/n)"

if ($confirm -eq "s" -or $confirm -eq "S") {
    git push origin testeo
    Write-Host "✅ Cambios promovidos a QA exitosamente" -ForegroundColor Green
    Write-Host "🔗 Revisa el despliegue en: https://github.com/TU_REPO/actions" -ForegroundColor Cyan
} else {
    Write-Host "❌ Push cancelado" -ForegroundColor Red
    git reset --hard origin/testeo
}

# Volver a la rama original
git checkout $currentBranch

Write-Host "✨ Proceso completado" -ForegroundColor Green
