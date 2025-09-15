## JA Automóveis — Aplicação Full‑Stack

Projeto full‑stack para gestão e vitrine de veículos, com frontend em React + Vite e backend em Node.js/Express, MongoDB, Redis, GraphQL, WebSockets, PWA e automações de deploy com Docker e Nginx.

### Visão Geral
- **Monorepo leve** com frontend e backend no mesmo projeto
- **SSR/Pré‑render estático** e PWA para performance e SEO
- **API REST + GraphQL** com autenticação JWT
- **MongoDB** para persistência e **Redis** para cache/fila (Bull)
- **WebSockets** para métricas ao vivo
- **Upload/otimização de imagens** (Sharp)
- **Jobs assíncronos** e tarefas agendadas
- **Testes** unitários, API, E2E e auditoria de performance
- **Observabilidade** com Sentry e métricas
- **Infra** com Docker, Nginx (HTTP/2 + Gzip/Brotli), SSL

### Tecnologias
- **Frontend**: React 18, React Router 6, Tailwind CSS, Framer Motion, Recharts, uPlot
- **Backend**: Node.js, Express, Apollo Server (GraphQL), Socket.IO, Bull, Node‑Cron
- **Banco/Cache**: MongoDB (Mongoose), Redis (ioredis)
- **Segurança**: Helmet, Rate Limit, CORS, Mongo Sanitize, JWT, HPP
- **Imagens/PWA**: Sharp, Service Worker (`public/sw.js`), Manifest
- **Utilitários**: dotenv, multer, nodemailer, geoip‑lite, web‑push
- **Build/Dev**: Vite 7, TypeScript 5, ts‑node, nodemon, concurrently
- **Qualidade**: ESLint, Prettier, Jest, Testing Library, Playwright, Lighthouse
- **Deploy**: Docker, docker‑compose, Nginx

### Estrutura (alto nível)
```
backend/          # API, controllers, models, middlewares, GraphQL, filas, sockets
components/       # Componentes React reutilizáveis (UI/UX)
pages/            # Páginas de rotas React
hooks/, utils/    # Hooks e utilitários compartilhados
public/, assets/  # Estáticos e mídias
server.ts         # Bootstrap do servidor (Express + estáticos)
dist/             # Artefatos de build (cliente + servidor)
Dockerfile*       # Imagens Docker
vite*.config.ts   # Configurações do Vite
jest.config.cjs   # Configuração de testes
playwright.config.ts
```

Documentos úteis:
- `API.md`, `COMPONENTS.md`, `DEVELOPMENT.md`
- `DOCKER.md`, `DOCKER-FRONTEND-80.md`, `GIT-DEPLOY-GUIDE.md`, `SSH-DEPLOY-GUIDE.md`, `UBUNTU-DEPLOY-GUIDE.md`, `HTTPS-SSL-IMPLEMENTATION.md`, `docs/`, `ROADMAP.md`, `TODO.md`

### Funcionalidades
- Catálogo de veículos com filtros, paginação e lista virtualizada
- Página de detalhes com galeria, ficha técnica e comparação de preços
- Dashboard administrativo com métricas e alertas
- Upload e otimização de imagens (Sharp), carrossel e lazy loading
- Autenticação com JWT, rotas privadas e autorização básica
- Notificações web push, métricas de usuários em tempo real (Socket.IO)
- PWA com cache de assets e fallback offline
- SEO com `react-helmet-async`, sitemap e robots

### Requisitos
- Node.js >= 18, npm >= 8
- Docker e docker‑compose (opcional, recomendado para produção)
- MongoDB e Redis (locais ou via Docker)

### Variáveis de Ambiente
Copie `env.example` para `.env` e ajuste:
- **Servidor**: `PORT`, `NODE_ENV`, `CORS_ORIGIN`
- **MongoDB**: `MONGO_URI`
- **Redis**: `REDIS_URL`
- **Auth**: `JWT_SECRET`, `JWT_EXPIRES_IN`
- **E‑mail**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- **Uploads**: `UPLOAD_DIR`
- **PWA/Push**: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`

### Como Rodar (Desenvolvimento)
1. Instale dependências:
```
npm install
```
2. Suba MongoDB (opcional via Docker):
```
npm run db:up
```
3. Inicie em modo dev (cliente + servidor):
```
npm run dev
```
- Cliente: `http://localhost:80`
- Servidor: `http://localhost:3000` (pode variar por `.env`)

Scripts úteis: `dev:server`, `dev:client`, `start`, `start:nodb`, `seed`.

### Build e Preview
```
npm run build        # build de servidor (tsc) + cliente (vite)
npm run preview      # serve estático do Vite para homologação
```
Artefatos em `dist/` (cliente) e `dist/server.js` (servidor).

### Testes e Qualidade
- Unitários: `npm run test:unit`
- API: `npm run test:api`
- E2E (Playwright): `npm run test:e2e`
- Performance (Lighthouse): `npm run test:performance`
- Tipo/Lint/Format: `npm run type-check`, `npm run lint`, `npm run lint:fix`, `npm run format`
- Pipeline local: `npm run test:all`

### Arquitetura
- **Frontend (SPA + PWA)**: Vite, React 18, Tailwind, code‑splitting, lazy, charts e animações leves; service worker (`public/sw.js`, `sw-register.js`).
- **Backend (API + GraphQL + WS)**: Express + Apollo Server (`backend/graphql/*`), REST em `backend/routes/*`, middlewares de segurança (`backend/middleware/*`), modelos Mongoose (`backend/models/*`), controllers (`backend/controllers/*`), WebSockets (`backend/socket.ts`, `backend/websockets/*`), filas Bull (`backend/queues/*`) e cache distribuído (`backend/cache/*`).
- **Infra/Deploy**: Dockerfiles, `docker-compose.yml` e `docker-compose.prod.yml`, Nginx (`nginx*.conf`) com HTTP/2, gzip/brotli, cache, proxy reverso; guias de SSL.

### Deploy
- Local com Docker (Mongo + App + Nginx):
```
npm run start:full
```
- Parar:
```
npm run stop:full
```
Scripts adicionais: `docker:deploy`, `deploy:local`, `deploy:ssh`, `deploy:ubuntu`, `deploy:git`.

### Segurança
- Headers (Helmet), CORS, rate‑limit, sanitização e HPP
- JWT com expiração configurável
- Uploads (Multer) e validações (`express-validator`)

### Observabilidade e Performance
- Sentry (`@sentry/react`), Web Vitals (`web-vitals`), auditorias (`npm run performance:audit`)
- Cache HTTP no Nginx e application‑cache em Redis
- Otimização de imagens (Sharp) e pré‑carregamento de assets

### Troubleshooting
- Porta 80 ocupada: altere porta do Vite em `npm run dev:client`
- Mongo/Redis: confira `MONGO_URI`/`REDIS_URL` e `npm run db:up`
- Sharp no Windows: reinstale dependências e ferramentas nativas se falhar o build
- Service Worker: limpe cache do navegador após mudar `sw.js`
- Tipagem: `npm run type-check`

### Roadmap (resumo)
Veja `ROADMAP.md` e `TODO.md`. Itens:
- Integrações externas (marketplaces/CRMs)
- SEO e Core Web Vitals
- Relatórios e exportações (XLSX/PDF)

### Licença
Uso interno da JA Automóveis. Verifique termos contratuais antes de redistribuir.
