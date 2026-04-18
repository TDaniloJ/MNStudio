import React from 'react';
import { Sun, Moon, Monitor, Bell, BellOff, Globe, Clock, Mail } from 'lucide-react';
import Card from '../common/Card';

/**
 * Aba de preferências totalmente funcional.
 *
 * Tema     → aplica via ThemeContext em tempo real (sem precisar salvar)
 * Push     → solicita permissão real do navegador
 * Idioma   → persiste em localStorage e define lang no <html>
 * Fuso     → persiste em localStorage para uso em Intl.DateTimeFormat
 * Email    → sincroniza com o backend
 */
const PreferencesTab = ({ preferences, onUpdate }) => {
  const set = (key, value) => onUpdate({ ...preferences, [key]: value });

  const pushStatus = typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'unsupported';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* ── Tema ────────────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tema</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          A mudança é aplicada imediatamente em toda a aplicação.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <ThemeOption
            value="light"
            current={preferences.theme}
            icon={<Sun className="w-5 h-5" />}
            label="Claro"
            onChange={(v) => set('theme', v)}
          />
          <ThemeOption
            value="dark"
            current={preferences.theme}
            icon={<Moon className="w-5 h-5" />}
            label="Escuro"
            onChange={(v) => set('theme', v)}
          />
          <ThemeOption
            value="system"
            current={preferences.theme}
            icon={<Monitor className="w-5 h-5" />}
            label="Sistema"
            onChange={(v) => set('theme', v)}
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
          {preferences.theme === 'system'
            ? 'Seguindo a preferência do sistema operacional'
            : preferences.theme === 'dark'
            ? 'Modo escuro ativado'
            : 'Modo claro ativado'}
        </p>
      </Card>

      {/* ── Notificações ────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notificações</h3>
        </div>
        <div className="space-y-5">
          <ToggleRow
            icon={<Mail className="w-4 h-4" />}
            label="Notificações por Email"
            description="Atualizações de capítulos, novidades e alertas importantes"
            checked={preferences.email_notifications}
            onChange={(v) => set('email_notifications', v)}
          />
          <div className="space-y-1">
            <ToggleRow
              icon={<Bell className="w-4 h-4" />}
              label="Notificações Push"
              description="Alertas em tempo real no navegador"
              checked={preferences.push_notifications}
              onChange={(v) => set('push_notifications', v)}
              disabled={pushStatus === 'unsupported'}
            />
            <PushStatusBadge status={pushStatus} enabled={preferences.push_notifications} />
          </div>
        </div>
      </Card>

      {/* ── Idioma ──────────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Idioma</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Define o idioma da interface. Salvo localmente e no servidor.
        </p>
        <SelectField
          label="Idioma da interface"
          value={preferences.language}
          onChange={(v) => set('language', v)}
          options={[
            { value: 'pt-BR', label: '🇧🇷  Português (Brasil)' },
            { value: 'en-US', label: '🇺🇸  English (US)' },
            { value: 'es-ES', label: '🇪🇸  Español' },
          ]}
        />
      </Card>

      {/* ── Fuso Horário ────────────────────────────────────────── */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fuso Horário</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Usado para exibir datas e horários corretamente em todo o app.
        </p>
        <SelectField
          label="Fuso horário"
          value={preferences.timezone}
          onChange={(v) => set('timezone', v)}
          options={[
            { value: 'America/Sao_Paulo',   label: '🇧🇷  Brasília (UTC-3)'  },
            { value: 'America/Manaus',      label: '🇧🇷  Manaus (UTC-4)'    },
            { value: 'America/Belem',       label: '🇧🇷  Belém (UTC-3)'     },
            { value: 'America/New_York',    label: '🇺🇸  New York (UTC-5)'  },
            { value: 'America/Los_Angeles', label: '🇺🇸  Los Angeles (UTC-8)'},
            { value: 'Europe/London',       label: '🇬🇧  London (UTC+0)'    },
            { value: 'Europe/Paris',        label: '🇫🇷  Paris (UTC+1)'     },
            { value: 'Asia/Tokyo',          label: '🇯🇵  Tokyo (UTC+9)'     },
          ]}
        />
        <LocalTimePreview timezone={preferences.timezone} />
      </Card>

    </div>
  );
};

/* ── Subcomponentes ──────────────────────────────────────────────── */

const ThemeOption = ({ value, current, icon, label, onChange }) => {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
        active
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      aria-pressed={active}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" aria-hidden="true" />
      )}
    </button>
  );
};

const ToggleRow = ({ icon, label, description, checked, onChange, disabled = false }) => (
  <div className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50' : ''}`}>
    <div className="flex items-start gap-3 min-w-0">
      <span className="mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(e) => !disabled && onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
    </label>
  </div>
);

const PushStatusBadge = ({ status, enabled }) => {
  if (status === 'unsupported') {
    return (
      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 ml-7">
        <BellOff className="w-3 h-3" />
        Navegador não suporta notificações push
      </p>
    );
  }
  if (status === 'denied') {
    return (
      <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 ml-7">
        <BellOff className="w-3 h-3" />
        Bloqueado pelo navegador — habilite nas configurações do site
      </p>
    );
  }
  if (status === 'granted' && enabled) {
    return (
      <p className="text-xs text-green-600 dark:text-green-400 ml-7">
        ✓ Permissão concedida
      </p>
    );
  }
  return null;
};

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

/**
 * Mostra a hora atual no fuso selecionado, atualizada a cada segundo.
 */
const LocalTimePreview = ({ timezone }) => {
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let formatted = '—';
  try {
    formatted = new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone,
      hour:     '2-digit',
      minute:   '2-digit',
      second:   '2-digit',
      weekday:  'short',
      day:      'numeric',
      month:    'short',
    }).format(now);
  } catch {
    formatted = 'Fuso inválido';
  }

  return (
    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
      <Clock className="w-3 h-3 flex-shrink-0" />
      Agora nesse fuso:{' '}
      <span className="font-mono text-gray-700 dark:text-gray-300 ml-1">{formatted}</span>
    </p>
  );
};

export default PreferencesTab;
