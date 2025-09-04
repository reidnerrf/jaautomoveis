# 🐳 Docker Setup - JA Automóveis

Este documento explica como configurar e executar o projeto JA Automóveis usando Docker.

## 📋 Pré-requisitos

- Docker
- Docker Compose
- Arquivo `.env` configurado

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# JWT Secret (gere uma chave segura)
JWT_SECRET=your-super-secret-jwt-key-here

# MongoDB URI (será sobrescrito pelo Docker)
MONGODB_URI=mongodb://localhost:27017/JaAutomoveis

# CORS Origins (separados por vírgula)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 2. Executar o Projeto

```bash
# Iniciar todos os serviços
npm run start:full

# Ou usando docker-compose diretamente
docker compose up -d --build
```

### 3. Popular o Banco de Dados

```bash
# Popular com dados de exemplo
npm run docker:seed

# Ou usando o script
./scripts/seed-db.sh
```

## 🛠️ Comandos Úteis

### Gerenciamento de Serviços

```bash
# Iniciar todos os serviços
npm run start:full

# Parar todos os serviços
npm run start:full

# Ver logs
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f app
docker compose logs -f mongo
```

### Banco de Dados

```bash
# Popular banco com dados de exemplo
npm run docker:seed

# Limpar banco de dados
npm run docker:seed:destroy

# Acessar MongoDB diretamente
docker compose exec mongo mongosh JaAutomoveis
```

### Desenvolvimento

```bash
# Rebuild apenas o app
docker compose build app

# Rebuild e restart
docker compose up -d --build app

# Executar comandos dentro do container
docker compose exec app npm run lint
docker compose exec app npm run test
```

## 📊 Dados de Exemplo

O seeder cria os seguintes dados:

### 👥 Vendedores (4)
- João Silva (ativo)
- Maria Santos (ativo)  
- Pedro Oliveira (ativo)
- Ana Costa (inativo)

### 🚗 Veículos (8)
- **6 disponíveis**: Fiat Pulse, Hyundai HB20, Chevrolet Onix, Toyota Corolla, Jeep Renegade, Volkswagen Nivus
- **2 vendidos**: Honda Civic, Ford Ka (com histórico de vendas)

### 👤 Usuário Admin
- **Username**: `admin`
- **Password**: `adminja2025`
- **Email**: `reidner.red@gmail.com`

## 🔧 Solução de Problemas

### Erro: "Cannot find module 'esbuild'"

Este erro foi corrigido no Dockerfile. O `esbuild` agora é instalado explicitamente na etapa de produção.

### Erro de Conexão com MongoDB

```bash
# Verificar se o MongoDB está rodando
docker compose ps mongo

# Ver logs do MongoDB
docker compose logs mongo

# Reiniciar o MongoDB
docker compose restart mongo
```

### Erro de Permissão

```bash
# Dar permissão ao script de seeder
chmod +x scripts/seed-db.sh
```

### Limpar Tudo e Recomeçar

```bash
# Parar e remover containers
docker compose down

# Remover volumes (CUIDADO: apaga todos os dados)
docker compose down -v

# Rebuild completo
docker compose up -d --build
```

## 📁 Estrutura de Volumes

- `./uploads` → `/app/uploads` (imagens de veículos)
- `./assets` → `/app/assets` (assets estáticos)
- `mongodb_data` → `/data/db` (dados do MongoDB)

## 🌐 Acessos

- **Aplicação**: http://localhost:5000
- **Admin**: http://localhost:5000/admin
- **MongoDB**: localhost:27017
- **Nginx**: http://localhost:80

## 🔒 Segurança

- O container roda com usuário não-root (`nextjs`)
- Health checks configurados
- Variáveis sensíveis via `.env`
- CORS configurado

## 📝 Logs

```bash
# Ver todos os logs
docker compose logs

# Seguir logs em tempo real
docker compose logs -f

# Logs de um serviço específico
docker compose logs -f app
```

## 🚨 Troubleshooting

### Container não inicia

1. Verificar logs: `docker compose logs app`
2. Verificar se a porta 5000 está livre
3. Verificar variáveis de ambiente

### Banco não conecta

1. Verificar se o MongoDB está rodando: `docker compose ps`
2. Verificar URI de conexão no `.env`
3. Aguardar o MongoDB inicializar (pode levar alguns segundos)

### Build falha

1. Limpar cache: `docker system prune -a`
2. Rebuild: `docker compose build --no-cache`
3. Verificar se todas as dependências estão no `package.json`