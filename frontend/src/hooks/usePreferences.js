import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const DEFAULT_PREFERENCES = {
  email_notifications: true,
  push_notifications: false,
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  theme: 'system',
};

const PUSH_LS_KEY = 'pref_push_notifications';
const LANG_LS_KEY = 'pref_language';
const TZ_LS_KEY   = 'pref_timezone';

/**
 * Hook de preferências totalmente funcional:
 *
 * - Tema     → lido/escrito pelo ThemeContext (localStorage 'theme')
 * - Idioma   → persistido em localStorage imediatamente + define lang no <html>
 * - Fuso     → persistido em localStorage imediatamente
 * - Push     → solicita permissão real ao navegador; persiste resultado
 * - Email    → sincronizado com a API do backend
 *
 * Ao chamar fetch(), mescla dados do backend com valores locais,
 * dando prioridade ao servidor (exceto tema, que vem sempre do ThemeContext).
 */
export function usePreferences() {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const [preferences, setPreferences] = useState(() => ({
    ...DEFAULT_PREFERENCES,
    theme,
    language:           localStorage.getItem(LANG_LS_KEY) ?? DEFAULT_PREFERENCES.language,
    timezone:           localStorage.getItem(TZ_LS_KEY)   ?? DEFAULT_PREFERENCES.timezone,
    push_notifications: localStorage.getItem(PUSH_LS_KEY) === 'true',
  }));

  // Mantém campo 'theme' sincronizado com o ThemeContext
  useEffect(() => {
    setPreferences((prev) => ({ ...prev, theme }));
  }, [theme]);

  /* ── Buscar preferências do servidor ─────────────────────────── */

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authService.getPreferences();
      const server = response.preferences ?? {};

      setPreferences((prev) => ({
        ...prev,
        email_notifications: server.email_notifications ?? prev.email_notifications,
        language: server.language ?? prev.language,
        timezone: server.timezone ?? prev.timezone,
        // Tema sempre vem do ThemeContext, nunca do servidor
        theme,
      }));

      if (server.language) localStorage.setItem(LANG_LS_KEY, server.language);
      if (server.timezone) localStorage.setItem(TZ_LS_KEY,   server.timezone);
    } catch {
      console.error('Erro ao carregar preferências');
    } finally {
      setLoading(false);
    }
  }, [theme]);

  /* ── Aplicar idioma ──────────────────────────────────────────── */

  const applyLanguage = (lang) => {
    localStorage.setItem(LANG_LS_KEY, lang);
    document.documentElement.setAttribute('lang', lang.split('-')[0]);
    // Se usar i18next: i18n.changeLanguage(lang)
  };

  /* ── Aplicar fuso horário ────────────────────────────────────── */

  const applyTimezone = (tz) => {
    localStorage.setItem(TZ_LS_KEY, tz);
    // Disponível globalmente via: new Intl.DateTimeFormat('pt-BR', { timeZone: tz })
  };

  /* ── Permissão de Push ───────────────────────────────────────── */

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações push');
      return false;
    }
    if (Notification.permission === 'denied') {
      toast.error('Notificações bloqueadas. Habilite nas configurações do navegador.');
      return false;
    }
    if (Notification.permission === 'granted') return true;

    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  /* ── Atualizar uma ou mais preferências ──────────────────────── */

  const update = async (newPreferences) => {
    const prev = preferences;
    setPreferences(newPreferences); // atualização otimista

    const changed = (key) => newPreferences[key] !== prev[key];

    try {
      if (changed('theme')) {
        setTheme(newPreferences.theme);
      }

      if (changed('language')) {
        applyLanguage(newPreferences.language);
      }

      if (changed('timezone')) {
        applyTimezone(newPreferences.timezone);
      }

      if (changed('push_notifications')) {
        if (newPreferences.push_notifications) {
          const granted = await requestPushPermission();
          if (!granted) {
            setPreferences((p) => ({ ...p, push_notifications: false }));
            localStorage.setItem(PUSH_LS_KEY, 'false');
            return;
          }
        }
        localStorage.setItem(PUSH_LS_KEY, String(newPreferences.push_notifications));
      }

      // Envia ao backend apenas campos que o servidor precisa saber
      await authService.updatePreferences({
        email_notifications: newPreferences.email_notifications,
        language:            newPreferences.language,
        timezone:            newPreferences.timezone,
      });

      toast.success('Preferências atualizadas!');
    } catch {
      setPreferences(prev); // reverte em caso de erro
      toast.error('Erro ao salvar preferências. Tente novamente.');
    }
  };

  return { preferences, loading, fetch, update };
}
