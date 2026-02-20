#!/bin/bash
# Script para promover cambios de Desarrollo a QA (rama testeo)
# Uso: ./scripts/promote-to-qa.sh

set -e

echo "🧪 Promoviendo cambios de DESARROLLO a QA (testeo)..."

# Verificar que estamos en un estado limpio
if [[ -n $(git status -s) ]]; then
    echo "❌ Error: Tienes cambios sin commitear"
    echo "Por favor, commitea o descarta tus cambios primero:"
    git status -s
    exit 1
fi

# Guardar rama actual
CURRENT_BRANCH=$(git branch --show-current)

# Actualizar desarrollo
echo "📥 Actualizando rama desarrollo..."
git checkout desarrollo
git pull origin desarrollo

# Cambiar a testeo (QA) y mergear
echo "🔀 Mergeando desarrollo → testeo (QA)..."
git checkout testeo
git pull origin testeo
git merge desarrollo -m "chore: promote desarrollo to QA"

echo ""
echo "📋 Cambios que se suben a QA:"
git log testeo..desarrollo --oneline 2>/dev/null || git log -3 --oneline

echo ""
echo "📤 Subiendo a origin testeo (QA)..."
git push origin testeo

echo "✅ Cambios promovidos a QA exitosamente"

# Volver a la rama original
git checkout "$CURRENT_BRANCH"

echo "✨ Listo. Para desplegar en el servidor de prueba (QA), en el servidor ejecuta: git pull origin testeo y ./deploy.sh update"
echo "   Para llevar QA a producción después: ./scripts/promote-to-production.sh"
