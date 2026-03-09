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
