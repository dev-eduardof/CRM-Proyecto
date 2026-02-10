#!/bin/bash
# Script para promover cambios de desarrollo a QA

set -e

echo "🚀 Promoviendo cambios de DESARROLLO a QA..."

# Verificar que estamos en un estado limpio
if [[ -n $(git status -s) ]]; then
    echo "❌ Error: Tienes cambios sin commitear"
    echo "Por favor, commitea o descarta tus cambios primero"
    exit 1
fi

# Guardar rama actual
CURRENT_BRANCH=$(git branch --show-current)

# Actualizar desarrollo
echo "📥 Actualizando rama desarrollo..."
git checkout desarrollo
git pull origin desarrollo

# Cambiar a testeo y mergear
echo "🔀 Mergeando desarrollo → testeo..."
git checkout testeo
git pull origin testeo
git merge desarrollo -m "chore: promote desarrollo to QA"

# Mostrar cambios
echo ""
echo "📋 Cambios que se van a desplegar a QA:"
git log testeo..desarrollo --oneline

echo ""
read -p "¿Deseas continuar con el push a QA? (s/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Ss]$ ]]; then
    git push origin testeo
    echo "✅ Cambios promovidos a QA exitosamente"
    echo "🔗 Revisa el despliegue en: https://github.com/TU_REPO/actions"
else
    echo "❌ Push cancelado"
    git reset --hard origin/testeo
fi

# Volver a la rama original
git checkout $CURRENT_BRANCH

echo "✨ Proceso completado"
