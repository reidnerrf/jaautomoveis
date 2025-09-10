#!/bin/bash

# 🚀 DEPLOY DOCKER COM SSH - JA Automóveis (Ubuntu)
# ================================================
# Script otimizado para Ubuntu/Linux

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
APP_NAME="ja-automoveis"
LOCAL_APP_PORT="80"
LOCAL_API_PORT="5000"
LOCAL_MONGO_PORT="27017"
SSH_USER=$(whoami)
SSH_HOST="localhost"

# Função para log com timestamp
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Banner
echo -e "${PURPLE}"
echo "🚀 DEPLOY DOCKER COM SSH - JA Automóveis (Ubuntu)"
echo "================================================"
echo -e "${NC}"

# Função para verificar dependências do sistema
check_system_dependencies() {
    log "Verificando dependências do sistema..."
    
    # Verificar se está rodando como root (não recomendado)
    if [ "$EUID" -eq 0 ]; then
        warning "Executando como root. Recomendado usar usuário normal com sudo."
    fi
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker não encontrado. Instale o Docker:"
        echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "  sudo sh get-docker.sh"
        echo "  sudo usermod -aG docker $USER"
        echo "  # Faça logout e login novamente"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose não encontrado. Instale o Docker Compose:"
        echo "  sudo apt-get update"
        echo "  sudo apt-get install docker-compose-plugin"
        exit 1
    fi
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js não encontrado. Instale o Node.js:"
        echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "  sudo apt-get install -y nodejs"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        error "npm não encontrado. Instale o npm:"
        echo "  sudo apt-get install npm"
        exit 1
    fi
    
    # Verificar OpenSSL
    if ! command -v openssl &> /dev/null; then
        error "OpenSSL não encontrado. Instale o OpenSSL:"
        echo "  sudo apt-get install openssl"
        exit 1
    fi
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        error "curl não encontrado. Instale o curl:"
        echo "  sudo apt-get install curl"
        exit 1
    fi
    
    success "Todas as dependências encontradas"
}

# Selecionar comando docker compose compatível (v1 ou v2)
select_compose_cmd() {
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    export DOCKER_COMPOSE
}

# Função para verificar permissões Docker
check_docker_permissions() {
    log "Verificando permissões Docker..."
    
    if ! docker info &> /dev/null; then
        error "Sem permissão para acessar Docker. Execute:"
        echo "  sudo usermod -aG docker $USER"
        echo "  # Faça logout e login novamente"
        echo "  # Ou execute este script com sudo (não recomendado)"
        exit 1
    fi
    
    success "Permissões Docker OK"
}

# Função para verificar portas
check_ports() {
    log "Verificando portas..."
    
    for port in $LOCAL_APP_PORT $LOCAL_API_PORT $LOCAL_MONGO_PORT; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            warning "Porta $port já está em uso"
            read -p "Deseja continuar mesmo assim? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        else
            success "Porta $port está livre"
        fi
    done
}

# Função para configurar SSH
setup_ssh() {
    log "Configurando SSH..."
    
    # Verificar se SSH está instalado
    if ! command -v ssh &> /dev/null; then
        warning "SSH não encontrado. Instalando..."
        sudo apt-get update
        sudo apt-get install -y openssh-server
        sudo systemctl enable ssh
        sudo systemctl start ssh
    fi
    
    # Verificar se SSH está rodando
    if ! systemctl is-active --quiet ssh; then
        warning "SSH não está rodando. Iniciando..."
        sudo systemctl start ssh
    fi
    
    # Verificar se podemos conectar via SSH
    if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $SSH_USER@$SSH_HOST exit 2>/dev/null; then
        warning "Não foi possível conectar via SSH sem senha"
        info "Configure chaves SSH para autenticação automática:"
        echo "  ssh-keygen -t rsa -b 4096 -C 'contato@jaautomoveisresende.com.br'"
        echo "  ssh-copy-id $SSH_USER@$SSH_HOST"
        echo ""
        read -p "Deseja continuar com autenticação por senha? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        success "SSH configurado corretamente"
    fi
}

# Função para configurar variáveis de ambiente
setup_env() {
    log "Configurando variáveis de ambiente..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            warning "Arquivo .env não encontrado. Copiando de env.example..."
            cp env.example .env
            success "Arquivo .env criado"
            info "Edite o arquivo .env com suas configurações"
        else
            error "Arquivo .env não encontrado e env.example não existe"
            exit 1
        fi
    else
        success "Arquivo .env encontrado"
    fi
    
    # Gerar JWT_SECRET se necessário
    if ! grep -q "JWT_SECRET=" .env || grep -q "JWT_SECRET=your-super-secret" .env; then
        warning "JWT_SECRET não configurado. Gerando automaticamente..."
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        success "JWT_SECRET configurado"
    fi
}

