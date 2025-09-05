# 🐧 Guia de Deploy Docker com SSH - Ubuntu/Linux

Este guia é específico para executar o deploy da aplicação JA Automóveis no Ubuntu/Linux usando Docker com túneis SSH.

## 📋 Pré-requisitos

### 1. Sistema Operacional
- **Ubuntu 20.04+** (ou distribuição Linux compatível)
- **Acesso sudo** (para instalação de dependências)

### 2. Dependências do Sistema
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

## 🔧 Instalação das Dependências

### 1. Instalar Docker
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt-get install -y docker-compose-plugin

# Verificar instalação
docker --version
docker compose version
```

### 2. Instalar Node.js
```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar OpenSSL
```bash
# Instalar OpenSSL
sudo apt install -y openssl

# Verificar instalação
openssl version
```

### 4. Configurar SSH (Opcional)
```bash
# Instalar SSH Server
sudo apt install -y openssh-server

# Habilitar e iniciar SSH
sudo systemctl enable ssh
sudo systemctl start ssh

# Verificar status
sudo systemctl status ssh
```

## 🚀 Executando o Deploy

### 1. Preparar o Ambiente
```bash
# Clonar/navegar para o diretório do projeto
cd /path/to/ja3

# Tornar script executável
chmod +x scripts/deploy-ubuntu.sh

# Copiar arquivo de configuração
cp env.example .env
```

### 2. Executar Deploy
```bash
# Opção 1: Script direto
./scripts/deploy-ubuntu.sh

# Opção 2: Via npm
npm run deploy:ubuntu

# Opção 3: Com permissões específicas
sudo -E ./scripts/deploy-ubuntu.sh
```

### 3. Verificar Deploy
```bash
# Verificar containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Testar aplicação
curl http://localhost/
curl http://localhost:5000/health
```

## 🌐 Acessando a Aplicação

### Acesso Local
- **Frontend HTTPS**: https://localhost/
- **Frontend HTTP**: http://localhost/ (redireciona para HTTPS)
- **API**: http://localhost:5000
- **Admin**: https://localhost/admin

### Acesso Remoto via SSH

#### 1. Configurar Chaves SSH (Recomendado)
```bash
# Gerar chave SSH
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copiar chave para localhost
ssh-copy-id $USER@localhost

# Testar conexão
ssh $USER@localhost
```

#### 2. Criar Túneis SSH
```bash
# Terminal 1: Frontend
ssh -L 8080:localhost:80 $USER@localhost

# Terminal 2: API
ssh -L 5000:localhost:5000 $USER@localhost

# Terminal 3: MongoDB
ssh -L 27017:localhost:27017 $USER@localhost
```

#### 3. Acessar Aplicação Remotamente
Com os túneis ativos:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 🔒 Configuração SSL

### Certificados Auto-assinados (Desenvolvimento)
```bash
# Certificados são criados automaticamente em:
ssl/cert.pem
ssl/key.pem
```

### Certificados Válidos (Produção)
```bash
# Usando Let's Encrypt
sudo apt install -y certbot

# Gerar certificado
sudo certbot certonly --standalone -d yourdomain.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

## 🔧 Configuração de Firewall

### UFW (Ubuntu Firewall)
```bash
# Habilitar UFW
sudo ufw enable

# Permitir portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Verificar status
sudo ufw status
```

### iptables (Alternativo)
```bash
# Permitir portas
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Salvar regras
sudo iptables-save > /etc/iptables/rules.v4
```

## 📊 Monitoramento e Logs

### Ver Logs dos Containers
```bash
# Todos os containers
docker-compose logs -f

# Container específico
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f mongo

# Logs com timestamp
docker-compose logs -f -t
```

### Monitoramento do Sistema
```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Espaço em disco
df -h

# Uso de memória
free -h

# Processos Docker
docker ps -a
```

## 🛠️ Comandos Úteis

### Gerenciamento de Containers
```bash
# Parar todos os containers
docker-compose down

