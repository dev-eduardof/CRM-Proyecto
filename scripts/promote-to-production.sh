#!/bin/bash
# Script para promover cambios de QA a Producción

set -e

echo "🚀 Promoviendo cambios de QA a PRODUCCIÓN..."
echo "⚠️  ADVERTENCIA: Esto desplegará a PRODUCCIÓN"

# Verificar que estamos en un estado limpio
if [[ -n $(git status -s) ]]; then
    echo "❌ Error: Tienes cambios sin commitear"
    echo "Por favor, commitea o descarta tus cambios primero"
    exit 1
fi

# Guardar rama actual
CURRENT_BRANCH=$(git branch --show-current)

# Actualizar testeo
echo "📥 Actualizando rama testeo (QA)..."
git checkout testeo
git pull origin testeo

# Cambiar a main y mergear
echo "🔀 Mergeando testeo → main..."
git checkout main
git pull origin main
git merge testeo -m "chore: promote QA to production"

# Mostrar cambios
echo ""
echo "📋 Cambios que se van a desplegar a PRODUCCIÓN:"
git log main..testeo --oneline

echo ""
echo "⚠️  ¿Estás seguro de desplegar a PRODUCCIÓN?"
read -p "Escribe 'PRODUCCION' para confirmar: " CONFIRM

if [[ $CONFIRM == "PRODUCCION" ]]; then
    git push origin main
    echo "✅ Cambios promovidos a PRODUCCIÓN exitosamente"
    echo "🔗 Revisa el despliegue en: https://github.com/TU_REPO/actions"
    
    # Crear tag de release
    TAG="release-$(date +%Y%m%d-%H%M%S)"
    git tag -a "$TAG" -m "Production release $(date +%Y-%m-%d)"
    git push origin "$TAG"
    echo "🏷️  Tag creado: $TAG"
else
    echo "❌ Push cancelado"
    git reset --hard origin/main
fi

# Volver a la rama original
git checkout $CURRENT_BRANCH

echo "✨ Proceso completado"
