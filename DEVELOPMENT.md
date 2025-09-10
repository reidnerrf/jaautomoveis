# 🚀 Desenvolvimento Local - JA Automóveis

Este documento explica como configurar e executar o projeto JA Automóveis em desenvolvimento local.

## 📋 Configuração de Portas

- **Frontend**: http://localhost:80
- **API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 🛠️ Pré-requisitos

- Node.js 18+ 
- npm 8+
- MongoDB (opcional - pode usar SKIP_DB=true)

## ⚡ Início Rápido

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
nano .env
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Executar em Desenvolvimento

```bash
# Opção 1: Script automatizado (recomendado)
npm run dev:local

# Opção 2: Comando direto
npm run dev

# Opção 3: Servidores separados
npm run dev:client  # Frontend na porta 80
npm run dev:server  # API na porta 5000
```

## 📊 Popular Banco de Dados

```bash
# Popular com dados de exemplo
./scripts/seed-db.sh

# Ou diretamente
npx ts-node --project tsconfig.server.json seeder.ts
```

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar desenvolvimento
npm run dev:local

# Apenas frontend
npm run dev:client

# Apenas backend
npm run dev:server

# Backend sem banco
npm run dev:server:nodb
```

### Build e Deploy

```bash
# Build completo
npm run build

# Build apenas cliente
npm run build:client

# Build apenas servidor
npm run build:server

# Preview da build
npm run preview
```

### Qualidade de Código

```bash
# Lint
npm run lint

# Lint com correção automática
npm run lint:fix

# Verificação de tipos
npm run type-check

# Testes
npm run test
```

### Banco de Dados

```bash
# Popular banco
./scripts/seed-db.sh

# Limpar banco
./scripts/seed-db.sh -d

# Executar seeder diretamente
npx ts-node --project tsconfig.server.json seeder.ts
```

## 🌐 URLs de Acesso

- **Homepage**: http://localhost:80
- **Inventário**: http://localhost:80/inventory
- **Admin**: http://localhost:80/admin
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 🔑 Credenciais Admin

- **Username**: `admin`
- **Password**: `adminja2025`
- **Email**: `contato@jaautomoveisresende.com.br`

## 📁 Estrutura do Projeto

```
├── pages/                 # Páginas React
├── components/            # Componentes reutilizáveis
├── backend/              # Código do servidor
│   ├── models/           # Modelos do MongoDB
│   ├── routes/           # Rotas da API
│   └── controllers/      # Controladores
├── hooks/                # Custom hooks React
├── types/                # Definições TypeScript
├── scripts/              # Scripts utilitários
└── public/               # Assets estáticos
```

## 🔧 Configurações

### Vite (Frontend)

- **Porta**: 80
- **Proxy**: API redirecionada para porta 5000
- **HMR**: Hot Module Replacement ativo
- **Source Maps**: Ativo em desenvolvimento

### Express (Backend)

- **Porta**: 5000
- **CORS**: Configurado para localhost:80
- **MongoDB**: Conexão automática
- **Socket.IO**: WebSocket ativo

## 🐛 Solução de Problemas

### Porta 80 em uso

```bash
# Verificar qual processo está usando
sudo lsof -i :80

# Parar processo (substitua PID)
sudo kill -9 PID

# Ou usar sudo para rodar na porta 80
sudo npm run dev:client
```

### Porta 5000 em uso

```bash
# Verificar qual processo está usando
lsof -i :5000

# Parar processo
kill -9 PID
```

### MongoDB não conecta

```bash
# Verificar se MongoDB está rodando
brew services list | grep mongo  # macOS
systemctl status mongod          # Linux

# Ou usar sem banco
SKIP_DB=true npm run dev:server
```

### Erro de permissão

```bash
# Dar permissão aos scripts
chmod +x scripts/*.sh
```

### Dependências desatualizadas

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📝 Logs e Debug

### Frontend (Vite)

- Logs no terminal onde executou `npm run dev:client`
- DevTools do navegador (F12)
- Console do navegador

### Backend (Express)

- Logs no terminal onde executou `npm run dev:server`
- Logs estruturados com timestamps
- Error handling com stack traces

### MongoDB

```bash
# Conectar ao MongoDB
mongosh JaAutomoveis

# Ver coleções
show collections

# Ver documentos
db.vehicles.find()
db.sellers.find()
db.users.find()
```

## 🚀 Performance

### Frontend

- **Code Splitting**: Automático por rota
- **Lazy Loading**: Componentes carregados sob demanda
- **Tree Shaking**: Código não utilizado removido
- **Compression**: Gzip ativo

### Backend

- **Caching**: Headers de cache configurados
- **Compression**: Gzip middleware ativo
- **Rate Limiting**: Proteção contra spam
- **Database Indexing**: Índices otimizados

## 🔒 Segurança

- **CORS**: Configurado para domínios específicos
- **Helmet**: Headers de segurança
- **Rate Limiting**: Proteção contra ataques
- **Input Validation**: Sanitização de dados
- **JWT**: Autenticação segura

## 📱 Mobile

- **Responsive**: Design adaptativo
- **Touch**: Otimizado para touch
- **PWA**: Service Worker configurado
- **Offline**: Cache de assets

## 🌍 Internacionalização

- **Português**: Idioma padrão
- **Formatação**: Moeda e datas em PT-BR
- **Timezone**: America/Sao_Paulo