# Parar e remover volumes
docker-compose down --volumes

# Reiniciar containers
docker-compose restart

# Rebuild e restart
docker-compose up -d --build

# Ver logs em tempo real
docker-compose logs -f

# Executar comando em container
docker-compose exec app bash
docker-compose exec mongo mongosh
```

### Banco de Dados
```bash
# Popular banco de dados
docker-compose --profile tools run --rm seeder

# Limpar banco de dados
docker-compose --profile tools run --rm seeder npx ts-node seeder.ts -d

# Acessar MongoDB
docker-compose exec mongo mongosh

# Backup do banco
docker-compose exec mongo mongodump --out /backup
```

### Desenvolvimento
```bash
# Modo desenvolvimento
npm run dev

# Apenas frontend
npm run dev:client

# Apenas backend
npm run dev:server

# Build da aplicação
npm run build
```

## 🔧 Solução de Problemas

### Problemas de Permissão
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Fazer logout e login novamente
# Ou executar com sudo (não recomendado)
sudo -E ./scripts/deploy-ubuntu.sh
```

### Porta já em uso
```bash
# Verificar qual processo está usando a porta
sudo lsof -i :80
sudo lsof -i :5000
sudo lsof -i :27017

# Parar processo
sudo kill -9 <PID>

# Ou usar porta diferente
# Editar docker-compose.yml
```

### Docker não inicia
```bash
# Verificar status do Docker
sudo systemctl status docker

# Reiniciar Docker
sudo systemctl restart docker

# Verificar logs
sudo journalctl -u docker.service
```

### Problemas de SSL
```bash
# Regenerar certificados
rm -rf ssl/
./scripts/deploy-ubuntu.sh

# Verificar certificados
openssl x509 -in ssl/cert.pem -text -noout
```

### Problemas de Build
```bash
# Limpar cache do Docker
docker system prune -a

# Rebuild sem cache
docker-compose build --no-cache

# Limpar volumes
docker-compose down --volumes
```

## 📱 Testando a Aplicação

### Testes Automáticos
```bash
# Executar todos os testes
npm run test:all

# Testes específicos
npm run test:unit
npm run test:api
npm run test:e2e
```

### Testes Manuais
```bash
# Testar frontend
curl -I http://localhost/
curl -I https://localhost/

# Testar API
curl http://localhost:5000/health
curl http://localhost/api/vehicles

# Testar admin
curl https://localhost/admin
```

## 🔐 Segurança

### Configurações Recomendadas
1. **Altere o JWT_SECRET** no arquivo `.env`
2. **Use certificados SSL válidos** em produção
3. **Configure firewall** adequadamente
4. **Use senhas fortes** para usuários admin
5. **Monitore logs** regularmente
6. **Mantenha o sistema atualizado**

### Backup
```bash
# Backup do banco de dados
docker-compose exec mongo mongodump --out /backup/$(date +%Y%m%d)

# Backup dos uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/

# Backup da configuração
cp .env .env.backup
cp docker-compose.yml docker-compose.yml.backup
```

## 📞 Suporte

### Logs de Erro
```bash
# Logs detalhados
docker-compose logs --tail=100 -f

# Logs de erro específicos
docker-compose logs app | grep ERROR
docker-compose logs nginx | grep ERROR

# Logs do sistema
sudo journalctl -u docker.service
```

### Informações do Sistema
```bash
# Informações do Docker
docker version
docker info

# Informações do sistema
uname -a
lsb_release -a
df -h
free -h
```

---

## 🎯 Resumo Rápido

1. **Instalar dependências**: Docker, Node.js, OpenSSL
2. **Configurar**: `cp env.example .env` e editar
3. **Deploy**: `./scripts/deploy-ubuntu.sh`
4. **Acessar**: https://localhost/
5. **SSH**: `ssh -L 8080:localhost:80 $USER@localhost`

**Credenciais Admin**: admin / adminja2025
