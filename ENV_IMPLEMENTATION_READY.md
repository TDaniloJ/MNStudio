# 🛠️ Arquivos de Implementação Prontos para Usar

## 1. Frontend - Hook para Features (CRIAR)

**Arquivo:** `frontend/src/hooks/useFeatures.js`

```javascript
/**
 * Hook para acessar feature flags de forma centralizada
 * Lê as variáveis de ambiente VITE_ENABLE_*
 */

export const useFeatures = () => {
  const features = {
    enable2FA: import.meta.env.VITE_ENABLE_2FA === 'true',
    enableCoins: import.meta.env.VITE_ENABLE_COINS === 'true',
    enableBadges: import.meta.env.VITE_ENABLE_BADGES === 'true',
    enableWorldbuilding: import.meta.env.VITE_ENABLE_WORLDBUILDING === 'true',
    enableAIFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
  };
  
  return features;
};

// Exportar também as infos da app
export const useAppInfo = () => ({
  appName: import.meta.env.VITE_APP_NAME || 'MN Studio',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'contact@mnstudio.com',
  privacyUrl: import.meta.env.VITE_PRIVACY_URL || '/privacy',
  termsUrl: import.meta.env.VITE_TERMS_URL || '/terms',
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  defaultTheme: import.meta.env.VITE_DEFAULT_THEME || 'auto',
  defaultLimit: parseInt(import.meta.env.VITE_DEFAULT_LIMIT || '20'),
});
```

---

## 2. Frontend - Config App (CRIAR)

**Arquivo:** `frontend/src/config/app.js`

```javascript
/**
 * Configurações globais da aplicação
 * Centraliza variáveis de ambiente e constantes
 */

export const APP_CONFIG = {
  // App Info
  name: import.meta.env.VITE_APP_NAME || 'MN Studio',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Features
  features: {
    twoFactor: import.meta.env.VITE_ENABLE_2FA === 'true',
    coins: import.meta.env.VITE_ENABLE_COINS === 'true',
    badges: import.meta.env.VITE_ENABLE_BADGES === 'true',
    worldbuilding: import.meta.env.VITE_ENABLE_WORLDBUILDING === 'true',
    aiFeatures: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
  },
  
  // Analytics
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
  
  // Links
  privacyUrl: import.meta.env.VITE_PRIVACY_URL || '/privacy',
  termsUrl: import.meta.env.VITE_TERMS_URL || '/terms',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'contact@mnstudio.com',
  
  // UI
  theme: import.meta.env.VITE_DEFAULT_THEME || 'auto',
  itemsPerPage: parseInt(import.meta.env.VITE_DEFAULT_LIMIT || '20'),
  
  // Images
  readerImages: {
    fallback: import.meta.env.VITE_READER_FALLBACK_IMAGE || '/images/reader/reader-page-error.png',
    loading: import.meta.env.VITE_READER_LOADING_IMAGE || '/images/reader/reader-loading.png',
    empty: import.meta.env.VITE_READER_EMPTY_IMAGE || '/images/reader/reader-empty.png',
    end: import.meta.env.VITE_READER_END_IMAGE || '/images/reader/reader-end.png',
  },
  
  // Utils
  isProduction: import.meta.env.MODE === 'production',
  isDevelopment: import.meta.env.MODE === 'development',
};

export default APP_CONFIG;
```

---

## 3. Frontend - Setup Google Analytics (CRIAR)

**Arquivo:** `frontend/src/utils/analytics.js`

```javascript
/**
 * Inicializa Google Analytics se ID estiver configurado
 */

export const initializeAnalytics = () => {
  const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
  
  if (!gaId) {
    console.log('Google Analytics não configurado');
    return;
  }
  
  // Carrega Google Analytics
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
  
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId);
};

export const trackPageView = (path, title) => {
  if (window.gtag) {
    window.gtag('pageview', {
      page_path: path,
      page_title: title,
    });
  }
};

export const trackEvent = (eventName, eventParams) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};
```

**Usar em `main.jsx`:**
```javascript
import { initializeAnalytics } from './utils/analytics';

initializeAnalytics();
```

---

## 4. Frontend - Atualizar Footer (IMPLEMENTAR)

**Arquivo:** `frontend/src/components/layout/Footer.jsx`

Adicionar ao footer:

```javascript
import { useAppInfo } from '../../hooks/useFeatures';

const Footer = () => {
  const appInfo = useAppInfo();
  
  return (
    <footer>
      {/* Existing footer content */}
      
      <div className="footer-links">
        <a href={appInfo.privacyUrl}>Privacidade</a>
        <a href={appInfo.termsUrl}>Termos de Serviço</a>
        <a href={`mailto:${appInfo.contactEmail}`}>Contato</a>
      </div>
      
      <div className="footer-info">
        <p>{appInfo.appName} v{appInfo.appVersion}</p>
        <p>&copy; 2025 {appInfo.appName}. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};
```

---

## 5. Backend - Config de CORS (ATUALIZAR)

**Arquivo:** `backend/src/server.js` (linha ~49)

