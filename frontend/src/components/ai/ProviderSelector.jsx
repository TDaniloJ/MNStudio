import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/aiService';

const ProviderSelector = ({ value, onChange, className = '' }) => {
  const [providers, setProviders] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await aiService.getProviders();
      setProviders(data.providers);
      
      // Selecionar primeiro provedor por padrão
      if (!value && Object.keys(data.providers).length > 0) {
        const firstProvider = Object.keys(data.providers)[0];
        onChange({
          provider: firstProvider,
          model: data.providers[firstProvider].defaultModel
        });
      }
    } catch (error) {
      console.error('Erro ao carregar provedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (providerKey) => {
    const provider = providers[providerKey];
    onChange({
      provider: providerKey,
      model: provider.defaultModel
    });
  };

  const handleModelChange = (model) => {
    onChange({
      ...value,
      model
    });
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando provedores...</div>;
  }

  if (Object.keys(providers).length === 0) {
    return (
      <div className="text-sm text-red-600 bg-red-50 p-2 rounded dark:bg-red-900 dark:text-red-400">
        ⚠️ Nenhum provedor de IA configurado. Configure as variáveis de ambiente.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
          Provedor de IA
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(providers).map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleProviderChange(key)}
              className={`p-2 text-xs border rounded text-center transition ${
                value?.provider === key
                  ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-300'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              }`}
            >
              <div className="font-medium">{config.name}</div>
            </button>
          ))}
        </div>
      </div>

      {value?.provider && providers[value.provider] && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
            Modelo
          </label>
          <select
            value={value?.model || ''}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-400 dark:focus:border-transparent"
          >
            {providers[value.provider].models.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ProviderSelector;