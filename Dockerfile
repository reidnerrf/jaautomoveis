# Etapa de build
FROM node:22-alpine AS base

# Dependências necessárias
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./

# Instala TODAS as dependências (inclui vite, esbuild, etc.)
RUN npm install

# Copia o código
COPY . .

# Faz o build (usa cache de deps)
RUN npm run build


# Etapa de produção
FROM node:22-alpine AS production

RUN apk add --no-cache dumb-init

# Usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copia só o necessário do estágio anterior
COPY --from=base --chown=nextjs:nodejs /app/dist ./dist
COPY --from=base --chown=nextjs:nodejs /app/public ./public
# uploads e assets não são necessários na imagem (montados por volume em runtime)
COPY --from=base --chown=nextjs:nodejs /app/package.json ./
COPY --from=base --chown=nextjs:nodejs /app/package-lock.json ./

# Instala dependências de produção + esbuild (necessário para middleware dev e build tools)
RUN npm ci --omit=dev && npm install esbuild && npm cache clean --force

USER nextjs

ENV PORT=5000
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "cross-env", "NODE_ENV=production", "node", "dist/server.js"]