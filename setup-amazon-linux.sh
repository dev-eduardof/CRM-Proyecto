#!/bin/bash
# Configuración completa para Amazon Linux (Amazon_Torno)
# Servidor: 16.148.80.123 - Oregon, Zona A
# Ejecutar como: ec2-user (o el usuario que uses por SSH)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Configuración Amazon_Torno (Amazon Linux) ===${NC}\n"

# 1. Actualizar sistema
echo -e "${YELLOW}[1/8] Actualizando sistema...${NC}"
sudo dnf update -y

# 2. Instalar Docker
echo -e "${YELLOW}[2/8] Instalando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    sudo dnf install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo -e "${GREEN}Docker instalado${NC}"
else
    echo -e "${GREEN}Docker ya instalado${NC}"
fi

# 3. Instalar Docker Compose
echo -e "${YELLOW}[3/8] Instalando Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose instalado${NC}"
else
    echo -e "${GREEN}Docker Compose ya instalado${NC}"
fi

# 4. Instalar Git y utilidades
echo -e "${YELLOW}[4/8] Instalando Git y utilidades...${NC}"
sudo dnf install -y git curl wget nano htop unzip

# 5. Configurar firewall (firewalld en Amazon Linux)
echo -e "${YELLOW}[5/8] Configurando firewall...${NC}"
if command -v firewall-cmd &> /dev/null; then
    sudo firewall-cmd --permanent --add-port=22/tcp    # SSH
    sudo firewall-cmd --permanent --add-port=80/tcp    # HTTP
    sudo firewall-cmd --permanent --add-port=443/tcp   # HTTPS
    sudo firewall-cmd --permanent --add-port=3000/tcp  # Frontend
    sudo firewall-cmd --permanent --add-port=8000/tcp  # Backend
    sudo firewall-cmd --permanent --add-port=8080/tcp  # Adminer (opcional)
    sudo firewall-cmd --reload
    echo -e "${GREEN}Firewall configurado${NC}"
else
    echo -e "${YELLOW}firewalld no encontrado. Configura los puertos en la consola AWS (Lightsail/EC2)${NC}"
fi

# 6. Swap (1 GB RAM es poco para Docker)
echo -e "${YELLOW}[6/8] Configurando swap 2GB...${NC}"
if [ ! -f /swapfile ]; then
    sudo dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}Swap 2GB configurado${NC}"
else
    echo -e "${GREEN}Swap ya existe${NC}"
fi

# 7. Seguridad: deshabilitar login root por SSH (opcional, comentado por si acaso)
# echo -e "${YELLOW}[7/8] Ajustes de seguridad...${NC}"
# grep -q "PermitRootLogin no" /etc/ssh/sshd_config || echo "PermitRootLogin no" | sudo tee -a /etc/ssh/sshd_config
# sudo systemctl restart sshd

# 8. Crear directorio del proyecto
echo -e "${YELLOW}[8/8] Creando directorio del proyecto...${NC}"
mkdir -p ~/crm-proyecto

echo -e "\n${GREEN}=== Configuración completada ===${NC}\n"
echo -e "Cierra sesión y vuelve a conectar para que Docker funcione sin sudo:"
echo -e "  exit"
echo -e "  ssh -i TU_CLAVE.pem ec2-user@16.148.80.123"
echo -e "\nLuego ejecuta los pasos de clonación y .env (ver guía)."
