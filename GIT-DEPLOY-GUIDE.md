# 🚀 Guia de Deploy com Clone do Git - JA Automóveis

Este guia explica como fazer o deploy completo da aplicação JA Automóveis clonando diretamente do repositório GitHub e configurando tudo automaticamente.

## 📋 Pré-requisitos

### 1. Software Necessário
- **Git** (para clonar o repositório)
- **Docker** e **Docker Compose**
- **Node.js** (versão 18+)
- **npm** ou **yarn**
- **OpenSSL** (para certificados SSL)

### 2. Repositório
- **GitHub**: https://github.com/reidnerrf/jaautomoveis.git
- **Branch**: main (padrão)

## 🔧 Instalação das Dependências

### Windows
```powershell
# Instalar Git
# Baixe de: https://git-scm.com/download/win

# Instalar Docker Desktop
# Baixe de: https://docs.docker.com/desktop/windows/install/

# Instalar Node.js
# Baixe de: https://nodejs.org/en/download/

# Instalar OpenSSL
# Baixe de: https://slproweb.com/products/Win32OpenSSL.html
```

### Ubuntu/Linux
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Git
sudo apt install -y git

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install -y docker-compose-plugin

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar OpenSSL
sudo apt install -y openssl

# Fazer logout e login novamente
```

### macOS
```bash
# Instalar Homebrew (se não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar dependências
brew install git docker node openssl
```

## 🚀 Executando o Deploy

### Opção 1: Script Automático (Recomendado)

#### Windows (PowerShell)
```powershell
# Executar script PowerShell
npm run deploy:git:ps1

# Ou diretamente
powershell -ExecutionPolicy Bypass -File scripts/deploy-from-git.ps1
```

#### Ubuntu/Linux
```bash
# Executar script bash
npm run deploy:git

# Ou diretamente
./scripts/deploy-from-git.sh
```

### Opção 2: Clone Manual + Deploy

#### 1. Clonar Repositório
```bash
# Clonar repositório
git clone https://github.com/reidnerrf/jaautomoveis.git
cd jaautomoveis

# Tornar scripts executáveis (Linux/macOS)
chmod +x scripts/*.sh
```

#### 2. Configurar Ambiente
```bash
# Copiar arquivo de configuração
cp env.example .env

# Editar configurações (opcional)
nano .env
```

#### 3. Executar Deploy
```bash
# Ubuntu/Linux
./scripts/deploy-ubuntu.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts/deploy-ssh-localhost.ps1

# Windows Batch
scripts\deploy-ssh-localhost.bat
```

## 🌐 Acessando a Aplicação

### Acesso Local
Após o deploy, a aplicação estará disponível em:
- **Frontend HTTPS**: https://localhost/
- **Frontend HTTP**: http://localhost/ (redireciona para HTTPS)
- **API**: http://localhost:5000
- **Admin**: https://localhost/admin

### Acesso Remoto via SSH

#### 1. Configurar Chaves SSH (Recomendado)
```bash
# Gerar chave SSH
ssh-keygen -t rsa -b 4096 -C "contato@jaautomoveisresende.com.br"

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
Os scripts criam automaticamente certificados auto-assinados:
```bash
# Certificados são criados em:
ssl/cert.pem
ssl/key.pem
```

### Certificados Válidos (Produção)
```bash
# Usando Let's Encrypt (Ubuntu/Linux)
sudo apt install -y certbot
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
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

### Status dos Containers
```bash
# Ver status
docker-compose ps

# Ver recursos utilizados
docker stats

# Espaço em disco
df -h

# Uso de memória
free -h
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

### Problemas de Clone
```bash
# Verificar conexão com GitHub
ping github.com

# Verificar Git
git --version

# Clonar com verbose
git clone --verbose https://github.com/reidnerrf/jaautomoveis.git
```

### Problemas de Permissão
```bash
# Linux: Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# Fazer logout e login novamente

# Windows: Executar como administrador
# Ou verificar permissões do Docker Desktop
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

## 🎯 Resumo Rápido

### Deploy Automático
```bash
# Ubuntu/Linux
npm run deploy:git

# Windows PowerShell
npm run deploy:git:ps1
```

### Deploy Manual
```bash
# 1. Clonar
git clone https://github.com/reidnerrf/jaautomoveis.git
cd jaautomoveis

# 2. Configurar
cp env.example .env

# 3. Deploy
./scripts/deploy-ubuntu.sh  # Linux
# ou
powershell -ExecutionPolicy Bypass -File scripts/deploy-ssh-localhost.ps1  # Windows
```

### Acesso
- **Frontend**: https://localhost/
- **API**: http://localhost:5000
- **Admin**: https://localhost/admin
- **Credenciais**: admin / adminja2025

---

## 🚀 **Vantagens do Deploy com Git Clone:**

✅ **Sempre atualizado** - Pega a versão mais recente  
✅ **Configuração automática** - Tudo configurado automaticamente  
✅ **Multiplataforma** - Funciona no Windows, Linux e macOS  
✅ **SSL automático** - Certificados criados automaticamente  
✅ **SSH integrado** - Túneis SSH configurados  
✅ **Zero configuração** - Apenas execute o script  

**Repositório**: https://github.com/reidnerrf/jaautomoveis.git
