import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Palette, 
  ToggleLeft,
  Search as SearchIcon,
  Mail,
  Share2,
  Code,
  Save,
  RotateCcw,
  Upload,
  X
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
  { id: 'general', label: 'Geral', icon: Globe },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'features', label: 'Funcionalidades', icon: ToggleLeft },
  { id: 'seo', label: 'SEO', icon: SearchIcon },
  { id: 'social', label: 'Redes Sociais', icon: Share2 },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'footer', label: 'Rodapé', icon: Code },
  { id: 'advanced', label: 'Avançado', icon: SettingsIcon }
];

const Settings = () => {
  const { settings, loading, loadSettings, resetToDefaults } = useSettingsStore();
  const [activeCategory, setActiveCategory] = useState('general');
  const [localSettings, setLocalSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings[activeCategory]) {
      setLocalSettings(prev => ({
        ...prev,
        [activeCategory]: { ...settings[activeCategory] }
      }));
    }
  }, [settings, activeCategory]);

  const handleInputChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        [key]: { ...prev[activeCategory][key], value }
      }
    }));
    setHasChanges(true);
  };

  const handleImageChange = (key, file) => {
    if (file) {
      setImageFiles(prev => ({ ...prev, [key]: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [key]: reader.result }));
      };
      reader.readAsDataURL(file);
      setHasChanges(true);
    }
  };

  const clearImage = (key) => {
    setImageFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[key];
      return newPreviews;
    });
    handleInputChange(key, '');
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Salvar imagens primeiro
      for (const [key, file] of Object.entries(imageFiles)) {
        await settingsService.updateSetting(key, file, true);
      }

      // Salvar outras configurações
      const settingsToUpdate = {};
      const categorySettings = localSettings[activeCategory] || {};
      
      for (const [key, setting] of Object.entries(categorySettings)) {
        if (setting.type !== 'image') {
          settingsToUpdate[key] = setting.value;
        }
      }

      if (Object.keys(settingsToUpdate).length > 0) {
        await settingsService.updateMultiple(settingsToUpdate);
      }

      await loadSettings();
      setImageFiles({});
      setImagePreviews({});
      setHasChanges(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Tem certeza que deseja resetar todas as configurações para o padrão? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await resetToDefaults();
      setImageFiles({});
      setImagePreviews({});
      setHasChanges(false);
      toast.success('Configurações resetadas para padrão!');
    } catch (error) {
      toast.error('Erro ao resetar configurações');
    }
  };

  if (loading && Object.keys(settings).length === 0) {
    return <Loading fullScreen />;
  }

  const categorySettings = localSettings[activeCategory] || settings[activeCategory] || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações do Site</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Personalize a aparência e funcionalidades do seu site
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar Padrões
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Você tem alterações não salvas. Clique em "Salvar Alterações" para aplicá-las.
          </p>
        </Card>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="p-4 h-fit">
          <h3 className="font-semibold text-gray-900 mb-3 dark:text-white">Categorias</h3>
          <nav className="space-y-1">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.id;
              const categoryData = settings[category.id] || {};
              const itemCount = Object.keys(categoryData).length;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{category.label}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full dark:bg-gray-800">
                    {itemCount}
                  </span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Settings Panel */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">
              {CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h2>

            {Object.keys(categorySettings).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma configuração disponível nesta categoria
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(categorySettings).map(([key, setting]) => (
                  <SettingField
                    key={key}
                    settingKey={key}
                    setting={setting}
                    value={setting.value}
                    onChange={(value) => handleInputChange(key, value)}
                    onImageChange={(file) => handleImageChange(key, file)}
                    imagePreview={imagePreviews[key]}
                    onClearImage={() => clearImage(key)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// Componente de Campo de Configuração
const SettingField = ({ 
  settingKey, 
  setting, 
  value, 
  onChange, 
  onImageChange, 
  imagePreview,
  onClearImage 
}) => {
  const renderField = () => {
    switch (setting.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.description}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.description}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-transparent"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.description}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange(value === 'true' ? 'false' : 'true')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value === 'true' ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform dark:bg-gray-300 ${
                  value === 'true' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {value === 'true' ? 'Ativado' : 'Desativado'}
            </span>
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-transparent"
            />
            <Input
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            {(imagePreview || value) && (
              <div className="relative inline-block">
                <img
                  src={imagePreview || getImageUrl(value)}
                  alt={setting.description}
                  className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                  }}
                />
                <button
                  type="button"
                  onClick={onClearImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition dark:bg-gray-800 dark:hover:bg-gray-700">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">
                {value || imagePreview ? 'Alterar Imagem' : 'Fazer Upload'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onImageChange(e.target.files[0])}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, WEBP até 10MB
            </p>
          </div>
        );

      case 'json':
        return (
          <textarea
            value={value || '{}'}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.description}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-transparent"
          />
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={setting.description}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
        {setting.description || settingKey}
      </label>
      {renderField()}
    </div>
  );
};

export default Settings;