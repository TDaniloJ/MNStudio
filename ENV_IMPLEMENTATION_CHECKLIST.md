# 📋 Checklist de Implementação de Variáveis de Ambiente

## 🔴 FRONTEND - Variáveis Não Implementadas

### 1. Feature Flags (VITE_ENABLE_*)
**Status:** Definidas no `.env` mas NÃO usadas no código
**Variáveis:**
- `VITE_ENABLE_2FA` - Autenticação de dois fatores
- `VITE_ENABLE_COINS` - Sistema de moedas
- `VITE_ENABLE_BADGES` - Sistema de badges
- `VITE_ENABLE_WORLDBUILDING` - Worldbuilding features
- `VITE_ENABLE_AI_FEATURES` - Funcionalidades de IA

**Onde implementar:**
- [ ] `src/hooks/useFeatures.js` (novo arquivo com hook para acessar features)
- [ ] `src/components/` - Envolver componentes com condicionals
- [ ] `src/pages/` - Envolver páginas com feature flags
- [ ] `src/App.jsx` - Remover/ocultar rotas baseado em flags

**Exemplo de implementação:**
```javascript
// src/hooks/useFeatures.js
export const useFeatures = () => ({
  enable2FA: import.meta.env.VITE_ENABLE_2FA === 'true',
  enableCoins: import.meta.env.VITE_ENABLE_COINS === 'true',
  enableBadges: import.meta.env.VITE_ENABLE_BADGES === 'true',
  enableWorldbuilding: import.meta.env.VITE_ENABLE_WORLDBUILDING === 'true',
  enableAIFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
});

// Uso em componentes:
const { enableCoins } = useFeatures();
if (enableCoins) return <CoinsComponent />;
```

---

### 2. App Info
**Status:** Definidas no `.env` mas NÃO usadas
**Variáveis:**
- `VITE_APP_NAME` = "MN Studio"
- `VITE_APP_VERSION` = "1.0.0"

**Onde implementar:**
- [ ] `src/components/layout/Footer.jsx` - Usar `VITE_APP_NAME` e `VITE_APP_VERSION`
- [ ] `index.html` - `<title>`
- [ ] Criar arquivo `src/config/app.js` com constantes

---

### 3. Analytics
**Status:** Definida no `.env` (`VITE_GOOGLE_ANALYTICS_ID`) mas NÃO implementada
**Onde implementar:**
- [ ] `src/main.jsx` - Carregar Google Analytics se ID estiver definido
- [ ] `src/hooks/usePageView.js` - Hook para rastrear page views

**Exemplo:**
```javascript
if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
  // Load Google Analytics script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GOOGLE_ANALYTICS_ID}`;
  document.head.appendChild(script);
}
```

---

### 4. Links Úteis
**Status:** Definidos no `.env` mas NÃO usados
**Variáveis:**
- `VITE_PRIVACY_URL` = "/privacy"
- `VITE_TERMS_URL` = "/terms"
- `VITE_CONTACT_EMAIL` = "contato@mnstudio.com"

**Onde implementar:**
- [ ] `src/components/layout/Footer.jsx` - Links para Privacy, Terms
- [ ] `src/components/layout/Navbar.jsx` ou componente de contato - Email de contato
- [ ] `src/pages/Contact.jsx` - Pré-popular email

---

### 5. Theme
**Status:** Definido no `.env` (`VITE_DEFAULT_THEME="auto"`) mas NÃO usado
**Onde implementar:**
- [ ] `src/contexts/ThemeContext.jsx` - Usar valor default do `.env`
- [ ] Inicializar tema baseado em `VITE_DEFAULT_THEME`

---

### 6. Pagination
**Status:** Definido no `.env` (`VITE_DEFAULT_LIMIT=20`) mas NÃO usado
**Onde implementar:**
- [ ] `src/config/constants.js` - Exportar const `DEFAULT_LIMIT`
- [ ] `src/hooks/usePagination.js` - Usar default do `.env`
- [ ] `src/pages/` - Usar em todos os componentes com paginação

---

## 🔴 BACKEND - Variáveis Não Implementadas

### 1. CORS_ORIGIN
**Status:** Definido no `.env.example` mas NÃO configurado
**Localização:** `backend/src/server.js` linha 49
**Alteração necessária:**
```javascript
// Antes:
app.use(cors());

