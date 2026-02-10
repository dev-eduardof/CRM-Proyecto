#!/bin/bash

# Script de configuración inicial del servidor AWS
# Ejecutar este script después de conectarte por primera vez al servidor

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Configuración Inicial del Servidor AWS ===${NC}\n"

# Actualizar sistema
echo -e "${YELLOW}[1/7] Actualizando sistema...${NC}"
sudo apt update && sudo apt upgrade -y

# Instalar Docker
echo -e "${YELLOW}[2/7] Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker instalado correctamente${NC}"
else
    echo -e "${GREEN}Docker ya está instalado${NC}"
fi

# Instalar Docker Compose
echo -e "${YELLOW}[3/7] Instalando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo apt install docker-compose -y
    echo -e "${GREEN}Docker Compose instalado correctamente${NC}"
else
    echo -e "${GREEN}Docker Compose ya está instalado${NC}"
fi

# Instalar Git
echo -e "${YELLOW}[4/7] Instalando Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo apt install git -y
    echo -e "${GREEN}Git instalado correctamente${NC}"
else
    echo -e "${GREEN}Git ya está instalado${NC}"
fi

# Instalar utilidades
echo -e "${YELLOW}[5/7] Instalando utilidades...${NC}"
sudo apt install -y htop curl wget nano vim unzip

# Configurar firewall (UFW)
echo -e "${YELLOW}[6/7] Configurando firewall...${NC}"
sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8080/tcp
echo "y" | sudo ufw enable
echo -e "${GREEN}Firewall configurado${NC}"

# Configurar swap (para servidores con poca RAM)
echo -e "${YELLOW}[7/7] Configurando swap...${NC}"
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}Swap de 2GB configurado${NC}"
else
    echo -e "${GREEN}Swap ya está configurado${NC}"
fi

# Crear directorio para el proyecto
echo -e "\n${YELLOW}Creando directorio para el proyecto...${NC}"
mkdir -p ~/crm-proyecto
cd ~/crm-proyecto

# Información final
echo -e "\n${GREEN}=== Configuración completada ===${NC}\n"
echo -e "Próximos pasos:"
echo -e "1. Sube tu proyecto a este directorio: ~/crm-proyecto"
echo -e "2. Crea el archivo .env con tus variables de entorno"
echo -e "3. Ejecuta: ./deploy.sh start"
echo -e "\nPara aplicar los cambios de Docker, cierra sesión y vuelve a conectarte:"
echo -e "   exit"
echo -e "   ssh -i lightsail-key.pem ubuntu@TU_IP_PUBLICA"
echo -e "\n${GREEN}Tu IP pública es:${NC} $(curl -s ifconfig.me)"
