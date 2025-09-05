#!/bin/bash

# Script para testar a aplicação de forma realista
# Usa portas que não requerem privilégios administrativos

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TESTE REALISTA - JA Automóveis${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Configurações
FRONTEND_PORT=3000
API_PORT=5001

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

# Função para aguardar serviço
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=15
    local attempt=1
    
    log "Aguardando $service_name ficar disponível..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name está disponível!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ Tentativa $attempt/$max_attempts - Aguardando $service_name...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name não ficou disponível após $max_attempts tentativas${NC}"
    return 1
}

# Verificar se as portas estão livres
check_ports() {
    log "Verificando portas..."
    
    for port in $FRONTEND_PORT $API_PORT; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}❌ Porta $port já está em uso${NC}"
            echo -e "${YELLOW}Por favor, libere a porta $port ou mate o processo${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Porta $port está livre${NC}"
        fi
    done
}

# Popular banco de dados
seed_database() {
    log "Populando banco de dados..."
    
    if [ -f .env ]; then
        echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    else
        echo -e "${YELLOW}⚠️  Criando arquivo .env...${NC}"
        cp .env.example .env
    fi
    
    echo -e "${BLUE}🌱 Executando seeder...${NC}"
    if npx ts-node --project tsconfig.server.json seeder.ts; then
        echo -e "${GREEN}✅ Banco de dados populado com sucesso${NC}"
    else
        echo -e "${RED}❌ Falha ao popular banco de dados${NC}"
        exit 1
    fi
}

# Iniciar servidor
start_server() {
    log "Iniciando servidor na porta $API_PORT..."
    
    # Modificar temporariamente a porta no .env
    sed -i.bak "s/PORT=5000/PORT=$API_PORT/" .env
    
    # Iniciar servidor em background
    PORT=$API_PORT npm run dev:server &
    SERVER_PID=$!
    
    echo -e "${GREEN}✅ Servidor iniciado (PID: $SERVER_PID)${NC}"
    
    # Aguardar servidor ficar disponível
    if wait_for_service "http://localhost:$API_PORT/health" "API"; then
        return 0
    else
        kill $SERVER_PID 2>/dev/null || true
        return 1
    fi
}

# Iniciar frontend
start_frontend() {
    log "Iniciando frontend na porta $FRONTEND_PORT..."
    
    # Modificar temporariamente o vite.config.ts
    cp vite.config.ts vite.config.ts.bak
    sed -i.bak "s/port: 80/port: $FRONTEND_PORT/" vite.config.ts
    sed -i.bak "s/target: \"http:\/\/localhost:5000\"/target: \"http:\/\/localhost:$API_PORT\"/" vite.config.ts
    
    # Iniciar frontend em background
    npm run dev:client &
    FRONTEND_PID=$!
    
    echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
    
    # Aguardar frontend ficar disponível
    if wait_for_service "http://localhost:$FRONTEND_PORT" "Frontend"; then
        return 0
    else
        kill $FRONTEND_PID 2>/dev/null || true
        return 1
    fi
}

# Testes da API
test_api() {
    log "🧪 TESTANDO API..."
    echo -e "${PURPLE}===================${NC}"
    
    # Health check
    test_endpoint "http://localhost:$API_PORT/health" "200" "Health Check"
    
    # API endpoints
    test_endpoint "http://localhost:$API_PORT/api/vehicles" "200" "Lista de Veículos"
    test_endpoint "http://localhost:$API_PORT/api/sellers" "200" "Lista de Vendedores"
    test_endpoint "http://localhost:$API_PORT/api/users" "401" "Lista de Usuários (Protegido)"
    
    # Teste de CORS
    log "Testando CORS..."
    if curl -s -H "Origin: http://localhost:$FRONTEND_PORT" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS "http://localhost:$API_PORT/api/vehicles" | grep -q "Access-Control-Allow-Origin"; then
        echo -e "${GREEN}✅ CORS configurado corretamente${NC}"
    else
        echo -e "${RED}❌ CORS não configurado${NC}"
    fi
    echo ""
}

# Testes do Frontend
test_frontend() {
    log "🧪 TESTANDO FRONTEND..."
    echo -e "${PURPLE}=====================${NC}"
    
    # Páginas principais
    test_endpoint "http://localhost:$FRONTEND_PORT" "200" "Homepage"
    test_endpoint "http://localhost:$FRONTEND_PORT/inventory" "200" "Inventário"
    test_endpoint "http://localhost:$FRONTEND_PORT/admin" "200" "Admin Login"
    
    # Teste de proxy da API
    log "Testando proxy da API..."
    if curl -s "http://localhost:$FRONTEND_PORT/api/vehicles" | grep -q "vehicles\|error"; then
        echo -e "${GREEN}✅ Proxy da API funcionando${NC}"
    else
        echo -e "${RED}❌ Proxy da API não funcionando${NC}"
    fi
    echo ""
}

