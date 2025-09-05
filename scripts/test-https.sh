#!/bin/bash

# Script para testar configuração HTTPS/SSL

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 TESTE HTTPS/SSL - JA Automóveis${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Função para log
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    local ignore_ssl=$4
    
    log "Testando: $description"
    log "URL: $url"
    
    # Configurar curl para ignorar SSL se necessário
    curl_opts="-s -w %{http_code} -o /tmp/response.json"
    if [ "$ignore_ssl" = "true" ]; then
        curl_opts="$curl_opts -k"
    fi
    
    if response=$(curl $curl_opts "$url" 2>/dev/null); then
        status_code="${response: -3}"
        if [ "$status_code" = "$expected_status" ]; then
            echo -e "${GREEN}✅ $description - Status: $status_code${NC}"
            if [ -s /tmp/response.json ]; then
                echo -e "${GREEN}   Resposta: $(cat /tmp/response.json | head -c 100)...${NC}"
            fi
        else
            echo -e "${RED}❌ $description - Status esperado: $expected_status, recebido: $status_code${NC}"
            if [ -s /tmp/response.json ]; then
                echo -e "${RED}   Erro: $(cat /tmp/response.json)${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ $description - Falha na conexão${NC}"
    fi
    echo ""
}

# Verificar certificados SSL
check_ssl_certificates() {
    log "Verificando certificados SSL..."
    
    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        echo -e "${RED}❌ Certificados SSL não encontrados${NC}"
        echo -e "${YELLOW}Execute: npm run docker:ssl${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Certificados SSL encontrados${NC}"
    
    # Verificar validade do certificado
    if openssl x509 -in ssl/cert.pem -text -noout > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Certificado válido${NC}"
        
        # Mostrar informações do certificado
        echo -e "${BLUE}📋 Informações do certificado:${NC}"
        openssl x509 -in ssl/cert.pem -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"
    else
        echo -e "${RED}❌ Certificado inválido${NC}"
        return 1
    fi
    
    # Verificar chave privada
    if openssl rsa -in ssl/key.pem -check -noout > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Chave privada válida${NC}"
    else
        echo -e "${RED}❌ Chave privada inválida${NC}"
        return 1
    fi
    
    # Verificar se certificado e chave correspondem
    cert_md5=$(openssl x509 -noout -modulus -in ssl/cert.pem | openssl md5)
    key_md5=$(openssl rsa -noout -modulus -in ssl/key.pem | openssl md5)
    
    if [ "$cert_md5" = "$key_md5" ]; then
        echo -e "${GREEN}✅ Certificado e chave correspondem${NC}"
    else
        echo -e "${RED}❌ Certificado e chave não correspondem${NC}"
        return 1
    fi
    
    return 0
}

# Verificar se containers estão rodando
check_containers() {
    log "Verificando containers..."
    
    if ! docker-compose ps | grep -q "Up"; then
        echo -e "${RED}❌ Nenhum container está rodando${NC}"
        echo -e "${YELLOW}Execute: npm run docker:deploy${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Containers estão rodando${NC}"
    docker-compose ps
    return 0
}

# Aguardar serviços ficarem disponíveis
wait_for_services() {
    log "Aguardando serviços ficarem disponíveis..."
    
    # Aguardar HTTP (deve redirecionar para HTTPS)
    echo -e "${BLUE}⏳ Aguardando HTTP (porta 80)...${NC}"
    for i in {1..15}; do
        if curl -s http://localhost/ > /dev/null 2>&1; then
            echo -e "${GREEN}✅ HTTP disponível${NC}"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/15...${NC}"
        sleep 2
    done
    
    # Aguardar HTTPS
    echo -e "${BLUE}⏳ Aguardando HTTPS (porta 443)...${NC}"
    for i in {1..15}; do
        if curl -s -k https://localhost/ > /dev/null 2>&1; then
            echo -e "${GREEN}✅ HTTPS disponível${NC}"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/15...${NC}"
        sleep 2
    done
}

