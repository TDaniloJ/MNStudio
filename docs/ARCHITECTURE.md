# 🏗️ Arquitetura - Visão Técnica

## Visão Geral

MN Studio é uma aplicação **full-stack** com separação clara entre frontend (React/Vite) e backend (Node/Express/Sequelize).

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                  │
│  localhost:5173 | Vite | Zustand | Tailwind CSS    │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/WebSocket (Axios + Socket.io)
                     │
┌────────────────────▼────────────────────────────────┐
│                   BACKEND (Express)                 │
│  localhost:5000 | Node 18+ | Sequelize | PostgreSQL│
└─────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura Backend

```
backend/
├── src/
│   ├── controllers/         # Lógica de requisições HTTP
│   │   ├── authController.js
│   │   ├── mangaController.js
│   │   ├── novelController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── badgeController.js
│   │   ├── coinController.js
│   │   ├── activityController.js
│   │   └── ...
│   │
│   ├── routes/              # Definição de endpoints
│   │   ├── authRoutes.js
│   │   ├── mangaRoutes.js
│   │   ├── novelRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── badgeRoutes.js
│   │   ├── coinRoutes.js
│   │   └── ...
│   │
│   ├── models/              # Modelos Sequelize (DB schema)
│   │   ├── User.js
│   │   ├── Manga.js
│   │   ├── MangaChapter.js
│   │   ├── Novel.js
│   │   ├── NovelChapter.js
│   │   ├── Badge.js
│   │   ├── Activity.js
│   │   └── ...
│   │
│   ├── middlewares/         # Interceptadores de requisições
│   │   ├── auth.js          # Verificar JWT
│   │   ├── upload.js        # Multer para arquivo
│   │   ├── errorHandler.js  # Tratamento de erros (AppError)
│   │   ├── optionalAuth.js  # Auth opcional
│   │   └── sessionTracker.js
│   │
│   ├── services/            # Lógica de negócio
│   │   ├── emailService.js
│   │   ├── aiService.js
│   │   └── ...
│   │
│   ├── config/              # Configurações
│   │   ├── database.js
│   │   ├── db.js
│   │   ├── aiProviders.js
│   │   └── ...
│   │
│   ├── utils/               # Utilitários
│   │   ├── AppError.js      # Classe de erros padronizados
│   │   ├── logger.js        # Logging estruturado
│   │   ├── catchAsync.js    # Wrapper para async handlers
│   │   └── ...
│   │
│   ├── __tests__/           # Testes unitários
│   │   ├── AppError.test.js
│   │   └── ...
│   │
│   ├── server.js            # Entrada principal
│   └── socket.js            # WebSocket (Socket.io)
│
├── migrations/              # Migrações Sequelize
│   └── 20260103120000-add-google-sub.js
│
├── logs/                    # Logs estruturados (auto-gerado)
│   ├── info.log
│   ├── error.log
│   ├── warn.log
│   └── debug.log
│
├── REFACTORING_GUIDE.md              # Como refatorar controllers
├── ERROR_HANDLING_CHECKLIST.md       # Checklist de implementação
├── BEST_PRACTICES.md                 # Boas práticas de erro handling
└── ERROR_HANDLING_SUMMARY.md         # Resumo executivo
```
├── uploads/                 # Arquivos de upload
│   ├── avatars/
│   ├── manga/
│   ├── novel/
│   └── ...
│
├── package.json
└── .env.example
```

---

## 📁 Estrutura Frontend

```
frontend/
├── src/
│   ├── pages/               # Páginas (rotas)
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   ├── MangaList.jsx
│   │   ├── MangaDetail.jsx
│   │   ├── MangaReader.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── MangaManagement.jsx
│   │   │   └── ...
│   │   └── ...
│   │
│   ├── components/          # Componentes reutilizáveis
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Input.jsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   └── Footer.jsx
│   │   └── ...
│   │
│   ├── services/            # API clients
│   │   ├── api.js           # Axios instance
│   │   ├── authService.js
│   │   ├── mangaService.js
│   │   ├── userService.js
│   │   ├── coinService.js
│   │   ├── activityService.js
│   │   └── ...
│   │
│   ├── store/               # Zustand (estado global)
│   │   ├── authStore.js     # Estado de autenticação
│   │   ├── settingsStore.js
│   │   └── ...
│   │
│   ├── contexts/            # React Contexts
│   │   ├── CoinContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── NotificationProvider.jsx
│   │
│   ├── hooks/               # Custom React Hooks
│   │   ├── useDebounce.js
│   │   ├── usePagination.js
│   │   └── ...
│   │
│   ├── utils/               # Utilitários
│   │   ├── formatters.js    # getImageUrl, formatDate, etc
│   │   ├── constants.js
│   │   └── ...
│   │
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css
│
├── public/                  # Assets estáticos
│   └── images/
│
├── package.json
└── .env.example
```

---

## 🔄 Fluxo de Dados

### Autenticação (Login)

```
Frontend (Login.jsx)
  ↓
