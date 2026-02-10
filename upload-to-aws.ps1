# Script de PowerShell para subir el proyecto a AWS desde Windows
# Uso: .\upload-to-aws.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyPath
)

Write-Host "=== Subiendo proyecto a AWS ===" -ForegroundColor Green
Write-Host ""

# Verificar que existe la clave SSH
if (-not (Test-Path $KeyPath)) {
    Write-Host "Error: No se encuentra la clave SSH en: $KeyPath" -ForegroundColor Red
    exit 1
}

# Crear archivo temporal con archivos a excluir
$excludeFile = "exclude-list.txt"
@"
node_modules/
.git/
.vscode/
.idea/
__pycache__/
*.pyc
*.log
dist/
build/
uploads/
backup_*.sql
.env
"@ | Out-File -FilePath $excludeFile -Encoding utf8

Write-Host "[1/4] Comprimiendo proyecto..." -ForegroundColor Yellow

# Comprimir el proyecto (excluyendo archivos innecesarios)
$zipFile = "crm-proyecto.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile
}

# Obtener todos los archivos excepto los excluidos
$filesToZip = Get-ChildItem -Path . -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules' -and
        $_.FullName -notmatch '\.git' -and
        $_.FullName -notmatch '__pycache__' -and
        $_.FullName -notmatch 'dist' -and
        $_.FullName -notmatch 'uploads' -and
        $_.Extension -ne '.log'
    }

Compress-Archive -Path $filesToZip -DestinationPath $zipFile -Force

Write-Host "[2/4] Subiendo proyecto al servidor..." -ForegroundColor Yellow
Write-Host "Esto puede tardar varios minutos dependiendo de tu conexión..." -ForegroundColor Gray

# Subir archivo al servidor
scp -i $KeyPath $zipFile ubuntu@${ServerIP}:~/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir el archivo" -ForegroundColor Red
    Remove-Item $excludeFile
    exit 1
}

Write-Host "[3/4] Descomprimiendo en el servidor..." -ForegroundColor Yellow

# Descomprimir en el servidor
ssh -i $KeyPath ubuntu@$ServerIP @"
cd ~
if [ -d crm-proyecto ]; then
    echo 'Creando backup del proyecto anterior...'
    mv crm-proyecto crm-proyecto.backup.`$(date +%Y%m%d_%H%M%S)
fi
mkdir -p crm-proyecto
unzip -o crm-proyecto.zip -d crm-proyecto
rm crm-proyecto.zip
cd crm-proyecto
chmod +x deploy.sh
chmod +x setup-server.sh
echo 'Proyecto descomprimido correctamente'
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al descomprimir el archivo" -ForegroundColor Red
    Remove-Item $excludeFile
    Remove-Item $zipFile
    exit 1
}

Write-Host "[4/4] Limpiando archivos temporales..." -ForegroundColor Yellow
Remove-Item $excludeFile
Remove-Item $zipFile

Write-Host ""
Write-Host "=== Proyecto subido correctamente ===" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Conecta al servidor:" -ForegroundColor White
Write-Host "   ssh -i $KeyPath ubuntu@$ServerIP" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configura las variables de entorno:" -ForegroundColor White
Write-Host "   cd ~/crm-proyecto" -ForegroundColor Gray
Write-Host "   nano .env" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Inicia la aplicación:" -ForegroundColor White
Write-Host "   ./deploy.sh start" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Accede a tu aplicación:" -ForegroundColor White
Write-Host "   Frontend: http://${ServerIP}:3000" -ForegroundColor Gray
Write-Host "   Backend:  http://${ServerIP}:8000/docs" -ForegroundColor Gray
Write-Host ""

# Preguntar si desea conectarse ahora
$connect = Read-Host "¿Deseas conectarte al servidor ahora? (s/n)"
if ($connect -eq "s" -or $connect -eq "S") {
    ssh -i $KeyPath ubuntu@$ServerIP
}
