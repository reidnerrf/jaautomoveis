#!/bin/bash

# Script para desenvolvimento local
# Frontend na porta 80, API na porta 5000

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando desenvolvimento local - JA Automóveis${NC}"
echo -e "${BLUE}Frontend: http://localhost:80${NC}"
echo -e "${BLUE}API: http://localhost:5000${NC}"
echo ""

# Verificar se as portas estão livres
check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}❌ Porta $port já está em uso por outro processo${NC}"
        echo -e "${YELLOW}Por favor, libere a porta $port ou mate o processo que está usando${NC}"
        echo -e "${YELLOW}Para ver qual processo está usando: lsof -i :$port${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Porta $port está livre${NC}"
    fi
}

# Verificar portas
echo -e "${BLUE}Verificando portas...${NC}"
check_port 80 "Frontend"
check_port 5000 "API"

# Verificar se o Node.js está disponível
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instale o Node.js primeiro.${NC}"
    exit 1
fi

# Verificar se o npm está disponível
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado. Instale o npm primeiro.${NC}"
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo -e "${YELLOW}Criando arquivo .env de exemplo...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Por favor, edite o arquivo .env com suas configurações${NC}"
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Instalando dependências...${NC}"
    npm install
fi

# Verificar se o MongoDB está rodando (opcional)
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo -e "${YELLOW}⚠️  MongoDB não está rodando localmente${NC}"
        echo -e "${YELLOW}Certifique-se de que o MongoDB está rodando ou use SKIP_DB=true no .env${NC}"
    else
        echo -e "${GREEN}✅ MongoDB está rodando${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Tudo pronto! Iniciando servidores...${NC}"
echo ""
echo -e "${BLUE}Comandos úteis:${NC}"
echo -e "  • Frontend: http://localhost:80"
echo -e "  • API: http://localhost:5000"
echo -e "  • Admin: http://localhost:80/admin"
echo -e "  • Parar: Ctrl+C"
echo ""

# Iniciar os servidores
echo -e "${BLUE}Iniciando servidor de desenvolvimento...${NC}"
npm run dev