# 🚀 Guia de Deploy Docker com SSH - JA Automóveis

Este guia explica como configurar e executar o deploy da aplicação JA Automóveis usando Docker com túneis SSH para acesso remoto.

## 📋 Pré-requisitos

### 1. Software Necessário
- **Docker** e **Docker Compose**
- **Node.js** (versão 18+)
- **npm** ou **yarn**
- **OpenSSH** (geralmente já instalado)
- **OpenSSL** (para certificados SSL)

### 2. Verificar Instalações
```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Node.js
node --version
npm --version

# Verificar SSH
ssh --version

# Verificar OpenSSL
openssl version
```

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar configurações
nano .env
```

### 2. Configurar SSH (Opcional - para acesso remoto)
```bash
# Gerar chave SSH (se não tiver)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copiar chave para localhost (para autenticação automática)
ssh-copy-id $(whoami)@localhost
```

## 🚀 Executando o Deploy

### Opção 1: Deploy Simples (Local)
```bash
# Executar script de deploy local
npm run deploy:local

# Ou executar diretamente
bash scripts/docker-deploy-local.sh
```

### Opção 2: Deploy com SSH (Recomendado)
```bash
# Executar script de deploy com SSH
bash scripts/deploy-ssh-localhost.sh

# Ou usar o comando npm
npm run docker:deploy
```

## 🌐 Acessando a Aplicação

### Acesso Local
Após o deploy, a aplicação estará disponível em:
- **Frontend HTTPS**: https://localhost/
- **Frontend HTTP**: http://localhost/ (redireciona para HTTPS)
- **API**: http://localhost:5000
- **Admin**: https://localhost/admin

### Acesso Remoto via SSH

#### 1. Criar Túneis SSH
```bash
# Terminal 1: Túnel para Frontend
ssh -L 8080:localhost:80 $(whoami)@localhost

# Terminal 2: Túnel para API
ssh -L 5000:localhost:5000 $(whoami)@localhost

# Terminal 3: Túnel para MongoDB (se necessário)
ssh -L 27017:localhost:27017 $(whoami)@localhost
```

#### 2. Acessar Aplicação Remotamente
Com os túneis ativos, acesse:
- **Frontend**: http://localhost:8080
- **API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 🔒 Configuração SSL

### Certificados Auto-assinados (Desenvolvimento)
O script cria automaticamente certificados auto-assinados:
```bash
# Certificados são criados em:
ssl/cert.pem
ssl/key.pem
```

### Certificados Válidos (Produção)
Para produção, substitua por certificados válidos:
```bash
# Usando Let's Encrypt (exemplo)
certbot certonly --standalone -d yourdomain.com
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
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
```

### Status dos Containers
```bash
# Ver status
docker-compose ps

# Ver recursos utilizados
docker stats
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
```

### Banco de Dados
```bash
# Popular banco de dados
docker-compose --profile tools run --rm seeder

# Limpar banco de dados
docker-compose --profile tools run --rm seeder npx ts-node seeder.ts -d

# Acessar MongoDB
docker-compose exec mongo mongosh
```

### Desenvolvimento
```bash
# Modo desenvolvimento
npm run dev

# Apenas frontend
npm run dev:client

# Apenas backend
npm run dev:server
```

## 🔧 Solução de Problemas

### Porta já em uso
```bash
# Verificar qual processo está usando a porta
lsof -i :80
lsof -i :5000
lsof -i :27017

# Parar processo
kill -9 <PID>
```

### Docker não inicia
```bash
# Verificar se Docker está rodando
docker info

# Reiniciar Docker
sudo systemctl restart docker  # Linux
# ou reiniciar Docker Desktop no Windows/Mac
```

### Problemas de SSL
```bash
# Regenerar certificados
rm -rf ssl/
bash scripts/setup-ssl.sh
```

### Problemas de Build
```bash
# Limpar cache do Docker
docker system prune -a

# Rebuild sem cache
docker-compose build --no-cache
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
1. **Frontend**: Acesse https://localhost/
2. **API Health**: Acesse http://localhost:5000/health
3. **Admin**: Acesse https://localhost/admin
4. **API Endpoints**: Teste endpoints em https://localhost/api/

## 🔐 Segurança

### Configurações Recomendadas
1. **Altere o JWT_SECRET** no arquivo `.env`
2. **Use certificados SSL válidos** em produção
3. **Configure firewall** para restringir acesso
4. **Use senhas fortes** para usuários admin
5. **Monitore logs** regularmente

### Backup
```bash
# Backup do banco de dados
docker-compose exec mongo mongodump --out /backup

# Backup dos uploads
tar -czf uploads-backup.tar.gz uploads/
```

## 📞 Suporte

### Logs de Erro
Se encontrar problemas, verifique os logs:
```bash
# Logs detalhados
docker-compose logs --tail=100 -f

# Logs de erro específicos
docker-compose logs app | grep ERROR
docker-compose logs nginx | grep ERROR
```

### Informações do Sistema
```bash
# Informações do Docker
docker version
docker info

# Informações do sistema
uname -a
df -h
free -h
```

---

## 🎯 Resumo Rápido

1. **Configurar**: `cp env.example .env` e editar
2. **Deploy**: `bash scripts/deploy-ssh-localhost.sh`
3. **Acessar**: https://localhost/
4. **SSH**: `ssh -L 8080:localhost:80 $(whoami)@localhost`
5. **Logs**: `docker-compose logs -f`

**Credenciais Admin**: admin / adminja2025