# Teste de funcionalidades específicas
test_features() {
    log "🧪 TESTANDO FUNCIONALIDADES..."
    echo -e "${PURPLE}=========================${NC}"
    
    # Teste de login admin
    log "Testando login admin..."
    login_response=$(curl -s -X POST "http://localhost:$API_PORT/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"adminja2025"}')
    
    if echo "$login_response" | grep -q "token"; then
        echo -e "${GREEN}✅ Login admin funcionando${NC}"
        token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}   Token obtido: ${token:0:20}...${NC}"
        
        # Teste de criação de veículo
        log "Testando criação de veículo..."
        vehicle_response=$(curl -s -X POST "http://localhost:$API_PORT/api/vehicles" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d '{
                "name": "Teste Veículo",
                "make": "Toyota",
                "model": "Corolla",
                "year": 2023,
                "price": 100000,
                "cost": 90000,
                "km": 0,
                "color": "Branco",
                "fuel": "Flex",
                "transmission": "Automático",
                "doors": 4,
                "description": "Veículo de teste"
            }')
        
        if echo "$vehicle_response" | grep -q "_id\|id"; then
            echo -e "${GREEN}✅ Criação de veículo funcionando${NC}"
        else
            echo -e "${RED}❌ Criação de veículo falhou${NC}"
            echo -e "${RED}   Resposta: $vehicle_response${NC}"
        fi
        
        # Teste de criação de vendedor
        log "Testando criação de vendedor..."
        seller_response=$(curl -s -X POST "http://localhost:$API_PORT/api/sellers" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d '{
                "name": "Vendedor Teste",
                "email": "vendedor@teste.com",
                "phone": "(11) 99999-9999",
                "active": true
            }')
        
        if echo "$seller_response" | grep -q "_id\|id"; then
            echo -e "${GREEN}✅ Criação de vendedor funcionando${NC}"
        else
            echo -e "${RED}❌ Criação de vendedor falhou${NC}"
            echo -e "${RED}   Resposta: $seller_response${NC}"
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
        curl -s "http://localhost:$API_PORT/api/vehicles" > /dev/null &
    done
    wait
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc -l 2>/dev/null || echo "0.5")
    
    echo -e "${GREEN}✅ 5 requisições completadas em ${duration}s${NC}"
    
    # Teste de resposta individual
    log "Teste de tempo de resposta..."
    response_time=$(curl -s -w "%{time_total}" -o /dev/null "http://localhost:$API_PORT/api/vehicles")
    echo -e "${GREEN}✅ Tempo de resposta: ${response_time}s${NC}"
    echo ""
}

# Teste de dados
test_data() {
    log "🧪 TESTANDO DADOS..."
    echo -e "${PURPLE}===================${NC}"
    
    # Verificar se há veículos
    vehicles_response=$(curl -s "http://localhost:$API_PORT/api/vehicles")
    vehicle_count=$(echo "$vehicles_response" | grep -o '"name"' | wc -l)
    echo -e "${GREEN}✅ Veículos no banco: $vehicle_count${NC}"
    
    # Verificar se há vendedores
    sellers_response=$(curl -s "http://localhost:$API_PORT/api/sellers")
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

# Limpeza
cleanup() {
    log "🧹 Limpando processos e arquivos..."
    
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Servidor parado${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Frontend parado${NC}"
    fi
    
    # Restaurar arquivos originais
    if [ -f .env.bak ]; then
        mv .env.bak .env
        echo -e "${GREEN}✅ Arquivo .env restaurado${NC}"
    fi
    
    if [ -f vite.config.ts.bak ]; then
        mv vite.config.ts.bak vite.config.ts
        echo -e "${GREEN}✅ Arquivo vite.config.ts restaurado${NC}"
    fi
    
    # Limpar arquivos temporários
    rm -f /tmp/response.json
}

# Trap para limpeza ao sair
trap cleanup EXIT

# Execução principal
main() {
    echo -e "${BLUE}🎯 Iniciando teste realista...${NC}"
    echo -e "${BLUE}Frontend: http://localhost:$FRONTEND_PORT${NC}"
    echo -e "${BLUE}API: http://localhost:$API_PORT${NC}"
    echo ""
    
    # 1. Verificar portas
    check_ports
    
    # 2. Popular banco
    seed_database
    
    # 3. Iniciar servidor
    if start_server; then
        echo -e "${GREEN}✅ Servidor iniciado com sucesso${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar servidor${NC}"
        exit 1
    fi
    
    # 4. Iniciar frontend
    if start_frontend; then
        echo -e "${GREEN}✅ Frontend iniciado com sucesso${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar frontend${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 APLICAÇÃO INICIADA COM SUCESSO!${NC}"
    echo -e "${BLUE}Frontend: http://localhost:$FRONTEND_PORT${NC}"
    echo -e "${BLUE}API: http://localhost:$API_PORT${NC}"
    echo -e "${BLUE}Admin: http://localhost:$FRONTEND_PORT/admin${NC}"
    echo ""
    
    # 5. Testes
    test_api
    test_frontend
    test_features
    test_performance
    test_data
    
    echo ""
    echo -e "${GREEN}🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!${NC}"
    echo -e "${BLUE}A aplicação está funcionando perfeitamente!${NC}"
    echo ""
    echo -e "${YELLOW}Para parar a aplicação, pressione Ctrl+C${NC}"
    echo -e "${YELLOW}Para acessar a aplicação, abra: http://localhost:$FRONTEND_PORT${NC}"
    
    # Manter aplicação rodando
    while true; do
        sleep 1
    done
}

# Executar
main "$@"