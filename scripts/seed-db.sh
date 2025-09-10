#!/bin/bash

# Script para executar o seeder do banco de dados
# Uso: ./scripts/seed-db.sh [opções]
# Opções:
#   -d    Destruir dados existentes
#   -h    Mostrar ajuda

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}Seeder do Banco de Dados - JA Automóveis${NC}"
    echo ""
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  -d    Destruir dados existentes (limpar banco)"
    echo "  -h    Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0           # Popular o banco com dados de exemplo"
    echo "  $0 -d        # Limpar o banco de dados"
    echo ""
}

# Verificar se o Node.js está disponível
if ! command -v node &> /dev/null; then
    echo -e "${RED}Erro: Node.js não encontrado. Certifique-se de que o Node.js está instalado.${NC}"
    exit 1
fi

# Verificar se o ts-node está disponível
if ! command -v npx &> /dev/null; then
    echo -e "${RED}Erro: npx não encontrado. Certifique-se de que o npm está instalado.${NC}"
    exit 1
fi

# Processar argumentos
DESTROY_DATA=false

while getopts "dh" opt; do
    case $opt in
        d)
            DESTROY_DATA=true
            ;;
        h)
            show_help
            exit 0
            ;;
        \?)
            echo -e "${RED}Opção inválida: -$OPTARG${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo -e "${YELLOW}Aviso: Arquivo .env não encontrado. Certifique-se de que as variáveis de ambiente estão configuradas.${NC}"
fi

# Executar o seeder
echo -e "${BLUE}Iniciando seeder do banco de dados...${NC}"

if [ "$DESTROY_DATA" = true ]; then
    echo -e "${YELLOW}⚠️  ATENÇÃO: Destruindo todos os dados existentes!${NC}"
    echo -e "${YELLOW}Isso irá remover todas as coleções: vehicles, users, sellers${NC}"
    echo ""
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Destruindo dados...${NC}"
        npx ts-node --project tsconfig.server.json seeder.ts -d
        echo -e "${GREEN}✅ Dados destruídos com sucesso!${NC}"
    else
        echo -e "${YELLOW}Operação cancelada.${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}Populando banco de dados com dados de exemplo...${NC}"
    npx ts-node --project tsconfig.server.json seeder.ts
    echo -e "${GREEN}✅ Banco de dados populado com sucesso!${NC}"
    echo ""
    echo -e "${BLUE}Dados criados:${NC}"
    echo -e "  • ${GREEN}4 vendedores${NC}"
    echo -e "  • ${GREEN}8 veículos (6 disponíveis, 2 vendidos)${NC}"
    echo -e "  • ${GREEN}1 usuário admin${NC}"
    echo ""
    echo -e "${BLUE}Credenciais do admin:${NC}"
    echo -e "  • Username: ${YELLOW}admin${NC}"
    echo -e "  • Password: ${YELLOW}adminja2025${NC}"
    echo -e "  • Email: ${YELLOW}contato@jaautomoveisresende.com.br${NC}"
fi

echo -e "${GREEN}Seeder concluído!${NC}"