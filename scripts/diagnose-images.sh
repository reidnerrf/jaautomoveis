#!/bin/bash

# Script para diagnosticar problema com imagens

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 DIAGNÓSTICO DE IMAGENS - JA Automóveis${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Função para log
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Verificar se o build existe
check_build() {
    log "Verificando build..."
    
    if [ ! -d "dist" ]; then
        echo -e "${RED}❌ Pasta dist não encontrada${NC}"
        echo -e "${YELLOW}Execute: npm run build:client${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Build encontrado${NC}"
}

# Verificar imagens específicas
check_specific_images() {
    log "Verificando imagens específicas..."
    
    # Lista de imagens que devem existir
    images=(
        "favicon-32x32-b5EqdaJq.png"
        "logo-vY9h-IVq.png"
        "homepageabout-CxjaoWKe.webp"
    )
    
    for image in "${images[@]}"; do
        if [ -f "dist/assets/images/$image" ]; then
            echo -e "${GREEN}✅ $image encontrada${NC}"
            ls -lh "dist/assets/images/$image"
        else
            echo -e "${RED}❌ $image NÃO encontrada${NC}"
        fi
    done
}

# Verificar index.html
check_html_references() {
    log "Verificando referências no HTML..."
    
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✅ index.html encontrado${NC}"
        
        # Verificar referências específicas
        echo -e "${BLUE}Referências encontradas:${NC}"
        grep -o 'assets/images/[^"]*' dist/index.html
        
        # Verificar se há problemas com caminhos
        if grep -q "src=\"/assets/" dist/index.html; then
            echo -e "${GREEN}✅ Caminhos absolutos encontrados${NC}"
        else
            echo -e "${YELLOW}⚠️  Caminhos relativos encontrados${NC}"
        fi
    fi
}

# Verificar configuração do nginx
check_nginx_config() {
    log "Verificando configuração do nginx..."
    
    if [ -f "nginx.conf" ]; then
        echo -e "${GREEN}✅ nginx.conf encontrado${NC}"
        
        # Verificar configuração de assets
        if grep -q "location /assets/" nginx.conf; then
            echo -e "${GREEN}✅ Configuração de assets encontrada${NC}"
        else
            echo -e "${RED}❌ Configuração de assets NÃO encontrada${NC}"
        fi
        
        # Verificar root directory
        if grep -q "root /usr/share/nginx/html" nginx.conf; then
            echo -e "${GREEN}✅ Root directory configurado${NC}"
        else
            echo -e "${RED}❌ Root directory NÃO configurado${NC}"
        fi
    fi
}

# Verificar docker-compose
check_docker_compose() {
    log "Verificando docker-compose.yml..."
    
    if [ -f "docker-compose.yml" ]; then
        echo -e "${GREEN}✅ docker-compose.yml encontrado${NC}"
        
        # Verificar volume para dist
        if grep -q "./dist:/usr/share/nginx/html" docker-compose.yml; then
            echo -e "${GREEN}✅ Volume para dist configurado${NC}"
        else
            echo -e "${RED}❌ Volume para dist NÃO configurado${NC}"
        fi
        
        # Verificar porta 80
        if grep -q "80:80" docker-compose.yml; then
            echo -e "${GREEN}✅ Porta 80 configurada${NC}"
        else
            echo -e "${RED}❌ Porta 80 NÃO configurada${NC}"
        fi
    fi
}

# Testar servidor local
test_local_server() {
    log "Testando servidor local..."
    
    if command -v python3 &> /dev/null; then
        echo -e "${BLUE}🐍 Iniciando servidor Python...${NC}"
        echo -e "${YELLOW}Acesse: http://localhost:8080${NC}"
        echo -e "${YELLOW}Teste: http://localhost:8080/assets/images/logo-vY9h-IVq.png${NC}"
        echo -e "${YELLOW}Para parar: Ctrl+C${NC}"
        echo ""
        
        cd dist
        python3 -m http.server 8080
    else
        echo -e "${RED}❌ Python não encontrado${NC}"
    fi
}

# Mostrar soluções
show_solutions() {
    echo ""
    echo -e "${BLUE}💡 SOLUÇÕES POSSÍVEIS:${NC}"
    echo ""
    echo -e "${YELLOW}1. Verificar se Docker está rodando:${NC}"
    echo -e "   docker-compose ps"
    echo ""
    echo -e "${YELLOW}2. Rebuild e restart:${NC}"
    echo -e "   npm run build:client"
    echo -e "   docker-compose down"
    echo -e "   docker-compose up -d --build"
    echo ""
    echo -e "${YELLOW}3. Verificar logs do nginx:${NC}"
    echo -e "   docker-compose logs nginx"
    echo ""
    echo -e "${YELLOW}4. Testar localmente:${NC}"
    echo -e "   ./scripts/diagnose-images.sh --serve"
    echo ""
    echo -e "${YELLOW}5. Verificar se a porta 80 está livre:${NC}"
    echo -e "   sudo lsof -i :80"
    echo ""
    echo -e "${YELLOW}6. Deploy completo:${NC}"
    echo -e "   npm run docker:deploy"
}

# Execução principal
main() {
    echo -e "${BLUE}🎯 Diagnosticando problema com imagens...${NC}"
    echo ""
    
    check_build
    echo ""
    
    check_specific_images
    echo ""
    
    check_html_references
    echo ""
    
    check_nginx_config
    echo ""
    
    check_docker_compose
    echo ""
    
    show_solutions
    
    # Se --serve foi passado, iniciar servidor
    if [ "$1" = "--serve" ]; then
        echo ""
        test_local_server
    fi
}

# Executar
main "$@"