#!/bin/bash

# Script para testar assets localmente

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 TESTE DE ASSETS - JA Automóveis${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Função para log
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Verificar se o build existe
check_build() {
    log "Verificando build do frontend..."
    
    if [ ! -d "dist" ]; then
        echo -e "${RED}❌ Pasta dist não encontrada${NC}"
        echo -e "${YELLOW}Execute: npm run build:client${NC}"
        exit 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
        echo -e "${RED}❌ index.html não encontrado${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Build encontrado${NC}"
}

# Verificar assets
check_assets() {
    log "Verificando assets..."
    
    # Verificar imagens
    if [ -d "dist/assets/images" ]; then
        image_count=$(ls dist/assets/images/ | wc -l)
        echo -e "${GREEN}✅ Imagens encontradas: $image_count arquivos${NC}"
        ls -la dist/assets/images/
    else
        echo -e "${RED}❌ Pasta de imagens não encontrada${NC}"
    fi
    
    # Verificar CSS
    if [ -d "dist/assets/css" ]; then
        css_count=$(ls dist/assets/css/ | wc -l)
        echo -e "${GREEN}✅ CSS encontrado: $css_count arquivos${NC}"
        ls -la dist/assets/css/
    else
        echo -e "${RED}❌ Pasta de CSS não encontrada${NC}"
    fi
    
    # Verificar JS
    if [ -d "dist/assets/js" ]; then
        js_count=$(ls dist/assets/js/ | wc -l)
        echo -e "${GREEN}✅ JavaScript encontrado: $js_count arquivos${NC}"
        ls -la dist/assets/js/
    else
        echo -e "${RED}❌ Pasta de JavaScript não encontrada${NC}"
    fi
}

# Verificar index.html
check_index_html() {
    log "Verificando index.html..."
    
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ index.html encontrado${NC}"
        
        # Verificar se há referências aos assets
        if grep -q "assets/" dist/index.html; then
            echo -e "${GREEN}✅ Referências aos assets encontradas no HTML${NC}"
            echo -e "${BLUE}Referências encontradas:${NC}"
            grep -o 'assets/[^"]*' dist/index.html | head -5
        else
            echo -e "${RED}❌ Nenhuma referência aos assets encontrada${NC}"
        fi
    else
        echo -e "${RED}❌ index.html não encontrado${NC}"
    fi
}

# Testar servidor local simples
test_local_server() {
    log "Testando servidor local..."
    
    # Verificar se Python está disponível
    if command -v python3 &> /dev/null; then
        echo -e "${BLUE}🐍 Iniciando servidor Python na porta 8080...${NC}"
        echo -e "${YELLOW}Acesse: http://localhost:8080${NC}"
        echo -e "${YELLOW}Para parar: Ctrl+C${NC}"
        echo ""
        
        cd dist
        python3 -m http.server 8080
    elif command -v python &> /dev/null; then
        echo -e "${BLUE}🐍 Iniciando servidor Python na porta 8080...${NC}"
        echo -e "${YELLOW}Acesse: http://localhost:8080${NC}"
        echo -e "${YELLOW}Para parar: Ctrl+C${NC}"
        echo ""
        
        cd dist
        python -m SimpleHTTPServer 8080
    else
        echo -e "${RED}❌ Python não encontrado${NC}"
        echo -e "${YELLOW}Instale Python para testar localmente${NC}"
    fi
}

# Verificar configuração do nginx
check_nginx_config() {
    log "Verificando configuração do nginx..."
    
    if [ -f "nginx.conf" ]; then
        echo -e "${GREEN}✅ nginx.conf encontrado${NC}"
        
        # Verificar se há configuração para assets
        if grep -q "location /assets/" nginx.conf; then
            echo -e "${GREEN}✅ Configuração de assets encontrada no nginx${NC}"
            echo -e "${BLUE}Configuração:${NC}"
            grep -A 5 "location /assets/" nginx.conf
        else
            echo -e "${RED}❌ Configuração de assets não encontrada no nginx${NC}"
        fi
    else
        echo -e "${RED}❌ nginx.conf não encontrado${NC}"
    fi
}

# Verificar docker-compose
check_docker_compose() {
    log "Verificando docker-compose.yml..."
    
    if [ -f "docker-compose.yml" ]; then
        echo -e "${GREEN}✅ docker-compose.yml encontrado${NC}"
        
        # Verificar se há volume para dist
        if grep -q "./dist:/usr/share/nginx/html" docker-compose.yml; then
            echo -e "${GREEN}✅ Volume para dist configurado${NC}"
        else
            echo -e "${RED}❌ Volume para dist não configurado${NC}"
        fi
    else
        echo -e "${RED}❌ docker-compose.yml não encontrado${NC}"
    fi
}

# Execução principal
main() {
    echo -e "${BLUE}🎯 Verificando configuração de assets...${NC}"
    echo ""
    
    check_build
    echo ""
    
    check_assets
    echo ""
    
    check_index_html
    echo ""
    
    check_nginx_config
    echo ""
    
    check_docker_compose
    echo ""
    
    echo -e "${GREEN}🎉 Verificação concluída!${NC}"
    echo ""
    echo -e "${BLUE}💡 Para testar localmente:${NC}"
    echo -e "  • Execute: ./scripts/test-assets.sh --serve"
    echo -e "  • Acesse: http://localhost:8080"
    echo ""
    echo -e "${BLUE}💡 Para testar com Docker:${NC}"
    echo -e "  • Execute: npm run docker:deploy"
    echo -e "  • Acesse: http://localhost/"
    
    # Se --serve foi passado, iniciar servidor
    if [ "$1" = "--serve" ]; then
        echo ""
        test_local_server
    fi
}

# Executar
main "$@"