authService.login(email, password)
  ↓
Axios: POST /api/auth/login
  ↓
Backend: authController.login
  ↓
Validar credenciais, gerar JWT
  ↓
Response: { user, token }
  ↓
Frontend: localStorage.setItem('token', token)
           updateUser(user) [Zustand]
  ↓
Redirect to /
```

### Ler um Capítulo de Manga

```
Frontend: MangaReader.jsx
  ↓
Fazer fetch de pages via mangaService.getChapterPages(mangaId, chapterId)
  ↓
Backend: mangaChapterController.getPages
  ↓
Query: SELECT * FROM MangaPage WHERE chapter_id = ...
  ↓
Response: { pages: [...], ... }
  ↓
Frontend: Renderizar leitor com imagens
  ↓
Socket.io: Emit 'activity:log' → registrar atividade
  ↓
Backend: Activity criada no banco
```

### Upload de Avatar

```
Frontend: Profile.jsx
  ↓
Form: <input type="file">
  ↓
authService.updateProfile(formData)
  ↓
Axios: PUT /api/auth/profile (FormData com arquivo)
  ↓
Backend: Multer intercepta, salva em /uploads/avatars
  ↓
authController.updateProfile atualiza User.avatar_url
  ↓
Response: { user: { ..., avatar_url: '/uploads/avatars/...' } }
  ↓
Frontend: updateUser(user) [Zustand]
           Navbar renderiza nova foto
```

---

## �️ Error Handling & Logging

### Arquitetura de Erros

```
Controller throw AppError
        ↓
    catchAsync (wrapper)
        ↓
Middleware errorHandler
        ↓
    JSON Response (padronizado)
```

### Classe AppError
Todos os erros da aplicação usam `AppError`:

```javascript
throw new AppError(
  'Email já cadastrado',
  409,
  'DUPLICATE_EMAIL',
  { field: 'email' }
);
```

**Resposta HTTP:**
```json
{
  "error": {
    "message": "Email já cadastrado",
    "code": "DUPLICATE_EMAIL",
    "statusCode": 409,
    "details": { "field": "email" },
    "timestamp": "2026-02-01T10:30:00.000Z"
  }
}
```

### Padrão de Controller
```javascript
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getUser = catchAsync(async (req, res, next) => {
  // ✅ Sem try-catch - catchAsync trata erros
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404, 'NOT_FOUND');
  }
  res.json(user);
});
```

### Logging Estruturado
Todos os erros e eventos importantes são logados em JSON:

```javascript
logger.info('Login realizado', {
  userId: user.id,
  email: user.email,
  timestamp: new Date()
});

