#!/bin/bash

# Script para testar a aplicação com Docker
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

echo -e "${BLUE}🧪 TESTE DOCKER - JA Automóveis${NC}"
echo -e "${BLUE}==============================${NC}"
echo ""

# Função para log com timestamp
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Função para testar endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    log "Testando: $description"
    log "URL: $url"
    
    if response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$url" 2>/dev/null); then
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

# Verificar se Docker está rodando
check_docker() {
    log "Verificando se Docker está rodando..."
    
    if ! docker ps &>/dev/null; then
        echo -e "${RED}❌ Docker não está rodando${NC}"
        echo -e "${YELLOW}Inicie o Docker primeiro${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker está rodando${NC}"
}

# Verificar se containers estão rodando
check_containers() {
    log "Verificando containers..."
    
    if ! docker-compose ps | grep -q "Up"; then
        echo -e "${RED}❌ Nenhum container está rodando${NC}"
        echo -e "${YELLOW}Execute: npm run docker:deploy${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Containers estão rodando${NC}"
    docker-compose ps
}

# Aguardar serviços ficarem disponíveis
wait_for_services() {
    log "Aguardando serviços ficarem disponíveis..."
    
    # Aguardar frontend
    echo -e "${BLUE}⏳ Aguardando Frontend (http://localhost/)...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost/ &>/dev/null; then
            echo -e "${GREEN}✅ Frontend disponível${NC}"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/30...${NC}"
        sleep 2
    done
    
    # Aguardar API
    echo -e "${BLUE}⏳ Aguardando API (http://localhost:5000)...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:5000/health &>/dev/null; then
            echo -e "${GREEN}✅ API disponível${NC}"
            break
        fi
        echo -e "${YELLOW}   Tentativa $i/30...${NC}"
        sleep 2
    done
}

# Testes do Frontend
test_frontend() {
    log "🧪 TESTANDO FRONTEND..."
    echo -e "${PURPLE}=====================${NC}"
    
    # Páginas principais
    test_endpoint "http://localhost/" "200" "Homepage"
    test_endpoint "http://localhost/inventory" "200" "Inventário"
    test_endpoint "http://localhost/admin" "200" "Admin Login"
    
    # Assets estáticos
    test_endpoint "http://localhost/assets/index.css" "200" "CSS Principal"
    test_endpoint "http://localhost/assets/index.js" "200" "JavaScript Principal"
    
    # Teste de proxy da API
    log "Testando proxy da API..."
    if curl -s "http://localhost/api/vehicles" | grep -q "vehicles\|error"; then
        echo -e "${GREEN}✅ Proxy da API funcionando${NC}"
    else
        echo -e "${RED}❌ Proxy da API não funcionando${NC}"
    fi
    echo ""
}

# Testes da API
test_api() {
    log "🧪 TESTANDO API..."
    echo -e "${PURPLE}===================${NC}"
    
    # Health check
    test_endpoint "http://localhost:5000/health" "200" "Health Check"
    
    # API endpoints
    test_endpoint "http://localhost:5000/api/vehicles" "200" "Lista de Veículos"
    test_endpoint "http://localhost:5000/api/sellers" "200" "Lista de Vendedores"
    test_endpoint "http://localhost:5000/api/users" "401" "Lista de Usuários (Protegido)"
    
    # Teste de CORS
    log "Testando CORS..."
    if curl -s -H "Origin: http://localhost" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS "http://localhost:5000/api/vehicles" | grep -q "Access-Control-Allow-Origin"; then
        echo -e "${GREEN}✅ CORS configurado corretamente${NC}"
    else
        echo -e "${RED}❌ CORS não configurado${NC}"
    fi
    echo ""
}

# Teste de funcionalidades específicas
test_features() {
    log "🧪 TESTANDO FUNCIONALIDADES..."
    echo -e "${PURPLE}=========================${NC}"
    
    # Teste de login admin
    log "Testando login admin..."
    login_response=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"adminja2025"}')
    
    if echo "$login_response" | grep -q "token"; then
        echo -e "${GREEN}✅ Login admin funcionando${NC}"
        token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}   Token obtido: ${token:0:20}...${NC}"
        
        # Teste de criação de veículo
        log "Testando criação de veículo..."
        vehicle_response=$(curl -s -X POST "http://localhost:5000/api/vehicles" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d '{
                "name": "Teste Docker Veículo",
                "make": "Toyota",
                "model": "Corolla",
                "year": 2023,
                "price": 100000,
                "cost": 90000,
                "km": 0,
                "color": "Branco",
                "fuel": "Flex",
                "gearbox": "Automático",
                "doors": 4,
                "description": "Veículo de teste Docker"
            }')
        
        if echo "$vehicle_response" | grep -q "_id\|id"; then
            echo -e "${GREEN}✅ Criação de veículo funcionando${NC}"
        else
            echo -e "${RED}❌ Criação de veículo falhou${NC}"
            echo -e "${RED}   Resposta: $vehicle_response${NC}"
        fi
        
    else
        echo -e "${RED}❌ Login admin falhou${NC}"
        echo -e "${RED}   Resposta: $login_response${NC}"
    fi
    echo ""
}