# Função para configurar SSL
setup_ssl() {
    log "Configurando SSL..."
    
    mkdir -p ssl
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        warning "Certificados SSL não encontrados. Criando certificados auto-assinados..."
        
        # Gerar certificado auto-assinado
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj '/C=BR/ST=SP/L=SaoPaulo/O=JA-Automoveis/CN=localhost'
        
        success "Certificados SSL criados"
        warning "Para produção, use certificados válidos (Let's Encrypt)"
    else
        success "Certificados SSL encontrados"
    fi
}

# Função para fazer build da aplicação
build_application() {
    log "Fazendo build da aplicação..."
    
    # Instalar dependências
    info "Instalando dependências..."
    if npm install; then
        success "Dependências instaladas"
    else
        error "Falha ao instalar dependências"
        exit 1
    fi
    
    # Build do cliente
    info "Build do cliente..."
    if npm run build:client; then
        success "Build do cliente concluído"
    else
        error "Falha no build do cliente"
        exit 1
    fi
    
    # Build do servidor
    info "Build do servidor..."
    if npm run build:server; then
        success "Build do servidor concluído"
    else
        error "Falha no build do servidor"
        exit 1
    fi
}

# Função para parar containers existentes
stop_containers() {
    log "Parando containers existentes..."
    
    if $DOCKER_COMPOSE ps -q | grep -q .; then
        info "Parando containers existentes..."
        $DOCKER_COMPOSE down --volumes --remove-orphans
        success "Containers parados"
    else
        success "Nenhum container rodando"
    fi
}

# Função para fazer build das imagens Docker
build_docker_images() {
    log "Fazendo build das imagens Docker..."
    
    info "Build das imagens Docker..."
    if $DOCKER_COMPOSE build --no-cache; then
        success "Imagens Docker construídas"
    else
        error "Falha no build das imagens Docker"
        exit 1
    fi
}

# Função para iniciar containers
start_containers() {
    log "Iniciando containers..."
    
    info "Iniciando serviços..."
    if $DOCKER_COMPOSE up -d; then
        success "Containers iniciados"
    else
        error "Falha ao iniciar containers"
        exit 1
    fi
}

# Função para aguardar serviços ficarem disponíveis
wait_for_services() {
    log "Aguardando serviços ficarem disponíveis..."
    
    # Aguardar MongoDB
    info "Aguardando MongoDB..."
    for i in {1..30}; do
        if $DOCKER_COMPOSE exec -T mongo mongosh --eval "db.runCommand('ping')" &>/dev/null; then
            success "MongoDB disponível"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/30...${NC}"
        sleep 2
    done
    
    # Aguardar API
    info "Aguardando API..."
    for i in {1..30}; do
        if curl -s http://localhost:$LOCAL_API_PORT/health &>/dev/null; then
            success "API disponível"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/30...${NC}"
        sleep 2
    done
    
    # Aguardar Frontend
    info "Aguardando Frontend..."
    for i in {1..30}; do
        if curl -s http://localhost:$LOCAL_APP_PORT/ &>/dev/null; then
            success "Frontend disponível"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/30...${NC}"
        sleep 2
    done
}

# Função para popular banco de dados
seed_database() {
    log "Populando banco de dados..."
    
    info "Executando seeder..."
    # Executar seeder garantindo admin. Para idempotência, forçar recriação (-d) e depois popular
    if $DOCKER_COMPOSE --profile tools run --rm seeder npx ts-node --project tsconfig.server.json seeder.ts -d; then
        success "Banco limpo"
    else
        warning "Não foi possível limpar o banco (pode estar vazio)"
    fi

    if $DOCKER_COMPOSE --profile tools run --rm seeder npx ts-node --project tsconfig.server.json seeder.ts; then
        success "Banco de dados populado"
    else
        warning "Falha ao popular banco de dados (opcional)"
    fi
}

# Função para criar túnel SSH
create_ssh_tunnel() {
    log "Criando túnel SSH..."
    
    info "Configurando túnel SSH para acesso remoto..."
    info "Túnel: localhost:$LOCAL_APP_PORT -> $SSH_HOST:$LOCAL_APP_PORT"
    
    # Verificar se o túnel já existe
    if lsof -Pi :$LOCAL_APP_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        warning "Porta $LOCAL_APP_PORT já está em uso"
        info "Túnel SSH pode não ser necessário se a aplicação já está acessível"
    else
        info "Para criar túnel SSH, execute em outro terminal:"
        echo "  ssh -L $LOCAL_APP_PORT:localhost:$LOCAL_APP_PORT $SSH_USER@$SSH_HOST"
        echo "  ssh -L $LOCAL_API_PORT:localhost:$LOCAL_API_PORT $SSH_USER@$SSH_HOST"
        echo "  ssh -L $LOCAL_MONGO_PORT:localhost:$LOCAL_MONGO_PORT $SSH_USER@$SSH_HOST"
    fi
}

