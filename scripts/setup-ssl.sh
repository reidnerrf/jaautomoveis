#!/bin/bash

# Script para configurar SSL/HTTPS
# Suporta certificados auto-assinados e Let's Encrypt

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 CONFIGURAÇÃO SSL/HTTPS - JA Automóveis${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Função para log
log() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

# Criar diretório SSL
create_ssl_directory() {
    log "Criando diretório SSL..."
    
    mkdir -p ssl
    echo -e "${GREEN}✅ Diretório ssl criado${NC}"
}

# Gerar certificado auto-assinado
generate_self_signed() {
    log "Gerando certificado auto-assinado..."
    
    # Verificar se OpenSSL está disponível
    if ! command -v openssl &> /dev/null; then
        echo -e "${RED}❌ OpenSSL não encontrado${NC}"
        echo -e "${YELLOW}Instale o OpenSSL primeiro${NC}"
        exit 1
    fi
    
    # Gerar certificado
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=BR/ST=SP/L=SaoPaulo/O=JA-Automoveis/CN=localhost"
    
    # Definir permissões
    chmod 600 ssl/key.pem
    chmod 644 ssl/cert.pem
    
    echo -e "${GREEN}✅ Certificado auto-assinado criado${NC}"
    echo -e "${YELLOW}⚠️  Certificado válido por 365 dias${NC}"
    echo -e "${YELLOW}⚠️  Apenas para desenvolvimento/teste${NC}"
}

# Configurar Let's Encrypt
setup_letsencrypt() {
    log "Configurando Let's Encrypt..."
    
    # Verificar se certbot está disponível
    if ! command -v certbot &> /dev/null; then
        echo -e "${YELLOW}⚠️  Certbot não encontrado${NC}"
        echo -e "${BLUE}Instalando certbot...${NC}"
        
        # Instalar certbot
        if command -v apt &> /dev/null; then
            sudo apt update
            sudo apt install -y certbot
        elif command -v yum &> /dev/null; then
            sudo yum install -y certbot
        else
            echo -e "${RED}❌ Sistema não suportado${NC}"
            exit 1
        fi
    fi
    
    # Solicitar domínio
    read -p "Digite seu domínio (ex: exemplo.com): " domain
    
    if [ -z "$domain" ]; then
        echo -e "${RED}❌ Domínio não pode estar vazio${NC}"
        exit 1
    fi
    
    # Gerar certificado
    echo -e "${BLUE}Gerando certificado para $domain...${NC}"
    sudo certbot certonly --standalone -d $domain --non-interactive --agree-tos --email admin@$domain
    
    # Copiar certificados
    sudo cp /etc/letsencrypt/live/$domain/fullchain.pem ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$domain/privkey.pem ssl/key.pem
    
    # Definir permissões
    sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
    chmod 644 ssl/cert.pem
    chmod 600 ssl/key.pem
    
    echo -e "${GREEN}✅ Certificado Let's Encrypt criado${NC}"
    echo -e "${YELLOW}⚠️  Certificado válido por 90 dias${NC}"
    echo -e "${YELLOW}⚠️  Configure renovação automática${NC}"
}

# Verificar certificados existentes
check_existing_certificates() {
    log "Verificando certificados existentes..."
    
    if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
        echo -e "${GREEN}✅ Certificados encontrados${NC}"
        
        # Verificar validade
        if command -v openssl &> /dev/null; then
            expiry=$(openssl x509 -enddate -noout -in ssl/cert.pem | cut -d= -f2)
            echo -e "${BLUE}📅 Certificado válido até: $expiry${NC}"
        fi
        
        # Verificar se é auto-assinado
        if openssl x509 -in ssl/cert.pem -text -noout | grep -q "Issuer: CN=localhost"; then
            echo -e "${YELLOW}⚠️  Certificado auto-assinado detectado${NC}"
        else
            echo -e "${GREEN}✅ Certificado válido (não auto-assinado)${NC}"
        fi
        
        return 0
    else
        echo -e "${YELLOW}⚠️  Nenhum certificado encontrado${NC}"
        return 1
    fi
}

# Configurar renovação automática
setup_auto_renewal() {
    log "Configurando renovação automática..."
    
    # Criar script de renovação
    cat > scripts/renew-ssl.sh << 'EOF'
#!/bin/bash
# Script para renovar certificados SSL

set -e

# Renovar certificados Let's Encrypt
if command -v certbot &> /dev/null; then
    sudo certbot renew --quiet
    
    # Copiar novos certificados
    for domain in /etc/letsencrypt/live/*/; do
        if [ -d "$domain" ]; then
            domain_name=$(basename "$domain")
            sudo cp /etc/letsencrypt/live/$domain_name/fullchain.pem ssl/cert.pem
            sudo cp /etc/letsencrypt/live/$domain_name/privkey.pem ssl/key.pem
            sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
            chmod 644 ssl/cert.pem
            chmod 600 ssl/key.pem
        fi
    done
    
    # Reiniciar nginx
    docker-compose restart nginx
    
    echo "Certificados renovados com sucesso"
fi
EOF

    chmod +x scripts/renew-ssl.sh
    
    # Adicionar ao crontab
    (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/scripts/renew-ssl.sh") | crontab -
    
    echo -e "${GREEN}✅ Renovação automática configurada${NC}"
    echo -e "${BLUE}📅 Executa diariamente às 2:00 AM${NC}"
}

# Testar certificados
test_certificates() {
    log "Testando certificados..."
    
    if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
        # Verificar se os certificados são válidos
        if openssl x509 -in ssl/cert.pem -text -noout > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Certificado válido${NC}"
        else
            echo -e "${RED}❌ Certificado inválido${NC}"
            return 1
        fi
        
        if openssl rsa -in ssl/key.pem -check -noout > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Chave privada válida${NC}"
        else
            echo -e "${RED}❌ Chave privada inválida${NC}"
            return 1
        fi
        
        # Verificar se a chave corresponde ao certificado
        cert_md5=$(openssl x509 -noout -modulus -in ssl/cert.pem | openssl md5)
        key_md5=$(openssl rsa -noout -modulus -in ssl/key.pem | openssl md5)
        
        if [ "$cert_md5" = "$key_md5" ]; then
            echo -e "${GREEN}✅ Certificado e chave correspondem${NC}"
        else
            echo -e "${RED}❌ Certificado e chave não correspondem${NC}"
            return 1
        fi
        
        return 0
    else
        echo -e "${RED}❌ Certificados não encontrados${NC}"
        return 1
    fi
}

# Mostrar informações
show_info() {
    echo ""
    echo -e "${GREEN}🎉 CONFIGURAÇÃO SSL CONCLUÍDA!${NC}"
    echo ""
    echo -e "${BLUE}📁 Arquivos criados:${NC}"
    echo -e "  • ssl/cert.pem (certificado)"
    echo -e "  • ssl/key.pem (chave privada)"
    echo ""
    echo -e "${BLUE}🔒 Próximos passos:${NC}"
    echo -e "  • Execute: npm run docker:deploy"
    echo -e "  • Acesse: https://localhost/"
    echo ""
    echo -e "${BLUE}📋 Comandos úteis:${NC}"
    echo -e "  • Verificar certificado: openssl x509 -in ssl/cert.pem -text -noout"
    echo -e "  • Verificar chave: openssl rsa -in ssl/key.pem -check -noout"
    echo -e "  • Renovar certificado: ./scripts/renew-ssl.sh"
    echo ""
    echo -e "${YELLOW}⚠️  Para produção:${NC}"
    echo -e "  • Use certificados válidos (Let's Encrypt)"
    echo -e "  • Configure renovação automática"
    echo -e "  • Atualize ALLOWED_ORIGINS no .env"
}

# Menu principal
show_menu() {
    echo -e "${BLUE}Escolha uma opção:${NC}"
    echo "1) Gerar certificado auto-assinado (desenvolvimento)"
    echo "2) Configurar Let's Encrypt (produção)"
    echo "3) Verificar certificados existentes"
    echo "4) Configurar renovação automática"
    echo "5) Testar certificados"
    echo "6) Sair"
    echo ""
    read -p "Digite sua escolha (1-6): " choice
}

# Execução principal
main() {
    create_ssl_directory
    
    while true; do
        show_menu
        
        case $choice in
            1)
                generate_self_signed
                test_certificates
                show_info
                break
                ;;
            2)
                setup_letsencrypt
                test_certificates
                setup_auto_renewal
                show_info
                break
                ;;
            3)
                if check_existing_certificates; then
                    test_certificates
                fi
                ;;
            4)
                setup_auto_renewal
                ;;
            5)
                test_certificates
                ;;
            6)
                echo -e "${BLUE}Saindo...${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Opção inválida${NC}"
                ;;
        esac
        
        echo ""
        read -p "Pressione Enter para continuar..."
        echo ""
    done
}

# Executar
main "$@"