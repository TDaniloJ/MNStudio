# 📚 MN Studio - Plataforma de Mangás e Novels

Plataforma completa para leitura de mangás e novels com suporte a capítulos, favoritos, histórico de leitura, sistema de badges, coins e muito mais.

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- PostgreSQL 12+
- npm ou yarn

### Setup Local (5 minutos)

1. **Clone e instale:**
   ```bash
   cd c:\MNStudio
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure variáveis de ambiente:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edite backend/.env com suas credenciais de banco
   ```

3. **Configure banco de dados:**
   ```bash
   cd backend
   npm run db:setup
   ```

4. **Inicie os servidores:**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

Acesse: **http://localhost:5173**

---

## 📋 Documentação

| Documento | Descrição |
|-----------|-----------|
| **[docs/SETUP.md](./docs/SETUP.md)** | Instalação detalhada, troubleshooting, scripts |
| **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** | Estrutura do projeto, fluxo de dados, endpoints |

---

## 🏗️ Estrutura

```
MNStudio/
├── backend/              # Node.js + Express + Sequelize
│   ├── src/
│   │   ├── controllers/  # Lógica de negócio
│   │   ├── routes/       # Definição de endpoints
│   │   ├── models/       # Modelos Sequelize
│   │   └── middlewares/  # Auth, upload, etc
│   └── uploads/          # Imagens de avatar, manga, etc
├── frontend/             # React + Vite + Tailwind
│   └── src/
│       ├── pages/        # Rotas principais
│       ├── components/   # Componentes reutilizáveis
│       ├── services/     # API clients
│       └── store/        # Estado Zustand
└── docs/                 # Documentação (SETUP.md, ARCHITECTURE.md)
```

---

## 🔑 Funcionalidades

- 📖 Leitura de mangás e novels com capítulos
- 👤 Perfil (avatar, banner, bio) + OAuth Google
- 🏆 Badges, coins, ranking por leituras
- 🛠️ Admin: gerenciar usuários, conteúdo, estatísticas
- 🔐 2FA, session manager, histórico automático
- 💬 Socket.io para notificações em tempo real
- 🌍 Worldbuilding: personagens, mundos, sistemas de magia

---

## 🔐 Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Node.js, Express, Sequelize ORM |
| **Database** | PostgreSQL 12+ |
| **Frontend** | React 18, Vite, Zustand, Tailwind CSS |
| **Real-time** | Socket.io |
| **Auth** | JWT (Bearer tokens) + OAuth Google |
| **Upload** | Multer com validação de tipos |

---

## 📚 Variáveis de Ambiente

Copie `.env.example` para `.env` em ambas as pastas:

```bash
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/mnstudio
JWT_SECRET=seu_super_secreto_aqui
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
# ... mais variáveis em backend/.env.example
```

```bash
# Frontend
VITE_API_URL=http://localhost:5000/api
# ... mais em frontend/.env.example
```

Veja [docs/SETUP.md](./docs/SETUP.md) para documentação completa.

---

## 🤝 Contribuindo

1. Crie branch: `git checkout -b feature/sua-feature`
2. Commit: `git commit -m 'Adiciona feature X'`
3. Push: `git push origin feature/sua-feature`
4. Abra Pull Request

---

## 📞 Suporte

Para dúvidas sobre setup, veja [docs/SETUP.md#troubleshooting](./docs/SETUP.md).
Para entender a arquitetura, consulte [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

**Última atualização:** 1º de fevereiro de 2026
