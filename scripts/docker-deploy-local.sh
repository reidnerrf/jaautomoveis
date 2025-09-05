#!/bin/bash

# 🚀 DEPLOY DOCKER LOCAL - JA Automóveis
# =====================================
# Script para deploy local sem Docker (para desenvolvimento)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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
echo "🚀 DEPLOY LOCAL - JA Automóveis"
echo "==============================="
echo -e "${NC}"

log "Iniciando deploy local..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto (onde está o package.json)"
    exit 1
fi

# Verificar Node.js
log "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

NODE_VERSION=$(node --version)
success "Node.js encontrado: $NODE_VERSION"

# Verificar npm
log "Verificando npm..."
if ! command -v npm &> /dev/null; then
    error "npm não encontrado. Instale o npm primeiro."
    exit 1
fi

NPM_VERSION=$(npm --version)
success "npm encontrado: v$NPM_VERSION"

# Instalar dependências
log "Instalando dependências..."
if npm install; then
    success "Dependências instaladas com sucesso"
else
    error "Falha ao instalar dependências"
    exit 1
fi

# Verificar se existe .env
log "Verificando arquivo .env..."
if [ ! -f ".env" ]; then
    warning "Arquivo .env não encontrado. Criando a partir do .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        success "Arquivo .env criado a partir do .env.example"
        info "Edite o arquivo .env com suas configurações antes de continuar"
    else
        error "Arquivo .env.example não encontrado"
        exit 1
    fi
else
    success "Arquivo .env encontrado"
fi

# Build da aplicação
log "Fazendo build da aplicação..."
if npm run build; then
    success "Build concluído com sucesso"
else
    error "Falha no build da aplicação"
    exit 1
fi

# Verificar se o build foi criado
if [ ! -d "dist" ]; then
    error "Diretório dist não foi criado. Verifique os erros de build."
    exit 1
fi

success "Diretório dist criado com sucesso"

# Mostrar informações do build
log "Informações do build:"
echo "📁 Diretório dist: $(du -sh dist 2>/dev/null | cut -f1 || echo 'N/A')"
echo "📄 Arquivos criados: $(find dist -type f | wc -l)"

# Verificar se o servidor foi compilado
if [ -f "dist/server.js" ]; then
    success "Servidor compilado: dist/server.js"
else
    error "Servidor não foi compilado. Verifique os erros de build."
    exit 1
fi

# Verificar se o cliente foi compilado
if [ -d "dist/assets" ]; then
    success "Cliente compilado: dist/assets/"
    echo "📄 Assets: $(find dist/assets -type f | wc -l) arquivos"
else
    error "Cliente não foi compilado. Verifique os erros de build."
    exit 1
fi

# Mostrar próximos passos
echo -e "\n${GREEN}🎉 DEPLOY LOCAL CONCLUÍDO COM SUCESSO!${NC}"
echo -e "\n${CYAN}📋 PRÓXIMOS PASSOS:${NC}"
echo "1. Configure o arquivo .env com suas configurações"
echo "2. Para desenvolvimento: npm run dev"
echo "3. Para produção: npm start"
echo "4. Para testar: npm run dev:local"

echo -e "\n${YELLOW}🔧 COMANDOS DISPONÍVEIS:${NC}"
echo "• npm run dev          - Desenvolvimento (cliente + servidor)"
echo "• npm run dev:client   - Apenas cliente (porta 80)"
echo "• npm run dev:server   - Apenas servidor (porta 5000)"
echo "• npm start            - Produção"
echo "• npm run dev:local    - Teste local completo"

echo -e "\n${BLUE}🌐 URLs DE ACESSO:${NC}"
echo "• Frontend: http://localhost:80"
echo "• API: http://localhost:5000"
echo "• Admin: http://localhost:80/admin"

echo -e "\n${PURPLE}💡 DICAS:${NC}"
echo "• Use 'npm run dev' para desenvolvimento"
echo "• Use 'npm start' para produção"
echo "• Verifique o arquivo .env para configurações"
echo "• Para Docker, instale o Docker primeiro"

echo -e "\n${GREEN}✅ Deploy local concluído!${NC}"