#!/bin/bash

# Script para limpar e rebuildar frontend e app no Docker, ignorando mongo
# Ubuntu Docker Script

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 CLEAN & BUILD FRONTEND & APP - JA Automóveis${NC}"
echo -e "${BLUE}=================================================${NC}"
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
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}❌ Docker Compose não encontrado${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker disponível${NC}"
}

# Parar containers de app e frontend
stop_app_frontend() {
    log "Parando containers de app e frontend..."
    
    # Parar serviços específicos
    docker-compose stop app frontend 2>/dev/null || true
    
    echo -e "${GREEN}✅ Containers de app e frontend parados${NC}"
}

# Remover containers e imagens de app e frontend
remove_app_frontend() {
    log "Removendo containers e imagens de app e frontend..."
    
    # Remover containers
    docker-compose rm -f app frontend 2>/dev/null || true
    
    # Remover imagens
    docker rmi $(docker images -q ja3_app) 2>/dev/null || true
    docker rmi $(docker images -q ja3_frontend) 2>/dev/null || true
    
    echo -e "${GREEN}✅ Containers e imagens removidos${NC}"
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

# Build das imagens Docker para app e frontend
build_docker_images() {
    log "Fazendo build das imagens Docker para app e frontend..."
    
    echo -e "${BLUE}🐳 Build das imagens...${NC}"
    if docker-compose build --no-cache app frontend; then
        echo -e "${GREEN}✅ Imagens Docker construídas${NC}"
    else
        echo -e "${RED}❌ Falha no build das imagens Docker${NC}"
        exit 1
    fi
}

# Iniciar containers de app e frontend
start_app_frontend() {
    log "Iniciando containers de app e frontend..."
    
    echo -e "${BLUE}🚀 Iniciando serviços...${NC}"
    if docker-compose up -d app frontend; then
        echo -e "${GREEN}✅ Containers iniciados${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar containers${NC}"
        exit 1
    fi
}

# Aguardar serviços ficarem disponíveis
wait_for_services() {
    log "Aguardando serviços ficarem disponíveis..."
    
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

# Mostrar status
show_status() {
    log "Status dos containers:"
    docker-compose ps
    
    echo ""
    echo -e "${GREEN}🎉 CLEAN & BUILD CONCLUÍDO COM SUCESSO!${NC}"
    echo ""
    echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
    echo -e "  • Frontend: http://localhost/"
    echo -e "  • API: http://localhost:5000"
}

# Limpeza em caso de erro
cleanup_on_error() {
    echo -e "${RED}❌ Erro durante o processo${NC}"
    echo -e "${YELLOW}Tentando iniciar containers novamente...${NC}"
    docker-compose up -d app frontend 2>/dev/null || true
    exit 1
}

# Trap para limpeza em caso de erro
trap cleanup_on_error ERR

# Execução principal
main() {
    echo -e "${BLUE}🎯 Iniciando clean & build de frontend e app...${NC}"
    echo ""
    
    # 1. Verificações
    check_docker
    
    # 2. Parar e remover
    stop_app_frontend
    remove_app_frontend
    
    # 3. Build da aplicação
    build_application
    
    # 4. Build Docker
    build_docker_images
    
    # 5. Iniciar
    start_app_frontend
    
    # 6. Aguardar
    wait_for_services
    
    # 7. Status final
    show_status
}

# Executar
main "$@"
