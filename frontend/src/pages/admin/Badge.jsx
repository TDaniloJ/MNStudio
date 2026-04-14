import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Shield, Star, Zap, Crown, Award } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Mock dos componentes comuns do projeto ───────────────────────────────────
// Substitua pelos imports reais do seu projeto:
// import Card from '../../components/common/Card';
// import Button from '../../components/common/Button';
// import SearchBar from '../../components/common/SearchBar';
// import Loading from '../../components/common/Loading';
// import Pagination from '../../components/common/Pagination';
// import EmptyState from '../../components/common/EmptyState';
// import { badgeService } from '../../services/badgeService';
// import { formatDate } from '../../utils/formatters';
// import { usePagination } from '../../hooks/usePagination';
// import { useDebounce } from '../../hooks/useDebounce';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition text-sm
      ${variant === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700' : ''}
      ${variant === 'secondary' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600' : ''}
      ${variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}`}
  >
    {children}
  </button>
);

const Loading = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
  </div>
);

const EmptyState = ({ title, description }) => (
  <Card className="p-12 text-center">
    <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
  </Card>
);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

// ─── Dados de exemplo (substitua pela chamada real ao badgeService) ─────────────
const MOCK_BADGES = [
  { id: 2, name: 'Primeiros Passos', description: 'Complete o seu perfil', icon_url: '/public/icons/badges/first-steps.png', condition_type: 'custom', condition_value: null, rarity: 'common', created_at: '2026-01-16T22:26:55Z', users_count: 142 },
  { id: 3, name: 'Colecionador', description: 'Adicione 10 obras aos favoritos', icon_url: '/public/icons/badges/collector.png', condition_type: 'favorite_count', condition_value: 10, rarity: 'uncommon', created_at: '2026-01-16T22:26:55Z', users_count: 87 },
  { id: 4, name: 'Leitor Dedicado', description: 'Leia 50 capítulos', icon_url: '/public/icons/badges/reader.png', condition_type: 'chapters_read', condition_value: 50, rarity: 'rare', created_at: '2026-01-16T22:26:55Z', users_count: 34 },
  { id: 5, name: 'Fã do MN Studio', description: 'Acumule 100 dias de visitas', icon_url: '/public/icons/badges/fan.png', condition_type: 'reading_streak', condition_value: 100, rarity: 'rare', created_at: '2026-01-16T22:26:55Z', users_count: 12 },
  { id: 6, name: 'Lenda', description: 'Desbloqueou todas as badges', icon_url: '/public/icons/badges/legend.png', condition_type: 'custom', condition_value: null, rarity: 'legendary', created_at: '2026-01-16T22:26:55Z', users_count: 3 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RARITY_CONFIG = {
  common:    { label: 'Comum',      bg: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',      icon: Shield,  dot: 'bg-gray-400' },
  uncommon:  { label: 'Incomum',    bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',   icon: Star,    dot: 'bg-green-500' },
  rare:      { label: 'Raro',       bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',       icon: Zap,     dot: 'bg-blue-500' },
  legendary: { label: 'Lendário',   bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: Crown,  dot: 'bg-yellow-500' },
};

const CONDITION_LABELS = {
  favorite_count:  'Favoritos',
  reading_streak:  'Dias seguidos',
  chapters_read:   'Capítulos lidos',
  custom:          'Personalizada',
};

const RARITY_OPTIONS   = ['common', 'uncommon', 'rare', 'legendary'];
const CONDITION_OPTIONS = ['custom', 'favorite_count', 'reading_streak', 'chapters_read'];

// ─── Modal de criação/edição ──────────────────────────────────────────────────
const BadgeModal = ({ badge, onClose, onSave }) => {
  const isEdit = Boolean(badge?.id);
  const [form, setForm] = useState({
    name:            badge?.name            ?? '',
    description:     badge?.description     ?? '',
    icon_url:        badge?.icon_url        ?? '',
    condition_type:  badge?.condition_type  ?? 'custom',
    condition_value: badge?.condition_value ?? '',
    rarity:          badge?.rarity          ?? 'common',
  });
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      // Substitua pela chamada real:
      // isEdit ? await badgeService.update(badge.id, form) : await badgeService.create(form);
      await new Promise(r => setTimeout(r, 600)); // simulação
      toast.success(isEdit ? 'Badge atualizada!' : 'Badge criada!');
      onSave();
    } catch {
      toast.error('Erro ao salvar badge');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Editar Badge' : 'Nova Badge'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Preview da raridade */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            {(() => {
              const cfg = RARITY_CONFIG[form.rarity];
              const Icon = cfg.icon;
              return (
                <>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{form.name || 'Nome da badge'}</span>
                </>
              );
            })()}
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Leitor Dedicado"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Ex: Leia 50 capítulos"
            />
          </div>

          {/* URL do ícone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL do Ícone</label>
            <input
              value={form.icon_url}
              onChange={e => set('icon_url', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="/public/icons/badges/exemplo.png"
            />
          </div>

          {/* Raridade + Tipo de condição */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raridade</label>
              <select
                value={form.rarity}
                onChange={e => set('rarity', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {RARITY_OPTIONS.map(r => (
                  <option key={r} value={r}>{RARITY_CONFIG[r].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Condição</label>
              <select
                value={form.condition_type}
                onChange={e => set('condition_type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {CONDITION_OPTIONS.map(c => (
                  <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Valor da condição (oculto para custom) */}
          {form.condition_type !== 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor necessário <span className="text-gray-400 font-normal">({CONDITION_LABELS[form.condition_type]})</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.condition_value}
                onChange={e => set('condition_value', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex: 50"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar badge'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const BadgeManagement = () => {
  const [badges, setBadges]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterRarity, setFilterRarity] = useState('');
  const [modal, setModal]         = useState(null); // null | 'new' | badge object

  useEffect(() => { loadBadges(); }, []);

  const loadBadges = async () => {
    setLoading(true);
    try {
      // Substitua por: const data = await badgeService.getAll();
      await new Promise(r => setTimeout(r, 500));
      setBadges(MOCK_BADGES);
    } catch {
      toast.error('Erro ao carregar badges');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja deletar "${name}"?`)) return;
    try {
      // await badgeService.delete(id);
      setBadges(prev => prev.filter(b => b.id !== id));
      toast.success('Badge deletada com sucesso');
    } catch {
      toast.error('Erro ao deletar badge');
    }
  };

  const filtered = badges.filter(b => {
    const matchSearch  = b.name.toLowerCase().includes(search.toLowerCase()) ||
                         b.description?.toLowerCase().includes(search.toLowerCase());
    const matchRarity  = !filterRarity || b.rarity === filterRarity;
    return matchSearch && matchRarity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Badges</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {badges.length} badge{badges.length !== 1 ? 's' : ''} cadastrada{badges.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setModal('new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Badge
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* SearchBar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar badges..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {/* Filtro raridade */}
          <select
            value={filterRarity}
            onChange={e => setFilterRarity(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todas as raridades</option>
            {RARITY_OPTIONS.map(r => (
              <option key={r} value={r}>{RARITY_CONFIG[r].label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Conteúdo */}
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nenhuma badge encontrada"
          description="Crie sua primeira badge ou ajuste os filtros"
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Badge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Raridade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Condição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Usuários</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Criada em</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map(badge => {
                  const rarity = RARITY_CONFIG[badge.rarity];
                  const RarityIcon = rarity.icon;
                  return (
                    <tr key={badge.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* Badge info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* Ícone */}
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img
                              src={badge.icon_url}
                              alt={badge.name}
                              className="w-8 h-8 object-contain"
                              onError={e => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<span class="text-lg">🏅</span>`;
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{badge.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] truncate">{badge.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* Raridade */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${rarity.bg}`}>
                          <RarityIcon className="w-3 h-3" />
                          {rarity.label}
                        </span>
                      </td>

                      {/* Condição */}
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {CONDITION_LABELS[badge.condition_type]}
                      </td>

                      {/* Valor */}
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {badge.condition_value ?? <span className="text-gray-400 dark:text-gray-500">—</span>}
                      </td>

                      {/* Usuários */}
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {badge.users_count ?? 0}
                      </td>

                      {/* Data */}
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(badge.created_at)}
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal(badge)}
                            className="p-2 text-gray-600 hover:text-primary-600 transition dark:hover:text-primary-400"
                            title="Editar badge"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(badge.id, badge.name)}
                            className="p-2 text-gray-600 hover:text-red-600 transition dark:hover:text-red-400"
                            title="Deletar badge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal */}
      {modal !== null && (
        <BadgeModal
          badge={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); loadBadges(); }}
        />
      )}
    </div>
  );
};

export default BadgeManagement;