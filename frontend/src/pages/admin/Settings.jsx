import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon, Globe, Palette, ToggleLeft,
  Search as SearchIcon, Mail, Share2, Code, Save, RotateCcw, Upload, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettingsStore } from '../../store/settingsStore';
import { settingsService } from '../../services/settingsService';
import { getImageUrl } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const CATEGORIES = [
  { id: 'general',    label: 'Geral',            icon: Globe        },
  { id: 'appearance', label: 'Aparência',         icon: Palette      },
  { id: 'features',   label: 'Funcionalidades',   icon: ToggleLeft   },
  { id: 'seo',        label: 'SEO',               icon: SearchIcon   },
  { id: 'social',     label: 'Redes Sociais',     icon: Share2       },
  { id: 'email',      label: 'Email',             icon: Mail         },
  { id: 'footer',     label: 'Rodapé',            icon: Code         },
  { id: 'advanced',   label: 'Avançado',          icon: SettingsIcon },
];

const Settings = () => {
  const { settings, loading, loadSettings, resetToDefaults } = useSettingsStore();
  const [activeCategory, setActiveCategory] = useState('general');
  const [localSettings,  setLocalSettings]  = useState({});
  const [saving,         setSaving]         = useState(false);
  const [imageFiles,     setImageFiles]     = useState({});
  const [imagePreviews,  setImagePreviews]  = useState({});
  const [hasChanges,     setHasChanges]     = useState(false);

  useEffect(() => { loadSettings(); }, []);

  useEffect(() => {
    if (settings[activeCategory]) {
      setLocalSettings((p) => ({ ...p, [activeCategory]: { ...settings[activeCategory] } }));
    }
  }, [settings, activeCategory]);

  const handleInputChange = (key, value) => {
    setLocalSettings((p) => ({ ...p, [activeCategory]: { ...p[activeCategory], [key]: { ...p[activeCategory][key], value } } }));
    setHasChanges(true);
  };

  const handleImageChange = (key, file) => {
    if (!file) return;
    setImageFiles((p) => ({ ...p, [key]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreviews((p) => ({ ...p, [key]: reader.result }));
    reader.readAsDataURL(file);
    setHasChanges(true);
  };

  const clearImage = (key) => {
    setImageFiles((p) => { const n = { ...p }; delete n[key]; return n; });
    setImagePreviews((p) => { const n = { ...p }; delete n[key]; return n; });
    handleInputChange(key, '');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, file] of Object.entries(imageFiles)) await settingsService.updateSetting(key, file, true);
      const toUpdate = {};
      for (const [key, setting] of Object.entries(localSettings[activeCategory] || {})) {
        if (setting.type !== 'image') toUpdate[key] = setting.value;
      }
      if (Object.keys(toUpdate).length > 0) await settingsService.updateMultiple(toUpdate);
      await loadSettings();
      setImageFiles({});
      setImagePreviews({});
      setHasChanges(false);
      toast.success('Configurações salvas!');
    } catch { toast.error('Erro ao salvar configurações'); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!confirm('Resetar todas as configurações para o padrão?')) return;
    try {
      await resetToDefaults();
      setImageFiles({}); setImagePreviews({}); setHasChanges(false);
      toast.success('Configurações resetadas!');
    } catch { toast.error('Erro ao resetar'); }
  };

  if (loading && Object.keys(settings).length === 0) return <Loading fullScreen />;

  const categorySettings = localSettings[activeCategory] || settings[activeCategory] || {};
  const activeCat        = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Configurações</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
            Personalize aparência e funcionalidades do site
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Resetar
          </button>
          <Button size="sm" onClick={handleSave} loading={saving} disabled={!hasChanges}>
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Aviso de alterações */}
      {hasChanges && (
        <div className="p-3.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Você tem alterações não salvas. Clique em <strong>Salvar</strong> para aplicá-las.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar */}
        <Card className="p-3 h-fit">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-2">Categorias</p>
          <nav className="space-y-0.5">
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive   = activeCategory === id;
              const itemCount  = Object.keys(settings[id] || {}).length;
              return (
                <button key={id} onClick={() => setActiveCategory(id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{label}</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 px-1.5 py-0.5 rounded-md">
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Painel de configurações */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
              {activeCat && <activeCat.icon className="w-5 h-5 text-primary-500" />}
              <h2 className="text-lg font-black text-gray-900 dark:text-white">{activeCat?.label}</h2>
            </div>

            {Object.keys(categorySettings).length === 0 ? (
              <div className="text-center py-12 text-gray-300 dark:text-gray-700">
                <SettingsIcon className="w-10 h-10 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Nenhuma configuração nesta categoria</p>
              </div>
            ) : (
              <div className="space-y-7 divide-y divide-gray-50 dark:divide-gray-800">
                {Object.entries(categorySettings).map(([key, setting]) => (
                  <div key={key} className="pt-5 first:pt-0">
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                      {setting.description || key}
                    </label>
                    <SettingField
                      settingKey={key} setting={setting} value={setting.value}
                      onChange={(v) => handleInputChange(key, v)}
                      onImageChange={(f) => handleImageChange(key, f)}
                      imagePreview={imagePreviews[key]}
                      onClearImage={() => clearImage(key)}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ── SettingField ────────────────────────────────────────────────── */

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition-all';

const SettingField = ({ settingKey, setting, value, onChange, onImageChange, imagePreview, onClearImage }) => {
  switch (setting.type) {

    case 'text':
      return <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={setting.description} />;

    case 'textarea':
      return <textarea value={value || ''} onChange={(e) => onChange(e.target.value)}
        placeholder={setting.description} rows={4} className={inputCls + ' resize-none'} />;

    case 'number':
      return <Input type="number" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={setting.description} />;

    case 'boolean':
      return (
        <div className="flex items-center gap-3">
          <div onClick={() => onChange(value === 'true' ? 'false' : 'true')}
            className={`relative w-10 h-5.5 rounded-full cursor-pointer transition-colors ${value === 'true' ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            style={{ height: '22px' }}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value === 'true' ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {value === 'true' ? 'Ativado' : 'Desativado'}
          </span>
        </div>
      );

    case 'color':
      return (
        <div className="flex items-center gap-3">
          <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer bg-transparent" />
          <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="#000000"
            className={inputCls + ' max-w-[140px] font-mono'} />
        </div>
      );

    case 'image':
      return (
        <div className="space-y-3">
          {(imagePreview || value) && (
            <div className="relative inline-block">
              <img src={imagePreview || getImageUrl(value)} alt={setting.description}
                className="w-32 h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/128?text=N/A'; }} />
              <button type="button" onClick={onClearImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            {value || imagePreview ? 'Alterar imagem' : 'Fazer upload'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageChange(e.target.files[0])} />
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500">PNG, JPG, WEBP até 10MB</p>
        </div>
      );

    case 'json':
      return <textarea value={value || '{}'} onChange={(e) => onChange(e.target.value)}
        placeholder={setting.description} rows={6}
        className={inputCls + ' resize-none font-mono text-xs'} />;

    default:
      return <Input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={setting.description} />;
  }
};

export default Settings;