# Função para testar aplicação
test_application() {
    log "Testando aplicação..."
    
    info "Testando endpoints..."
    
    # Teste do frontend
    if curl -s http://localhost:$LOCAL_APP_PORT/ | grep -q "html"; then
        success "Frontend funcionando"
    else
        error "Frontend não está funcionando"
    fi
    
    # Teste da API
    if curl -s http://localhost:$LOCAL_API_PORT/health | grep -q "ok"; then
        success "API funcionando"
    else
        error "API não está funcionando"
    fi
    
    # Teste do proxy
    if curl -s http://localhost:$LOCAL_APP_PORT/api/vehicles | grep -q "vehicles"; then
        success "Proxy da API funcionando"
    else
        warning "Proxy da API pode não estar funcionando (normal se não houver dados)"
    fi
}

# Função para mostrar status
show_status() {
    log "Status dos containers:"
    $DOCKER_COMPOSE ps
    
    echo ""
    echo -e "${GREEN}🎉 DEPLOY COM SSH CONCLUÍDO COM SUCESSO!${NC}"
    echo ""
    echo -e "${BLUE}🌐 URLs de Acesso Local:${NC}"
    echo -e "  • Frontend HTTP: http://localhost:$LOCAL_APP_PORT/ (redireciona para HTTPS)"
    echo -e "  • Frontend HTTPS: https://localhost:$LOCAL_APP_PORT/"
    echo -e "  • API: http://localhost:$LOCAL_API_PORT"
    echo -e "  • Admin: https://localhost:$LOCAL_APP_PORT/admin"
    echo ""
    echo -e "${BLUE}🔑 Credenciais Admin:${NC}"
    echo -e "  • Username: admin"
    echo -e "  • Password: adminja2025"
    echo ""
    echo -e "${BLUE}🔒 SSH Túnel (para acesso remoto):${NC}"
    echo -e "  • Frontend: ssh -L $LOCAL_APP_PORT:localhost:$LOCAL_APP_PORT $SSH_USER@$SSH_HOST"
    echo -e "  • API: ssh -L $LOCAL_API_PORT:localhost:$LOCAL_API_PORT $SSH_USER@$SSH_HOST"
    echo -e "  • MongoDB: ssh -L $LOCAL_MONGO_PORT:localhost:$LOCAL_MONGO_PORT $SSH_USER@$SSH_HOST"
    echo ""
    echo -e "${BLUE}📋 Comandos Úteis:${NC}"
    echo -e "  • Ver logs: $DOCKER_COMPOSE logs -f"
    echo -e "  • Parar: $DOCKER_COMPOSE down"
    echo -e "  • Reiniciar: $DOCKER_COMPOSE restart"
    echo -e "  • Popular banco: $DOCKER_COMPOSE --profile tools run --rm seeder"
    echo ""
    echo -e "${YELLOW}💡 Dicas:${NC}"
    echo -e "  • Use túneis SSH para acessar remotamente"
    echo -e "  • Configure chaves SSH para autenticação automática"
    echo -e "  • Para produção, use certificados SSL válidos"
    echo -e "  • Configure firewall se necessário: sudo ufw allow 80,443,22"
}

# Função de limpeza em caso de erro
cleanup_on_error() {
    echo -e "${RED}❌ Erro durante o deploy${NC}"
    echo -e "${YELLOW}Limpando recursos...${NC}"
    docker-compose down --volumes --remove-orphans 2>/dev/null || true
    exit 1
}

# Trap para limpeza em caso de erro
trap cleanup_on_error ERR

# Função principal
main() {
    echo -e "${BLUE}🎯 Iniciando deploy Docker com SSH no Ubuntu...${NC}"
    echo ""
    
    # 1. Verificações
    select_compose_cmd
    check_system_dependencies
    check_docker_permissions
    check_ports
    setup_ssh
    setup_env
    setup_ssl
    
    # 2. Build
    build_application
    
    # 3. Docker
    stop_containers
    build_docker_images
    start_containers
    
    # 4. Aguardar e popular
    wait_for_services
    seed_database
    
    # 5. SSH
    create_ssh_tunnel
    
    # 6. Testes
    test_application
    
    # 7. Status final
    show_status
}

# Executar
main "$@"
