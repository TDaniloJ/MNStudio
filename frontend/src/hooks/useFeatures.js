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

/**
 * Hook para acessar informações da aplicação
 */
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
