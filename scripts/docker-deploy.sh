#!/bin/bash

# Script para deploy com Docker
# Frontend em http://localhost/ (porta 80)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 DEPLOY DOCKER - JA Automóveis${NC}"
echo -e "${BLUE}===============================${NC}"
echo ""

# Função para log com timestamp
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Verificar se Docker está disponível
check_docker() {
    log "Verificando Docker..."
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker não encontrado${NC}"
        echo -e "${YELLOW}Instale o Docker primeiro: https://docs.docker.com/get-docker/${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose não encontrado${NC}"
        echo -e "${YELLOW}Instale o Docker Compose primeiro${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker disponível${NC}"
}

# Verificar se as portas estão livres
check_ports() {
    log "Verificando portas..."
    
    for port in 80 5000 27017; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}❌ Porta $port já está em uso${NC}"
            echo -e "${YELLOW}Por favor, libere a porta $port ou pare o serviço${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Porta $port está livre${NC}"
        fi
    done
}

# Configurar SSL
setup_ssl() {
    log "Configurando SSL..."
    
    # Criar diretório SSL
    mkdir -p ssl
    
    # Verificar se já existe certificado
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        echo -e "${YELLOW}⚠️  Certificados SSL não encontrados${NC}"
        echo -e "${YELLOW}Criando certificados auto-assinados para desenvolvimento...${NC}"
        
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

# Configurar variáveis de ambiente
setup_env() {
    log "Configurando variáveis de ambiente..."
    
    if [ ! -f .env ]; then
        echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
        echo -e "${YELLOW}Criando arquivo .env de exemplo...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}Por favor, edite o arquivo .env com suas configurações${NC}"
    fi
    
    # Verificar se JWT_SECRET está definido
    if ! grep -q "JWT_SECRET=" .env || grep -q "JWT_SECRET=your-super-secret" .env; then
        echo -e "${YELLOW}⚠️  JWT_SECRET não configurado${NC}"
        echo -e "${YELLOW}Gerando JWT_SECRET aleatório...${NC}"
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        echo -e "${GREEN}✅ JWT_SECRET configurado${NC}"
    fi
    
    # Atualizar ALLOWED_ORIGINS para HTTPS
    if ! grep -q "https://" .env; then
        echo -e "${YELLOW}⚠️  Atualizando ALLOWED_ORIGINS para incluir HTTPS${NC}"
        sed -i.bak "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=http://localhost,https://localhost,http://localhost:5000|" .env
        echo -e "${GREEN}✅ ALLOWED_ORIGINS atualizado${NC}"
    fi
    
    echo -e "${GREEN}✅ Variáveis de ambiente configuradas${NC}"
}

# Build da aplicação
build_application() {
    log "Fazendo build da aplicação..."
    
    echo -e "${BLUE}📦 Instalando dependências...${NC}"
    if npm install; then
        echo -e "${GREEN}✅ Dependências instaladas${NC}"
    else
        echo -e "${RED}❌ Falha ao instalar dependências${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔨 Build do cliente...${NC}"
    if npm run build:client; then
        echo -e "${GREEN}✅ Build do cliente concluído${NC}"
    else
        echo -e "${RED}❌ Falha no build do cliente${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔨 Build do servidor...${NC}"
    if npm run build:server; then
        echo -e "${GREEN}✅ Build do servidor concluído${NC}"
    else
        echo -e "${RED}❌ Falha no build do servidor${NC}"
        exit 1
    fi
}

# Parar containers existentes
stop_containers() {
    log "Parando containers existentes..."
    
    if docker-compose ps -q | grep -q .; then
        echo -e "${BLUE}🛑 Parando containers...${NC}"
        docker-compose down --volumes --remove-orphans
        echo -e "${GREEN}✅ Containers parados${NC}"
    else
        echo -e "${GREEN}✅ Nenhum container rodando${NC}"
    fi
}

# Build das imagens Docker
build_docker_images() {
    log "Fazendo build das imagens Docker..."
    
    echo -e "${BLUE}🐳 Build da imagem da aplicação...${NC}"
    if docker-compose build --no-cache; then
        echo -e "${GREEN}✅ Imagens Docker construídas${NC}"
    else
        echo -e "${RED}❌ Falha no build das imagens Docker${NC}"
        exit 1
    fi
}

# Iniciar containers
start_containers() {
    log "Iniciando containers..."
    
    echo -e "${BLUE}🚀 Iniciando serviços...${NC}"
    if docker-compose up -d; then
        echo -e "${GREEN}✅ Containers iniciados${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar containers${NC}"
        exit 1
    fi
}

# Aguardar serviços ficarem disponíveis
wait_for_services() {
    log "Aguardando serviços ficarem disponíveis..."
    
    # Aguardar MongoDB
    echo -e "${BLUE}⏳ Aguardando MongoDB...${NC}"
    for i in {1..30}; do
        if docker-compose exec -T mongo mongosh --eval "db.runCommand('ping')" &>/dev/null; then
            echo -e "${GREEN}✅ MongoDB disponível${NC}"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/30...${NC}"
        sleep 2
    done
    
    # Aguardar API
    echo -e "${BLUE}⏳ Aguardando API...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:5000/health &>/dev/null; then
            echo -e "${GREEN}✅ API disponível${NC}"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/30...${NC}"
        sleep 2
    done
    
    # Aguardar Frontend
    echo -e "${BLUE}⏳ Aguardando Frontend...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost/ &>/dev/null; then
            echo -e "${GREEN}✅ Frontend disponível${NC}"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/30...${NC}"
        sleep 2
    done
}

# Popular banco de dados
seed_database() {
    log "Populando banco de dados..."
    
    echo -e "${BLUE}🌱 Executando seeder...${NC}"
    if docker-compose --profile tools run --rm seeder; then
        echo -e "${GREEN}✅ Banco de dados populado${NC}"
    else
        echo -e "${RED}❌ Falha ao popular banco de dados${NC}"
        exit 1
    fi
}

# Testar aplicação
test_application() {
    log "Testando aplicação..."
    
    echo -e "${BLUE}🧪 Testando endpoints...${NC}"
    
    # Teste do frontend
    if curl -s http://localhost/ | grep -q "html"; then
        echo -e "${GREEN}✅ Frontend funcionando${NC}"
    else
        echo -e "${RED}❌ Frontend não está funcionando${NC}"
    fi
    
    # Teste da API
    if curl -s http://localhost:5000/health | grep -q "ok"; then
        echo -e "${GREEN}✅ API funcionando${NC}"
    else
        echo -e "${RED}❌ API não está funcionando${NC}"
    fi
    
    # Teste do proxy
    if curl -s http://localhost/api/vehicles | grep -q "vehicles"; then
        echo -e "${GREEN}✅ Proxy da API funcionando${NC}"
    else
        echo -e "${RED}❌ Proxy da API não está funcionando${NC}"
    fi
}

# Mostrar status
show_status() {
    log "Status dos containers:"
    docker-compose ps
    
    echo ""
    echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
    echo ""
    echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
    echo -e "  • Frontend HTTP: http://localhost/ (redireciona para HTTPS)"
    echo -e "  • Frontend HTTPS: https://localhost/"
    echo -e "  • API: http://localhost:5000"
    echo -e "  • Admin: https://localhost/admin"
    echo -e "  • Inventário: https://localhost/inventory"
    echo ""
    echo -e "${BLUE}🔑 Credenciais Admin:${NC}"
    echo -e "  • Username: admin"
    echo -e "  • Password: adminja2025"
    echo ""
    echo -e "${BLUE}🔒 SSL/HTTPS:${NC}"
    echo -e "  • Certificados: ssl/cert.pem e ssl/key.pem"
    echo -e "  • Para produção: Substitua por certificados válidos"
    echo -e "  • Let's Encrypt: Use certbot para certificados gratuitos"
    echo ""
    echo -e "${BLUE}📋 Comandos Úteis:${NC}"
    echo -e "  • Ver logs: docker-compose logs -f"
    echo -e "  • Parar: docker-compose down"
    echo -e "  • Reiniciar: docker-compose restart"
    echo -e "  • Popular banco: docker-compose --profile tools run --rm seeder"
}

# Limpeza em caso de erro
cleanup_on_error() {
    echo -e "${RED}❌ Erro durante o deploy${NC}"
    echo -e "${YELLOW}Limpando recursos...${NC}"
    docker-compose down --volumes --remove-orphans 2>/dev/null || true
    exit 1
}

# Trap para limpeza em caso de erro
trap cleanup_on_error ERR

# Execução principal
main() {
    echo -e "${BLUE}🎯 Iniciando deploy com Docker...${NC}"
    echo ""
    
    # 1. Verificações
    check_docker
    check_ports
    setup_ssl
    setup_env
    
    # 2. Build
    build_application
    
    # 3. Docker
    stop_containers
    build_docker_images
    start_containers
    
    # 4. Aguardar e popular
    wait_for_services
    seed_database
    
    # 5. Testes
    test_application
    
    # 6. Status final
    show_status
}

# Executar
main "$@"