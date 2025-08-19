# 📚 Documentação
Local development with MongoDB
1. Create a `.env` at the project root with your Mongo URI:
```
MONGO_URI=mongodb://127.0.0.1:27017/ja-automoveis
PORT=5000
JWT_SECRET=change-me
```
2. Start Mongo locally (Docker):
```
npm run db:up
```
3. Run the app:
```
npm run dev
```
If you want to run without DB for front-end only, use:
```
npm run dev:server:nodb
```
Selecione o idioma da documentação:

- 🇧🇷 [Português (Brasil)](docs/pt-BR/README.md)
- 🇺🇸 [English](docs/en/README.md)
