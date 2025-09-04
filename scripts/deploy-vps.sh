#!/bin/bash

# Script para deploy em VPS
# Configuração completa para produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 DEPLOY VPS - JA Automóveis${NC}"
echo -e "${BLUE}============================${NC}"
echo ""

# Função para log
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Verificar se é root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        echo -e "${RED}❌ Não execute como root${NC}"
        echo -e "${YELLOW}Use: sudo su - seu-usuario${NC}"
        exit 1
    fi
}

# Instalar dependências
install_dependencies() {
    log "Instalando dependências..."
    
    # Atualizar sistema
    sudo apt update
    
    # Instalar Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${BLUE}📦 Instalando Docker...${NC}"
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi
    
    # Instalar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${BLUE}📦 Instalando Docker Compose...${NC}"
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Instalar Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${BLUE}📦 Instalando Node.js...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
}

# Configurar firewall
setup_firewall() {
    log "Configurando firewall..."
    
    # UFW
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw --force enable
    
    echo -e "${GREEN}✅ Firewall configurado${NC}"
}

# Configurar SSL
setup_ssl() {
    log "Configurando SSL..."
    
    # Criar diretório SSL
    mkdir -p ssl
    
    # Verificar se já existe certificado
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        echo -e "${YELLOW}⚠️  Certificados SSL não encontrados${NC}"
        echo -e "${YELLOW}Criando certificados auto-assinados para teste...${NC}"
        
        # Gerar certificado auto-assinado
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=BR/ST=SP/L=SaoPaulo/O=JA-Automoveis/CN=localhost"
        
        echo -e "${GREEN}✅ Certificados SSL criados${NC}"
        echo -e "${YELLOW}⚠️  Para produção, use Let's Encrypt ou certificado válido${NC}"
    else
        echo -e "${GREEN}✅ Certificados SSL encontrados${NC}"
    fi
}

# Configurar .env
setup_env() {
    log "Configurando variáveis de ambiente..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Arquivo .env criado${NC}"
        echo -e "${YELLOW}Edite o arquivo .env com suas configurações${NC}"
    fi
    
    # Gerar JWT_SECRET se não existir
    if ! grep -q "JWT_SECRET=" .env || grep -q "JWT_SECRET=your-super-secret" .env; then
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        echo -e "${GREEN}✅ JWT_SECRET configurado${NC}"
    fi
    
    echo -e "${GREEN}✅ Variáveis de ambiente configuradas${NC}"
}

# Build da aplicação
build_application() {
    log "Fazendo build da aplicação..."
    
    # Instalar dependências
    npm install
    
    # Build
    npm run build
    
    echo -e "${GREEN}✅ Build concluído${NC}"
}

# Deploy
deploy() {
    log "Fazendo deploy..."
    
    # Parar containers existentes
    docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans 2>/dev/null || true
    
    # Build e iniciar
    docker-compose -f docker-compose.prod.yml up -d --build
    
    echo -e "${GREEN}✅ Deploy concluído${NC}"
}

# Popular banco
seed_database() {
    log "Populando banco de dados..."
    
    docker-compose -f docker-compose.prod.yml --profile tools run --rm seeder
    
    echo -e "${GREEN}✅ Banco populado${NC}"
}

# Configurar systemd (opcional)
setup_systemd() {
    log "Configurando systemd..."
    
    # Criar serviço systemd
    sudo tee /etc/systemd/system/ja-automoveis.service > /dev/null <<EOF
[Unit]
Description=JA Automoveis Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    # Recarregar systemd
    sudo systemctl daemon-reload
    sudo systemctl enable ja-automoveis.service
    
    echo -e "${GREEN}✅ Serviço systemd configurado${NC}"
}

# Mostrar status
show_status() {
    log "Status do deploy:"
    
    docker-compose -f docker-compose.prod.yml ps
    
    echo ""
    echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO!${NC}"
    echo ""
    echo -e "${BLUE}🌐 URLs:${NC}"
    echo -e "  • HTTP: http://$(curl -s ifconfig.me)/"
    echo -e "  • HTTPS: https://$(curl -s ifconfig.me)/"
    echo ""
    echo -e "${BLUE}🔑 Credenciais Admin:${NC}"
    echo -e "  • Username: admin"
    echo -e "  • Password: adminja2025"
    echo ""
    echo -e "${BLUE}📋 Comandos Úteis:${NC}"
    echo -e "  • Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo -e "  • Parar: docker-compose -f docker-compose.prod.yml down"
    echo -e "  • Reiniciar: docker-compose -f docker-compose.prod.yml restart"
    echo -e "  • Status: docker-compose -f docker-compose.prod.yml ps"
}

# Execução principal
main() {
    echo -e "${BLUE}🎯 Iniciando deploy em VPS...${NC}"
    echo ""
    
    check_root
    install_dependencies
    setup_firewall
    setup_ssl
    setup_env
    build_application
    deploy
    seed_database
    setup_systemd
    show_status
}

# Executar
main "$@"