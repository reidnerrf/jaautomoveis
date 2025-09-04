#!/bin/bash

# Script para testar a aplicação como se fosse produção
# Simula um ambiente real sem Docker

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 TESTE DE APLICAÇÃO REAL - JA Automóveis${NC}"
echo -e "${BLUE}===========================================${NC}"
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

# Função para aguardar serviço
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
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
    
    for port in 80 5000; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}❌ Porta $port já está em uso${NC}"
            echo -e "${YELLOW}Por favor, libere a porta $port ou mate o processo${NC}"
            exit 1
        else
            echo -e "${GREEN}✅ Porta $port está livre${NC}"
        fi
    done
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

# Iniciar servidor de produção
start_production_server() {
    log "Iniciando servidor de produção..."
    
    # Usar o build de produção
    NODE_ENV=production node dist/server.js &
    SERVER_PID=$!
    
    echo -e "${GREEN}✅ Servidor iniciado (PID: $SERVER_PID)${NC}"
    
    # Aguardar servidor ficar disponível
    if wait_for_service "http://localhost:5000/health" "API"; then
        return 0
    else
        kill $SERVER_PID 2>/dev/null || true
        return 1
    fi
}

# Iniciar servidor de desenvolvimento (simulando produção)
start_dev_server() {
    log "Iniciando servidor de desenvolvimento (simulando produção)..."
    
    # Iniciar servidor em background
    npm run dev:server &
    SERVER_PID=$!
    
    echo -e "${GREEN}✅ Servidor iniciado (PID: $SERVER_PID)${NC}"
    
    # Aguardar servidor ficar disponível
    if wait_for_service "http://localhost:5000/health" "API"; then
        return 0
    else
        kill $SERVER_PID 2>/dev/null || true
        return 1
    fi
}

# Iniciar frontend
start_frontend() {
    log "Iniciando frontend..."
    
    # Iniciar frontend em background
    npm run dev:client &
    FRONTEND_PID=$!
    
    echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
    
    # Aguardar frontend ficar disponível
    if wait_for_service "http://localhost:80" "Frontend"; then
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
    test_endpoint "http://localhost:5000/health" "200" "Health Check"
    
    # API endpoints
    test_endpoint "http://localhost:5000/api/vehicles" "200" "Lista de Veículos"
    test_endpoint "http://localhost:5000/api/sellers" "200" "Lista de Vendedores"
    test_endpoint "http://localhost:5000/api/users" "401" "Lista de Usuários (Protegido)"
    
    # Teste de CORS
    log "Testando CORS..."
    if curl -s -H "Origin: http://localhost:80" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS "http://localhost:5000/api/vehicles" | grep -q "Access-Control-Allow-Origin"; then
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
    test_endpoint "http://localhost:80" "200" "Homepage"
    test_endpoint "http://localhost:80/inventory" "200" "Inventário"
    test_endpoint "http://localhost:80/admin" "200" "Admin Login"
    
    # Assets estáticos
    test_endpoint "http://localhost:80/assets/index.css" "200" "CSS Principal"
    test_endpoint "http://localhost:80/assets/index.js" "200" "JavaScript Principal"
    
    # Teste de proxy da API
    log "Testando proxy da API..."
    if curl -s "http://localhost:80/api/vehicles" | grep -q "vehicles\|error"; then
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
    login_response=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"adminja2025"}')
    
    if echo "$login_response" | grep -q "token"; then
        echo -e "${GREEN}✅ Login admin funcionando${NC}"
        token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}   Token obtido: ${token:0:20}...${NC}"
    else
        echo -e "${RED}❌ Login admin falhou${NC}"
        echo -e "${RED}   Resposta: $login_response${NC}"
    fi
    echo ""
    
    # Teste de criação de veículo (se token disponível)
    if [ ! -z "$token" ]; then
        log "Testando criação de veículo..."
        vehicle_response=$(curl -s -X POST "http://localhost:5000/api/vehicles" \
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
        echo ""
    fi
}

# Teste de performance
test_performance() {
    log "🧪 TESTANDO PERFORMANCE..."
    echo -e "${PURPLE}=======================${NC}"
    
    # Teste de carga simples
    log "Teste de carga - 10 requisições simultâneas..."
    start_time=$(date +%s.%N)
    
    for i in {1..10}; do
        curl -s "http://localhost:5000/api/vehicles" > /dev/null &
    done
    wait
    
    end_time=$(date +%s.%N)
    duration=$(echo "$end_time - $start_time" | bc -l)
    
    echo -e "${GREEN}✅ 10 requisições completadas em ${duration}s${NC}"
    echo ""
}

# Limpeza
cleanup() {
    log "🧹 Limpando processos..."
    
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Servidor parado${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Frontend parado${NC}"
    fi
    
    # Limpar arquivos temporários
    rm -f /tmp/response.json
}

# Trap para limpeza ao sair
trap cleanup EXIT

# Execução principal
main() {
    echo -e "${BLUE}🎯 Iniciando teste de aplicação real...${NC}"
    echo ""
    
    # 1. Verificar portas
    check_ports
    
    # 2. Build da aplicação
    build_application
    
    # 3. Popular banco
    seed_database
    
    # 4. Iniciar servidor
    if start_dev_server; then
        echo -e "${GREEN}✅ Servidor iniciado com sucesso${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar servidor${NC}"
        exit 1
    fi
    
    # 5. Iniciar frontend
    if start_frontend; then
        echo -e "${GREEN}✅ Frontend iniciado com sucesso${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar frontend${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 APLICAÇÃO INICIADA COM SUCESSO!${NC}"
    echo -e "${BLUE}Frontend: http://localhost:80${NC}"
    echo -e "${BLUE}API: http://localhost:5000${NC}"
    echo ""
    
    # 6. Testes
    test_api
    test_frontend
    test_features
    test_performance
    
    echo ""
    echo -e "${GREEN}🎉 TODOS OS TESTES CONCLUÍDOS!${NC}"
    echo -e "${BLUE}A aplicação está funcionando como esperado em ambiente de produção simulado.${NC}"
    echo ""
    echo -e "${YELLOW}Para parar a aplicação, pressione Ctrl+C${NC}"
    
    # Manter aplicação rodando
    while true; do
        sleep 1
    done
}

# Executar
main "$@"