```javascript
// Antes:
app.use(cors());

// Depois:
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

---

## 6. Backend - Melhorar Logger com LOG_LEVEL (ATUALIZAR)

**Arquivo:** `backend/src/utils/logger.js`

```javascript
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.logLevel = this.getLevelValue(process.env.LOG_LEVEL || 'info');
    this.ensureLogDir();
  }

  getLevelValue(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level?.toLowerCase()] || 1;
  }

  shouldLog(level) {
    return this.getLevelValue(level) >= this.logLevel;
  }

  formatLog(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      ...meta,
      env: process.env.NODE_ENV || 'development'
    });
  }

  debug(message, meta = {}) {
    if (!this.shouldLog('debug')) return;
    const formatted = this.formatLog('debug', message, meta);
    this.writeToFile('debug', formatted);
    if (process.env.NODE_ENV !== 'production') {
      console.debug('🔵', message, meta);
    }
  }

  info(message, meta = {}) {
    if (!this.shouldLog('info')) return;
    const formatted = this.formatLog('info', message, meta);
    this.writeToFile('info', formatted);
    console.log('ℹ️', message, meta);
  }

  warn(message, meta = {}) {
    if (!this.shouldLog('warn')) return;
    const formatted = this.formatLog('warn', message, meta);
    this.writeToFile('warn', formatted);
    console.warn('⚠️', message, meta);
  }

  error(message, meta = {}) {
    const formatted = this.formatLog('error', message, meta);
    this.writeToFile('error', formatted);
    console.error('❌', message, meta);
  }

  // ... resto do código
}
```

---

## 7. Backend - Config Base (CRIAR)

**Arquivo:** `backend/src/config/app.js`

```javascript
/**
 * Configurações globais do backend
 */

module.exports = {
  // Server
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Upload
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Google
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleSub: process.env.GOOGLE_SUB || '',
  
  // AI
  aiProviders: {
    openai: process.env.OPENAI_API_KEY || '',
    anthropic: process.env.ANTHROPIC_API_KEY || '',
    google: process.env.GOOGLE_API_KEY || '',
    groq: process.env.GROQ_API_KEY || '',
    deepseek: process.env.DEEPSEEK_API_KEY || '',
  },
  
  // Features
  features: {
    twoFactor: true,
    coins: true,
    badges: true,
    worldbuilding: true,
  }
};
```

---

## 8. Backend - Atualizar seedSettings (IMPLEMENTAR)

**Arquivo:** `backend/src/utils/seedSettings.js` (primeiras configurações)

```javascript
// Adicionar no início do arquivo:
require('dotenv').config();

const defaultSettings = [
  // Geral
  { 
    key: 'site_name', 
    value: process.env.VITE_APP_NAME || 'MN Studio', 
    type: 'text', 
    category: 'general', 
    description: 'Nome do site' 
  },
  { 
    key: 'contact_email', 
    value: process.env.VITE_CONTACT_EMAIL || '', 
    type: 'text', 
    category: 'email', 
    description: 'Email de contato' 
  },
  
  // SEO
  { 
    key: 'google_analytics', 
    value: process.env.VITE_GOOGLE_ANALYTICS_ID || '', 
    type: 'text', 
    category: 'seo', 
    description: 'ID do Google Analytics' 
  },
  
  // ... resto das settings
];
```

---

## 9. Backend - Usar API_BASE_URL em Emails (IMPLEMENTAR)

**Arquivo:** `backend/src/controllers/authController.js` (around line 245)

```javascript
// Antes:
// const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

// Depois:
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
// Ou se quiser usar a API:
const apiVerificationUrl = `${apiBaseUrl}/api/auth/verify-email?token=${verificationToken}`;
```

---

## 10. Frontend - Aplicar Feature Flags em Rotas (IMPLEMENTAR)

**Arquivo:** `frontend/src/App.jsx`

Exemplo de como usar feature flags:

```javascript
import { useFeatures } from './hooks/useFeatures';

const App = () => {
  const { enableCoins, enableBadges, enableWorldbuilding } = useFeatures();
  
  return (
    <Routes>
      {/* Always available */}
      <Route path="/" element={<Home />} />
      
      {/* Feature flagged */}
      {enableCoins && <Route path="/coins" element={<CoinsPage />} />}
      {enableBadges && <Route path="/badges" element={<BadgesPage />} />}
      {enableWorldbuilding && <Route path="/worldbuilding" element={<WorldbuildingPage />} />}
    </Routes>
  );
};
```

---

## 📝 Checklist de Implementação

- [ ] Criar `frontend/src/hooks/useFeatures.js`
- [ ] Criar `frontend/src/config/app.js`
- [ ] Criar `frontend/src/utils/analytics.js`
- [ ] Adicionar `initializeAnalytics()` em `frontend/src/main.jsx`
- [ ] Atualizar `frontend/src/components/layout/Footer.jsx`
- [ ] Atualizar `frontend/src/App.jsx` com feature flags
- [ ] Atualizar `backend/src/server.js` com CORS config
- [ ] Atualizar `backend/src/utils/logger.js` com LOG_LEVEL
- [ ] Criar `backend/src/config/app.js`
- [ ] Atualizar `backend/src/utils/seedSettings.js`
- [ ] Testar todas as variáveis de ambiente

