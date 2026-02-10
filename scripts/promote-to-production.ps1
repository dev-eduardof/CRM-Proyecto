# Script PowerShell para promover cambios de QA a Producción

Write-Host "🚀 Promoviendo cambios de QA a PRODUCCIÓN..." -ForegroundColor Green
Write-Host "⚠️  ADVERTENCIA: Esto desplegará a PRODUCCIÓN" -ForegroundColor Yellow

# Verificar que estamos en un estado limpio
$status = git status -s
if ($status) {
    Write-Host "❌ Error: Tienes cambios sin commitear" -ForegroundColor Red
    Write-Host "Por favor, commitea o descarta tus cambios primero" -ForegroundColor Yellow
    exit 1
}

# Guardar rama actual
$currentBranch = git branch --show-current

# Actualizar testeo
Write-Host "📥 Actualizando rama testeo (QA)..." -ForegroundColor Cyan
git checkout testeo
git pull origin testeo

# Cambiar a main y mergear
Write-Host "🔀 Mergeando testeo → main..." -ForegroundColor Cyan
git checkout main
git pull origin main
git merge testeo -m "chore: promote QA to production"

# Mostrar cambios
Write-Host ""
Write-Host "📋 Cambios que se van a desplegar a PRODUCCIÓN:" -ForegroundColor Yellow
git log main..testeo --oneline

Write-Host ""
Write-Host "⚠️  ¿Estás seguro de desplegar a PRODUCCIÓN?" -ForegroundColor Yellow
$confirm = Read-Host "Escribe 'PRODUCCION' para confirmar"

if ($confirm -eq "PRODUCCION") {
    git push origin main
    Write-Host "✅ Cambios promovidos a PRODUCCIÓN exitosamente" -ForegroundColor Green
    Write-Host "🔗 Revisa el despliegue en: https://github.com/TU_REPO/actions" -ForegroundColor Cyan
    
    # Crear tag de release
    $tag = "release-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    git tag -a "$tag" -m "Production release $(Get-Date -Format 'yyyy-MM-dd')"
    git push origin "$tag"
    Write-Host "🏷️  Tag creado: $tag" -ForegroundColor Cyan
} else {
    Write-Host "❌ Push cancelado" -ForegroundColor Red
    git reset --hard origin/main
}

# Volver a la rama original
git checkout $currentBranch

Write-Host "✨ Proceso completado" -ForegroundColor Green