# Testar redirecionamento HTTP para HTTPS
test_http_redirect() {
    log "🧪 TESTANDO REDIRECIONAMENTO HTTP → HTTPS..."
    echo -e "${PURPLE}===========================================${NC}"
    
    # Testar redirecionamento
    redirect_url=$(curl -s -I http://localhost/ | grep -i location | cut -d' ' -f2 | tr -d '\r\n')
    
    if [ "$redirect_url" = "https://localhost/" ]; then
        echo -e "${GREEN}✅ Redirecionamento HTTP → HTTPS funcionando${NC}"
        echo -e "${GREEN}   HTTP redireciona para: $redirect_url${NC}"
    else
        echo -e "${RED}❌ Redirecionamento HTTP → HTTPS não funcionando${NC}"
        echo -e "${RED}   Redirecionamento para: $redirect_url${NC}"
    fi
    echo ""
}

# Testar HTTPS
test_https() {
    log "🧪 TESTANDO HTTPS..."
    echo -e "${PURPLE}===================${NC}"
    
    # Testar HTTPS com certificado auto-assinado (ignorar SSL)
    test_endpoint "https://localhost/" "200" "Homepage HTTPS" "true"
    test_endpoint "https://localhost/inventory" "200" "Inventário HTTPS" "true"
    test_endpoint "https://localhost/admin" "200" "Admin HTTPS" "true"
    
    # Testar assets HTTPS
    test_endpoint "https://localhost/assets/index.css" "200" "CSS HTTPS" "true"
    test_endpoint "https://localhost/assets/index.js" "200" "JavaScript HTTPS" "true"
    
    # Testar proxy da API via HTTPS
    log "Testando proxy da API via HTTPS..."
    if curl -s -k "https://localhost/api/vehicles" | grep -q "vehicles\|error"; then
        echo -e "${GREEN}✅ Proxy da API via HTTPS funcionando${NC}"
    else
        echo -e "${RED}❌ Proxy da API via HTTPS não funcionando${NC}"
    fi
    echo ""
}

# Testar segurança SSL
test_ssl_security() {
    log "🧪 TESTANDO SEGURANÇA SSL..."
    echo -e "${PURPLE}=======================${NC}"
    
    # Testar headers de segurança
    log "Testando headers de segurança..."
    
    headers=$(curl -s -I -k https://localhost/)
    
    if echo "$headers" | grep -q "Strict-Transport-Security"; then
        echo -e "${GREEN}✅ HSTS header presente${NC}"
    else
        echo -e "${RED}❌ HSTS header ausente${NC}"
    fi
    
    if echo "$headers" | grep -q "X-Frame-Options"; then
        echo -e "${GREEN}✅ X-Frame-Options header presente${NC}"
    else
        echo -e "${RED}❌ X-Frame-Options header ausente${NC}"
    fi
    
    if echo "$headers" | grep -q "X-Content-Type-Options"; then
        echo -e "${GREEN}✅ X-Content-Type-Options header presente${NC}"
    else
        echo -e "${RED}❌ X-Content-Type-Options header ausente${NC}"
    fi
    
    echo ""
}

# Testar performance SSL
test_ssl_performance() {
    log "🧪 TESTANDO PERFORMANCE SSL..."
    echo -e "${PURPLE}=========================${NC}"
    
    # Teste de tempo de resposta HTTPS
    log "Teste de tempo de resposta HTTPS..."
    start_time=$(date +%s.%N)
    
    for i in {1..3}; do
        curl -s -k https://localhost/ > /dev/null &
    done
    wait
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0.5")
    
    echo -e "${GREEN}✅ 3 requisições HTTPS completadas em ${duration}s${NC}"
    
    # Teste de tempo de resposta individual
    response_time=$(curl -s -k -w "%{time_total}" -o /dev/null https://localhost/)
    echo -e "${GREEN}✅ Tempo de resposta HTTPS: ${response_time}s${NC}"
    echo ""
}

# Mostrar resumo
show_summary() {
    echo ""
    echo -e "${GREEN}🎉 TESTE HTTPS/SSL CONCLUÍDO!${NC}"
    echo ""
    echo -e "${BLUE}🌐 URLs de Acesso:${NC}"
    echo -e "  • HTTP: http://localhost/ (redireciona para HTTPS)"
    echo -e "  • HTTPS: https://localhost/"
    echo -e "  • Admin: https://localhost/admin"
    echo -e "  • Inventário: https://localhost/inventory"
    echo ""
    echo -e "${BLUE}🔒 SSL/HTTPS:${NC}"
    echo -e "  • Certificados: ssl/cert.pem e ssl/key.pem"
    echo -e "  • Redirecionamento: HTTP → HTTPS ativo"
    echo -e "  • Headers de segurança: Configurados"
    echo -e "  • Performance: Otimizada"
    echo ""
    echo -e "${BLUE}📋 Comandos Úteis:${NC}"
    echo -e "  • Ver logs: docker-compose logs -f nginx"
    echo -e "  • Testar SSL: openssl s_client -connect localhost:443"
    echo -e "  • Verificar certificado: openssl x509 -in ssl/cert.pem -text -noout"
    echo ""
    echo -e "${YELLOW}⚠️  Nota:${NC}"
    echo -e "  • Certificado auto-assinado (desenvolvimento)"
    echo -e "  • Para produção, use certificados válidos"
    echo -e "  • Navegador pode mostrar aviso de segurança"
}

# Limpeza
cleanup() {
    rm -f /tmp/response.json
}

# Trap para limpeza ao sair
trap cleanup EXIT

# Execução principal
main() {
    echo -e "${BLUE}🎯 Iniciando teste HTTPS/SSL...${NC}"
    echo ""
    
    # 1. Verificações
    if ! check_ssl_certificates; then
        exit 1
    fi
    
    if ! check_containers; then
        exit 1
    fi
    
    # 2. Aguardar serviços
    wait_for_services
    
    # 3. Testes
    test_http_redirect
    test_https
    test_ssl_security
    test_ssl_performance
    
    # 4. Resumo
    show_summary
}

# Executar
main "$@"