logger.error('Falha no upload', {
  fileName: req.file.name,
  error: error.message,
  userId: req.user.id
});
```

**Arquivos de Log:**
- `logs/info.log` - Eventos normais (login, criação, etc)
- `logs/error.log` - Erros da aplicação
- `logs/warn.log` - Situações anormais
- `logs/debug.log` - Info para debug (desenvolvimento)

### Códigos de Erro Padrão
| Código | HTTP | Significado |
|--------|------|-------------|
| `VALIDATION_ERROR` | 400 | Dados inválidos |
| `INVALID_CREDENTIALS` | 401 | Email/senha inválida |
| `INVALID_TOKEN` | 401 | JWT inválido |
| `EXPIRED_TOKEN` | 401 | JWT expirado |
| `FORBIDDEN` | 403 | Sem permissão |
| `NOT_FOUND` | 404 | Recurso não existe |
| `DUPLICATE_EMAIL` | 409 | Email duplicado |
| `DUPLICATE_USERNAME` | 409 | Username duplicado |
| `INTERNAL_SERVER_ERROR` | 500 | Bug no código |

---

## 🔐 Autenticação & Autorização

### JWT Flow
1. **Login:** Cliente envia email/senha
2. **Backend:** Valida, gera JWT (exp: 7 dias)
3. **Token:** Retorna ao cliente, armazenado em `localStorage`
4. **Requisições:** Token enviado no header `Authorization: Bearer <token>`
5. **Middleware `auth`:** Valida JWT, extrai `userId`
6. **Controller:** Usa `req.userId` para identificar usuário

### Roles & Permissões
- **reader** - Usuário padrão (leitura)
- **uploader** - Pode criar/editar mangás e novels
- **admin** - Acesso total (gerenciar usuários, etc)

**Middleware `isAdmin`:**
```javascript
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw new AppError('Acesso negado', 403, 'FORBIDDEN');
  }
  next();
};
```

---

## 📡 WebSocket (Socket.io)

### Eventos

**Cliente → Servidor:**
- `join:user` - Entrar na sala do usuário
- `join:admin` - Entrar na sala de admins
- `activity:log` - Registrar atividade (leitura)

**Servidor → Cliente:**
- `notification:new` - Nova notificação
- `activity:recorded` - Atividade registrada

---

## 🗄️ Banco de Dados

### Principais Tabelas

**Users**
- id, username, email, password_hash, avatar_url, banner_url, bio, role, status, created_at

**Mangas**
- id, title, description, cover_image, status, created_by, updated_at

**MangaChapters**
- id, manga_id, number, title, content, published_at

**MangaPages**
- id, chapter_id, page_number, image_url

**Novels**
- id (similar a Mangas)

**NovelChapters**
- id (similar a MangaChapters)

**Badges**
- id, name, description, icon_url, rarity, condition_type

**UserBadges**
- user_id, badge_id, created_at (junção)

**Activity**
- id, user_id, type, description, related_id, related_type, created_at

**Coins** / **CoinTransactions**
- Gerenciar moeda in-game

---

## 🔌 Endpoints Principais

### Auth
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Logar
- `GET /api/auth/me` - Dados do usuário logado
- `PUT /api/auth/profile` - Atualizar perfil
- `POST /api/auth/2fa/setup` - Configurar 2FA

### Mangás
- `GET /api/mangas` - Listar mangás
- `GET /api/mangas/:id` - Detalhes
- `POST /api/mangas` - Criar (uploader/admin)
- `GET /api/mangas/:id/chapters/:chapterId/pages` - Páginas do capítulo

### Novels
- Similar ao Mangás

### Admin
- `GET /api/admin/users` - Listar usuários
- `GET /api/admin/users/stats` - Estatísticas
- `PUT /api/admin/users/:id` - Atualizar usuário
- `DELETE /api/admin/users/:id` - Deletar usuário

### Badges
- `GET /api/badges` - Listar badges
- `GET /api/badges/user/:userId` - Badges do usuário

### Coins
- `GET /api/coins/balance` - Saldo do usuário
- `POST /api/coins/purchase` - Comprar coins

---

## 🚀 Deployment

### Backend (Produção)
1. Usar variáveis de ambiente (não hardcode)
2. `NODE_ENV=production`
3. Usar banco de dados remoto (AWS RDS, Heroku, etc)
4. Fazer build: `npm run build`
5. Iniciar: `npm run start`
6. Considerar Docker ou plataforma como Heroku/Railway

### Frontend (Produção)
1. Build: `npm run build` → pasta `dist/`
2. Servir com um servidor HTTP (Nginx, Vercel, Netlify)
3. Variáveis de ambiente apontando para API remota

---

## 📚 Padrões e Convenções

- **Controllers:** Lidam com HTTP (req/res)
- **Services:** Lógica de negócio, reutilizável
- **Models:** Schema do banco (Sequelize)
- **Routes:** Mapeiam URLs aos controllers
- **Middlewares:** Interceptadores (auth, validation, error)

---

## 🔗 Referências

- [Express.js Docs](https://expressjs.com)
- [Sequelize Docs](https://sequelize.org)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

**Última atualização:** 1º de fevereiro de 2026