// Depois:
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

---

### 2. LOG_LEVEL
**Status:** Definido no `.env.example` mas NÃO usado no logger
**Localização:** `backend/src/utils/logger.js`
**Alteração necessária:**
```javascript
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.logLevel = this.getLevelValue(process.env.LOG_LEVEL || 'info');
    this.currentLevel = this.getLevelValue(process.env.LOG_LEVEL || 'info');
    this.ensureLogDir();
  }
  
  getLevelValue(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level.toLowerCase()] || 1;
  }
  
  shouldLog(level) {
    return this.getLevelValue(level) >= this.currentLevel;
  }
  
  info(message, meta) {
    if (this.shouldLog('info')) {
      // log...
    }
  }
}
```

---

### 3. API_BASE_URL
**Status:** Definido no `.env.example` mas NÃO usado
**Onde usar:**
- [ ] `backend/src/utils/emailService.js` - Links em emails
- [ ] `backend/src/controllers/authController.js` - Links de verificação de email
- [ ] `backend/src/config/` - Criar arquivo com configs

**Exemplo:**
```javascript
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const verificationLink = `${API_BASE_URL}/verify-email?token=${token}`;
```

---

### 4. GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET
**Status:** Definidos no `.env.example` mas talvez NÃO completamente implementados
**Localização:** `backend/src/controllers/authController.js` (linhas 678)
**Verificar se:**
- [ ] Validação de `GOOGLE_CLIENT_ID` está feita corretamente
- [ ] `GOOGLE_CLIENT_SECRET` é usado (se necesário)

---

### 5. UPLOAD_PATH
**Status:** Definido no `.env` mas hardcoded em alguns locais
**Localização:** 
- `backend/src/server.js` linha 56 - hardcoded `'./uploads'`
- `backend/src/middlewares/upload.js` - verificar se usa variável
**Alteração necessária:**
```javascript
// Antes:
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Depois:
const uploadPath = process.env.UPLOAD_PATH || './uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadPath)));
```

---

### 6. Settings Seed com Variáveis de Ambiente
**Status:** `seedSettings.js` tem valores hardcoded
**Localização:** `backend/src/utils/seedSettings.js`
**Melhorias:**
```javascript
const defaultSettings = [
  { 
    key: 'site_name', 
    value: process.env.VITE_APP_NAME || 'MN Studio',
    // ...
  },
  { 
    key: 'google_analytics', 
    value: process.env.VITE_GOOGLE_ANALYTICS_ID || '',
    // ...
  },
  { 
    key: 'contact_email', 
    value: process.env.VITE_CONTACT_EMAIL || '',
    // ...
  },
];
```

---

## ✅ Variáveis JÁ Implementadas

### Frontend
- ✅ `VITE_API_URL` - Usado em `socket.js` e `api.js`
- ✅ `VITE_GOOGLE_CLIENT_ID` - Usado em `Login.jsx`
- ✅ `VITE_READER_*_IMAGE` - Usado em `MangaReader.jsx`

### Backend
- ✅ `PORT` - Usado em `server.js`
- ✅ `NODE_ENV` - Usado em múltiplos arquivos
- ✅ `DB_*` - Usado em `config/db.js`, `config/database.js`, `sync-database.js`
- ✅ `JWT_*` - Usado em `authController.js`, `auth.js`, etc
- ✅ `FRONTEND_URL` - Usado em `authController.js`
- ✅ `SMTP_*` - Usado em `emailService.js`
- ✅ `*_API_KEY` (AI) - Usado em `aiService.js`

---

## 📊 Resumo de Ações

| Prioridade | Item | Status | Esforço |
|-----------|------|--------|---------|
| 🔴 Alta | Feature Flags (Frontend) | ❌ Não implementado | Médio |
| 🟡 Média | Analytics (Frontend) | ❌ Não implementado | Baixo |
| 🟡 Média | App Links (Frontend) | ❌ Não implementado | Baixo |
| 🔴 Alta | CORS (Backend) | ❌ Não implementado | Baixo |
| 🟡 Média | LOG_LEVEL (Backend) | ❌ Não implementado | Médio |
| 🟡 Média | API_BASE_URL (Backend) | ❌ Não implementado | Baixo |
| 🟢 Baixa | UPLOAD_PATH (Backend) | ⚠️ Parcial | Baixo |

