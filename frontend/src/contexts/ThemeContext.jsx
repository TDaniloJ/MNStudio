import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

/**
 * Resolve qual classe aplicar ao <html> com base na preferência escolhida.
 * 'system' observa a mídia do SO.
 */
function resolveAppliedTheme(preference) {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
}

export const ThemeProvider = ({ children }) => {
  // 'light' | 'dark' | 'system'
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  // Aplica a classe dark ao <html> e persiste no localStorage
  useEffect(() => {
    const apply = () => {
      const applied = resolveAppliedTheme(theme);
      document.documentElement.classList.toggle('dark', applied === 'dark');
    };

    apply();
    localStorage.setItem('theme', theme);

    // Observa mudança no SO apenas quando o modo é 'system'
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  const setTheme = (value) => {
    if (['light', 'dark', 'system'].includes(value)) setThemeState(value);
  };

  // Mantém toggleTheme para o ThemeToggle do Navbar (alterna entre light/dark)
  const toggleTheme = () =>
    setTheme(resolveAppliedTheme(theme) === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
