### CDN Global - Guia Rápido

- Configure um provedor CDN (Cloudflare, CloudFront, Fastly) apontando para sua origem (Nginx ou bucket estático).
- Ative cache agressivo para `/assets/**` com immutable e 1y.
- Em produção, defina a variável de ambiente `CDN_BASE_URL` para prefixar assets:

```bash
CDN_BASE_URL=https://cdn.seu-dominio.com/
```

- Vite já está configurado com `base` para usar `CDN_BASE_URL`.
- Garanta que o Nginx retorna cabeçalhos:
  - `Cache-Control: public, max-age=31536000, immutable` para assets versionados
  - `Cache-Control: public, max-age=3600` para imagens dinâmicas / uploads

- Habilite Brotli e Gzip na borda.
- Opcional: Prefetch DNS (`<link rel="dns-prefetch" href="//cdn.seu-dominio.com"/>`).