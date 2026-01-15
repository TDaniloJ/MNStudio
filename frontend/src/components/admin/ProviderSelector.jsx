import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ProviderSelector({
  value,
  onChange
}) {
  const [providers, setProviders] = useState({});
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProviders() {
      try {
        const res = await api.get('/ai/providers');
        const backendProviders = res.data?.providers || {};

        setProviders(backendProviders);

        const firstProviderKey = Object.keys(backendProviders)[0];
        if (!firstProviderKey) return;

        const firstProvider = backendProviders[firstProviderKey];

        setProvider(firstProviderKey);
        setModel(firstProvider.defaultModel);

        onChange?.({
          provider: firstProviderKey,
          model: firstProvider.defaultModel,
          maxTokens: firstProvider.maxTokens
        });
      } catch (err) {
        console.error('Erro ao carregar providers:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProviders();
  }, []);

  function handleProviderChange(e) {
    const selected = e.target.value;
    const data = providers[selected];

    if (!data) return;

    setProvider(selected);
    setModel(data.defaultModel);

    onChange?.({
      provider: selected,
      model: data.defaultModel,
      maxTokens: data.maxTokens
    });
  }

  function handleModelChange(e) {
    const selectedModel = e.target.value;
    setModel(selectedModel);

    onChange?.({
      provider,
      model: selectedModel,
      maxTokens: providers[provider]?.maxTokens
    });
  }

  if (loading) return <p>Carregando provedores de IA...</p>;

  if (!Object.keys(providers).length) {
    return <p>Nenhum provedor de IA disponível</p>;
  }

  return (
    <div className="space-y-3 m-3">
      <div>
        <label className="block text-sm font-medium">Provedor</label>
        <select
          value={provider}
          onChange={handleProviderChange}
          className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-transparent"
        >
          {Object.entries(providers).map(([key, p]) => (
            <option key={key} value={key}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Modelo</label>
        <select
          value={model}
          onChange={handleModelChange}
          className="w-full border rounded p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:ring-primary-500 dark:focus:border-transparent"
        >
          {(providers[provider]?.models || []).map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500">
        Máx tokens: {providers[provider]?.maxTokens}
      </p>
    </div>
  );
}
