# 🔧 Setup - Guia Completo

## Pré-requisitos

- **Node.js** 18+ ([download](https://nodejs.org))
- **PostgreSQL** 12+ ([download](https://www.postgresql.org/download))
- **Git** ([download](https://git-scm.com))
- **npm** ou **yarn** (incluído no Node.js)

### Verificar instalação
```bash
node --version      # v18.0.0 ou superior
npm --version       # 8.0.0 ou superior
psql --version      # 12 ou superior
```

---

## 1️⃣ Clone e Dependências

```bash
# Clone o repositório
git clone <repo-url> c:\MNStudio
cd c:\MNStudio

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 2️⃣ Variáveis de Ambiente

### Backend

```bash
cd backend
cp .env.example .env
```

Edite `backend/.env`:
```env
# ===== BANCO DE DADOS =====
DATABASE_URL=postgresql://postgres:sua-senha@localhost:5432/mnstudio
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=mnstudio
DATABASE_USER=postgres
DATABASE_PASSWORD=sua-senha

# ===== SERVER =====
PORT=5000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-super-segura-minimo-32-caracteres

# ===== FRONTEND URL =====
FRONTEND_URL=http://localhost:5173

# ===== GOOGLE OAUTH (Opcional) =====
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret

# ===== EMAIL (Opcional) =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
SMTP_FROM=noreply@mnstudio.com

# ===== IA (Opcional) =====
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo

# ===== OUTROS =====
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

### Frontend

```bash
cd frontend
cp .env.example .env
```

Edite `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MN Studio
VITE_APP_VERSION=1.0.0
```

---

## 3️⃣ Banco de Dados

### Criar banco de dados PostgreSQL

```bash
# Via psql
psql -U postgres

# Dentro do psql:
CREATE DATABASE mnstudio;
\q
```

### Sincronizar schema

```bash
cd backend

# Criar tabelas (se não usar migrations)
npm run db:setup

# Ou, se usar migrations Sequelize:
npx sequelize-cli db:migrate

# Popular com dados iniciais (seed)
npm run db:seed
```

**Resultado esperado:**
```
✅ Modelos sincronizados
✅ Dados seed inseridos
```

---

## 4️⃣ Inicie os Servidores

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Você deve ver:
```
✅ Banco conectado
🚀 Servidor rodando na porta 5000
```

**Teste:** http://localhost:5000 (deve retornar JSON)

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Você deve ver:
```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Press h to show help
```

**Teste:** Abra http://localhost:5173 no navegador

---

## ✅ Checklist de Inicialização

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL rodando
- [ ] `backend/.env` configurado
- [ ] `frontend/.env` configurado
- [ ] Banco `mnstudio` criado
- [ ] `npm install` executado (backend + frontend)
- [ ] Backend rodando em http://localhost:5000
- [ ] Frontend rodando em http://localhost:5173
- [ ] Consegue fazer login

---

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED" ao conectar no banco

**Causa:** PostgreSQL não está rodando

**Solução:**
```bash
# Windows (Services)
# Abra Services (services.msc) e procure por PostgreSQL, clique "Start"

# Ou via terminal
# Verificar status
psql -U postgres -c "SELECT version();"
```

### Erro: "Port 5000 already in use"

**Causa:** Outro processo usando porta 5000

**Solução:**
```bash
# Matear processo na porta 5000
# Windows (PowerShell):
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Ou mudar porta no .env
PORT=5001
```

### Erro: "JWT_SECRET is missing"

**Causa:** Variável de ambiente não carregada

**Solução:**
```bash
# Confirme que .env existe e tem JWT_SECRET
cat backend/.env | grep JWT_SECRET

# Reinicie o servidor após editar .env
```

### Erro: "No such table: users"

**Causa:** Tabelas não foram criadas

**Solução:**
```bash
cd backend
npm run db:setup
npm run db:seed
npm run dev
```

### Erro: "CORS" ao fazer requisições do frontend

**Causa:** Backend não configurado para aceitar origin do frontend

**Solução:** Confirme no `backend/.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

---

## 📦 Scripts Disponíveis

### Backend
```bash
npm run dev                 # Dev com nodemon + watch
npm run build               # Build para produção
npm run start               # Rodar produção
npm run db:setup            # Criar schema + seed
npm run db:migrate          # Executar migrations
npm run db:rollback         # Reverter última migration
npm run create-admin        # Criar usuário admin
npm run sync-db             # Sincronizar dados
```

### Frontend
```bash
npm run dev                 # Dev server (Vite)
npm run build               # Build para produção
npm run preview             # Preview do build
npm run type-check          # Verificar JSDoc
```

---

## 🚀 Próximas Passos

1. **Criar usuário admin:**
   ```bash
   cd backend
   npm run create-admin
   ```

2. **Acessar painel admin:** http://localhost:5173/admin

3. **Criar primeiro mangá/novel** via admin

4. **Explorar funcionalidades:**
   - Upload de capas
   - Publicação de capítulos
   - Teste de leitura
   - Perfil do usuário

---

## 📞 Precisa de ajuda?

- Verifique `docs/ARCHITECTURE.md` para entender a estrutura
- Consulte logs do backend/frontend
- Abra uma issue no repositório

---

**Última atualização:** 1º de fevereiro de 2026
