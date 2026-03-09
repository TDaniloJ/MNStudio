/**
 * Inicializa Google Analytics se ID estiver configurado
 */

export const initializeAnalytics = () => {
  const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

  if (!gaId) {
    if (import.meta.env.DEV) {
      console.log('📊 Google Analytics não configurado (VITE_GOOGLE_ANALYTICS_ID vazio)');
    }
    return;
  }

  try {
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

    if (import.meta.env.DEV) {
      console.log(`📊 Google Analytics inicializado com ID: ${gaId}`);
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Google Analytics:', error);
  }
};

/**
 * Rastreia page view
 * @param {string} path - Caminho da página
 * @param {string} title - Título da página
 */
export const trackPageView = (path, title) => {
  if (window.gtag) {
    window.gtag('pageview', {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Rastreia evento personalizado
 * @param {string} eventName - Nome do evento
 * @param {object} eventParams - Parâmetros do evento
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};
