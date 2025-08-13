# 🚗 JA Automóveis

Aplicação **fullstack** para gerenciamento e exibição de veículos, com painel administrativo, integração com banco de dados MongoDB e frontend em React + TypeScript (Vite).

---

## 📦 Tecnologias

### **Frontend**
- React + TypeScript
- Vite
- TailwindCSS
- React Router
- Framer Motion

### **Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticação
- Dotenv para variáveis de ambiente
- CORS

---

## 📂 Estrutura do projeto

```
ja-automoveis/
├── backend/           # Código do servidor (API)
├── components/        # Componentes React
├── hooks/             # Hooks personalizados (ex: useVehicleData, useAuth)
├── pages/             # Páginas do frontend
├── api/               # Tipos e serviços de API
├── index.html         # Entrada do app (Vite)
├── server.ts          # Servidor Express
├── vite.config.ts     # Configuração do Vite
├── tsconfig.json      # Configuração TypeScript
└── package.json
```

---

## ⚙️ Configuração do Ambiente

1. **Clone o repositório**
```bash
git clone https://github.com/seuusuario/jaautomoveis.git
cd jaautomoveis
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz:
```env
MONGO_URI=mongodb://localhost:27017/JaAutomoveis
JWT_SECRET=sua_chave_secreta
PORT=3000
```

4. **Inicie o MongoDB**
```bash
mongod
```

---

## 🚀 Desenvolvimento

Para rodar **frontend** e **backend** em modo desenvolvimento:

```bash
# Iniciar frontend
npm run dev

# Em outro terminal, iniciar backend
npx ts-node server.ts
```

---

## 📦 Build e Produção

1. **Build do frontend**
```bash
npm run build
```

2. **Iniciar servidor Express servindo o build**
```bash
npm run start
```

> O backend serve os arquivos estáticos da pasta `dist/` e expõe as rotas da API.

---

## 📌 Rotas Principais

### **Frontend**
- `/` – Página inicial
- `/inventory` – Estoque de veículos
- `/vehicle/:id` – Detalhes de um veículo
- `/about` – Sobre
- `/contact` – Contato
- `/admin/login` – Login do admin
- `/admin/dashboard` – Painel administrativo

### **Backend (API)**
- `GET /api/vehicles` – Lista veículos
- `GET /api/vehicles/:id` – Busca veículo por ID
- `POST /api/vehicles` – Adiciona veículo (auth necessária)
- `PUT /api/vehicles/:id` – Atualiza veículo (auth necessária)
- `DELETE /api/vehicles/:id` – Remove veículo (auth necessária)

---

## 🛠 Scripts Disponíveis

- `npm run dev` – Inicia Vite em modo desenvolvimento
- `npm run build` – Compila frontend para produção
- `npm run start` – Inicia backend servindo build do frontend
- `npm run seed` – Popula o banco com dados de exemplo

---

## 📄 Licença
Este projeto é licenciado sob a [MIT License](LICENSE).
