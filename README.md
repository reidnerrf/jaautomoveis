# JA Automóveis – Guia rápido de estilos e performance

## Tailwind CSS
- Estilos compilados localmente via PostCSS/Vite.
- Arquivo de entrada: `styles.css` (com `@tailwind base/components/utilities`).
- Tokens do tema: `tailwind.config.js` em `theme.extend`.

### Cores e fontes
Adicione novas cores em `tailwind.config.js`:

```js
// tailwind.config.js (trecho)
extend: {
  colors: {
    brand: {
      50: '#f5f8ff',
      500: '#3258f0',
      700: '#2543bb'
    }
  },
  fontFamily: {
    sans: ['Inter','ui-sans-serif','system-ui','sans-serif']
  }
}
```

Depois, rode `npm run build:client` ou `npm run dev` para ver as classes.

### Safelist
Algumas classes são geradas dinamicamente (ex.: tamanhos e gradientes). Mantemos um `safelist` no `tailwind.config.js`. Se você criar classes dynamic (via template string), garanta que elas estejam no `safelist` ou refatore para classes fixas.

## Componentes utilitários
- Em `styles.css` adicionamos utilitários:
  - `.btn-primary`, `.btn-secondary`
  - `.card`, `.card-body`
Use-os para padronizar UI e reduzir duplicação.

## Performance
- Prefetch de rotas ao hover (ver `utils/prefetch.ts` e uso no `components/Header.tsx`).
- Imagens: `components/OptimizedImage.tsx` com `loading`, `decoding=async`, `sizes` e `width/height` para estabilidade de layout.
- Skeleton loaders implementados no `InventoryPage`.

## Acessibilidade
- Garanta `alt` nas imagens e `aria-label` em botões icônicos.
- Contraste mínimo e foco visível já estão contemplados nos utilitários de botão.

## Scripts
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Analisar bundle: `npm run analyze`

## Ambiente
- Node 18+
- Variáveis (arquivo `.env` na raiz):
  - `MONGODB_URI`: string de conexão MongoDB
  - `JWT_SECRET`: segredo do JWT (em desenvolvimento há fallback para evitar quebra do login; configure no deploy)

## Estrutura
- `server.ts`: servidor Express + Socket.IO
- `backend/`: modelos, controllers e rotas da API
- `components/`, `pages/`: front-end React
- `uploads/`: armazenamento de imagens (servido em `/uploads`)

## Ajustes recentes
- Header transparente apenas no hero da Home; demais páginas usam cabeçalho sólido (vide `components/Header.tsx`).
- Em `/vehicle/:id`, o selo “Oferta Especial” foi substituído por contador de usuários online via `RealTimeViewers`.
- Removidos no painel Admin os gráficos de cidades, dispositivos e análise em tempo real; dashboard ficou mais leve (vide `pages/AdminDashboardPage.tsx`).
- `OptimizedImage` agora usa placeholder inline (SVG), tenta WebP e faz fallback com retentativas, reduzindo falhas na carga de imagens de veículos.
- Autenticação: fallback seguro de `JWT_SECRET` em dev para evitar login inoperante; mantenha `JWT_SECRET` definido em produção.