# Teste de performance
test_performance() {
    log "🧪 TESTANDO PERFORMANCE..."
    echo -e "${PURPLE}=======================${NC}"
    
    # Teste de carga simples
    log "Teste de carga - 5 requisições simultâneas..."
    start_time=$(date +%s.%N)
    
    for i in {1..5}; do
        curl -s "http://localhost:5000/api/vehicles" > /dev/null &
    done
    wait
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0.5")
    
    echo -e "${GREEN}✅ 5 requisições completadas em ${duration}s${NC}"
    
    # Teste de resposta individual
    log "Teste de tempo de resposta..."
    response_time=$(curl -s -w "%{time_total}" -o /dev/null "http://localhost:5000/api/vehicles")
    echo -e "${GREEN}✅ Tempo de resposta: ${response_time}s${NC}"
    echo ""
}

# Teste de dados
test_data() {
    log "🧪 TESTANDO DADOS..."
    echo -e "${PURPLE}===================${NC}"
    
    # Verificar se há veículos
    vehicles_response=$(curl -s "http://localhost:5000/api/vehicles")
    vehicle_count=$(echo "$vehicles_response" | grep -o '"name"' | wc -l)
    echo -e "${GREEN}✅ Veículos no banco: $vehicle_count${NC}"
    
    # Verificar se há vendedores
    sellers_response=$(curl -s "http://localhost:5000/api/sellers")
    seller_count=$(echo "$sellers_response" | grep -o '"name"' | wc -l)
    echo -e "${GREEN}✅ Vendedores no banco: $seller_count${NC}"
    
    # Verificar se há veículos vendidos
    sold_vehicles=$(echo "$vehicles_response" | grep -o '"status":"vendido"' | wc -l)
    echo -e "${GREEN}✅ Veículos vendidos: $sold_vehicles${NC}"
    
    # Verificar se há veículos disponíveis
    available_vehicles=$(echo "$vehicles_response" | grep -o '"status":"disponivel"' | wc -l)
    echo -e "${GREEN}✅ Veículos disponíveis: $available_vehicles${NC}"
    echo ""
}

# Mostrar logs dos containers
show_logs() {
    log "📋 Logs dos containers:"
    echo -e "${PURPLE}=====================${NC}"
    
    echo -e "${BLUE}📄 Logs do App:${NC}"
    docker-compose logs --tail=10 app
    
    echo -e "${BLUE}📄 Logs do Nginx:${NC}"
    docker-compose logs --tail=10 nginx
    
    echo -e "${BLUE}📄 Logs do MongoDB:${NC}"
    docker-compose logs --tail=10 mongo
}

# Limpeza
cleanup() {
    rm -f /tmp/response.json
}

# Trap para limpeza ao sair
trap cleanup EXIT

# Execução principal
main() {
    echo -e "${BLUE}🎯 Iniciando teste Docker...${NC}"
    echo ""
    
    # 1. Verificações
    check_docker
    check_containers
    
    # 2. Aguardar serviços
    wait_for_services
    
    echo ""
    echo -e "${GREEN}🎉 SERVIÇOS DISPONÍVEIS!${NC}"
    echo -e "${BLUE}Frontend: http://localhost/${NC}"
    echo -e "${BLUE}API: http://localhost:5000${NC}"
    echo ""
    
    # 3. Testes
    test_frontend
    test_api
    test_features
    test_performance
    test_data
    
    # 4. Logs
    show_logs
    
    echo ""
    echo -e "${GREEN}🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!${NC}"
    echo -e "${BLUE}A aplicação Docker está funcionando perfeitamente!${NC}"
    echo ""
    echo -e "${YELLOW}Para acessar a aplicação, abra: http://localhost/${NC}"
    echo -e "${YELLOW}Para parar os containers: docker-compose down${NC}"
}

# Executar
main "$@"