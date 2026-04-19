import React, { useState, useEffect } from 'react';
import {
  Trophy, Plus, Edit, Trash2, Search, Star, Award,
  BookOpen, FileText, Clock, Zap, Heart, Users,
  Target, Eye, TrendingUp, Shield, Crown, Check,
  X, AlertCircle, Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';

/* ── Ícones disponíveis ───────────────────────────────────────────── */

const BADGE_ICONS = [
  { id: 'trophy',    icon: Trophy,    label: 'Troféu'      },
  { id: 'star',      icon: Star,      label: 'Estrela'     },
  { id: 'award',     icon: Award,     label: 'Prêmio'      },
  { id: 'book',      icon: BookOpen,  label: 'Livro'       },
  { id: 'file',      icon: FileText,  label: 'Texto'       },
  { id: 'clock',     icon: Clock,     label: 'Tempo'       },
  { id: 'zap',       icon: Zap,       label: 'Energia'     },
  { id: 'heart',     icon: Heart,     label: 'Coração'     },
  { id: 'users',     icon: Users,     label: 'Comunidade'  },
  { id: 'target',    icon: Target,    label: 'Objetivo'    },
  { id: 'eye',       icon: Eye,       label: 'Olho'        },
  { id: 'trending',  icon: TrendingUp,label: 'Tendência'   },
  { id: 'shield',    icon: Shield,    label: 'Escudo'      },
  { id: 'crown',     icon: Crown,     label: 'Coroa'       },
];

const ICON_MAP = Object.fromEntries(BADGE_ICONS.map((b) => [b.id, b.icon]));

/* ── Cores disponíveis ────────────────────────────────────────────── */

const BADGE_COLORS = [
  { id: 'gold',    label: 'Ouro',    bg: 'bg-yellow-100 dark:bg-yellow-900/30',   icon: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-700' },
  { id: 'silver',  label: 'Prata',   bg: 'bg-gray-100 dark:bg-gray-800',          icon: 'text-gray-500 dark:text-gray-400',     border: 'border-gray-300 dark:border-gray-600'     },
  { id: 'bronze',  label: 'Bronze',  bg: 'bg-orange-100 dark:bg-orange-900/30',   icon: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700' },
  { id: 'blue',    label: 'Azul',    bg: 'bg-blue-100 dark:bg-blue-900/30',       icon: 'text-blue-600 dark:text-blue-400',     border: 'border-blue-300 dark:border-blue-700'     },
  { id: 'purple',  label: 'Roxo',    bg: 'bg-purple-100 dark:bg-purple-900/30',   icon: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700' },
  { id: 'green',   label: 'Verde',   bg: 'bg-green-100 dark:bg-green-900/30',     icon: 'text-green-600 dark:text-green-400',   border: 'border-green-300 dark:border-green-700'   },
  { id: 'red',     label: 'Vermelho',bg: 'bg-red-100 dark:bg-red-900/30',         icon: 'text-red-600 dark:text-red-400',       border: 'border-red-300 dark:border-red-700'       },
  { id: 'primary', label: 'Primário',bg: 'bg-primary-100 dark:bg-primary-900/30', icon: 'text-primary-600 dark:text-primary-400',border: 'border-primary-300 dark:border-primary-700'},
];

const COLOR_MAP = Object.fromEntries(BADGE_COLORS.map((c) => [c.id, c]));

/* ── Categorias de conquistas ─────────────────────────────────────── */

const CATEGORIES = [
  { id: 'all',      label: 'Todas'        },
  { id: 'reading',  label: 'Leitura'      },
  { id: 'social',   label: 'Social'       },
  { id: 'content',  label: 'Conteúdo'     },
  { id: 'streak',   label: 'Sequência'    },
  { id: 'special',  label: 'Especial'     },
];

/* ── Conquistas pré-definidas (mock — troque pelo badgeService) ────── */

const INITIAL_BADGES = [
  { id: 1, name: 'Primeira Leitura',    description: 'Complete o primeiro capítulo',               icon: 'book',    color: 'green',   category: 'reading', condition: 'chapters_read >= 1',   coins: 10,  xp: 50,  active: true,  users_earned: 142 },
  { id: 2, name: 'Leitor Assíduo',      description: 'Leia 50 capítulos no total',                 icon: 'star',    color: 'blue',    category: 'reading', condition: 'chapters_read >= 50',  coins: 50,  xp: 200, active: true,  users_earned: 38  },
  { id: 3, name: 'Maratonista',         description: 'Leia 100 capítulos em um único dia',         icon: 'zap',     color: 'gold',    category: 'streak',  condition: 'daily_chapters >= 100',coins: 100, xp: 500, active: true,  users_earned: 7   },
  { id: 4, name: 'Fã de Primeira Hora', description: 'Favoritar uma obra com menos de 24h',        icon: 'heart',   color: 'red',     category: 'social',  condition: 'early_favorite',       coins: 25,  xp: 100, active: true,  users_earned: 89  },
  { id: 5, name: 'Crítico',             description: 'Avalie 10 obras diferentes',                 icon: 'award',   color: 'purple',  category: 'social',  condition: 'ratings >= 10',        coins: 30,  xp: 150, active: true,  users_earned: 61  },
  { id: 6, name: 'Explorador',          description: 'Leia obras de 5 gêneros diferentes',         icon: 'target',  color: 'bronze',  category: 'reading', condition: 'genres_read >= 5',     coins: 40,  xp: 200, active: true,  users_earned: 54  },
  { id: 7, name: 'Lenda',              description: 'Leia 1000 capítulos no total',               icon: 'crown',   color: 'gold',    category: 'reading', condition: 'chapters_read >= 1000', coins: 500, xp: 2000,active: false, users_earned: 0   },
  { id: 8, name: 'Veterano',           description: 'Seja membro há mais de 1 ano',              icon: 'shield',  color: 'silver',  category: 'special', condition: 'account_age >= 365',   coins: 200, xp: 800, active: true,  users_earned: 23  },
];

const EMPTY_BADGE = { name: '', description: '', icon: 'trophy', color: 'gold', category: 'reading', condition: '', coins: 0, xp: 0, active: true };

/* ── BadgeCard ────────────────────────────────────────────────────── */

const BadgeCard = ({ badge, onEdit, onDelete, onToggle }) => {
  const Icon  = ICON_MAP[badge.icon]  ?? Trophy;
  const color = COLOR_MAP[badge.color] ?? COLOR_MAP.gold;

  return (
    <div className={`group relative p-4 rounded-2xl border transition-all hover:shadow-md ${color.border} ${badge.active ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-900/50 opacity-60'}`}>
      {/* Active badge */}
      {!badge.active && (
        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
          Inativa
        </span>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${color.bg}`}>
          <Icon className={`w-5 h-5 ${color.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-gray-900 dark:text-white truncate">{badge.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{badge.description}</p>
        </div>
      </div>

      {/* Recompensas */}
      <div className="flex items-center gap-3 mb-3 text-xs">
        <span className="flex items-center gap-1 font-semibold text-yellow-600 dark:text-yellow-400">
          🪙 {badge.coins} coins
        </span>
        <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
          ⚡ {badge.xp} XP
        </span>
        <span className="ml-auto text-gray-400 dark:text-gray-500">
          {badge.users_earned} usuários
        </span>
      </div>

      {/* Condição */}
      <div className="mb-4 px-2 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400 truncate">{badge.condition}</p>
      </div>

      {/* Ações */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onToggle(badge.id)}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
            badge.active
              ? 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
              : 'border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
          }`}>
          {badge.active ? 'Desativar' : 'Ativar'}
        </button>
        <button onClick={() => onEdit(badge)}
          className="p-1.5 rounded-xl text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={() => onDelete(badge.id, badge.name)}
          className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ── Componente principal ─────────────────────────────────────────── */

const Badges = () => {
  const [badges,        setBadges]        = useState(INITIAL_BADGES);
  const [loading,       setLoading]       = useState(false);
  const [search,        setSearch]        = useState('');
  const [category,      setCategory]      = useState('all');
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [formData,      setFormData]      = useState(EMPTY_BADGE);
  const [saving,        setSaving]        = useState(false);

  // Filtros
  const filtered = badges.filter((b) => {
    const matchSearch   = !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || b.category === category;
    return matchSearch && matchCategory;
  });

  const stats = {
    total:   badges.length,
    active:  badges.filter((b) => b.active).length,
    earned:  badges.reduce((sum, b) => sum + (b.users_earned || 0), 0),
  };

  const openCreate = () => {
    setSelectedBadge(null);
    setFormData(EMPTY_BADGE);
    setIsModalOpen(true);
  };

  const openEdit = (badge) => {
    setSelectedBadge(badge);
    setFormData({ ...badge });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Nome é obrigatório'); return; }
    if (!formData.condition.trim()) { toast.error('Condição é obrigatória'); return; }
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 500)); // substitua pelo badgeService
      if (selectedBadge) {
        setBadges((prev) => prev.map((b) => b.id === selectedBadge.id ? { ...b, ...formData } : b));
        toast.success('Conquista atualizada!');
      } else {
        const newBadge = { ...formData, id: Date.now(), users_earned: 0 };
        setBadges((prev) => [...prev, newBadge]);
        toast.success('Conquista criada!');
      }
      setIsModalOpen(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (badgeId, name) => {
    if (!confirm(`Excluir a conquista "${name}"?`)) return;
    setBadges((prev) => prev.filter((b) => b.id !== badgeId));
    toast.success('Conquista excluída!');
  };

  const handleToggle = (badgeId) => {
    setBadges((prev) => prev.map((b) => b.id === badgeId ? { ...b, active: !b.active } : b));
    const badge = badges.find((b) => b.id === badgeId);
    toast.success(badge?.active ? 'Conquista desativada' : 'Conquista ativada!');
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Conquistas</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
            Crie e gerencie as conquistas que os usuários podem desbloquear
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Nova Conquista
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total de Conquistas', value: stats.total,  color: 'text-gray-700 dark:text-gray-200',   bg: 'bg-gray-100 dark:bg-gray-800',       icon: Trophy   },
          { label: 'Conquistas Ativas',   value: stats.active, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20',   icon: Check    },
          { label: 'Total Conquistadas',  value: stats.earned, color: 'text-yellow-600 dark:text-yellow-400',bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: Award    },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conquistas…"
            className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(({ id, label }) => (
            <button key={id} onClick={() => setCategory(id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                category === id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de conquistas */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-300 dark:text-gray-700">
          <Trophy className="w-12 h-12 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Nenhuma conquista encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
          ))}
        </div>
      )}

      {/* Modal criar/editar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg"
        title={selectedBadge ? 'Editar Conquista' : 'Nova Conquista'}>
        <div className="space-y-5">

          {/* Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className={`p-3 rounded-xl flex-shrink-0 ${COLOR_MAP[formData.color]?.bg ?? ''}`}>
              {(() => { const I = ICON_MAP[formData.icon] ?? Trophy; return <I className={`w-6 h-6 ${COLOR_MAP[formData.color]?.icon ?? ''}`} />; })()}
            </div>
            <div className="min-w-0">
              <p className="font-black text-gray-900 dark:text-white">{formData.name || 'Nome da conquista'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{formData.description || 'Descrição da conquista'}</p>
              <div className="flex gap-3 mt-1 text-xs">
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">🪙 {formData.coins || 0} coins</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">⚡ {formData.xp || 0} XP</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Nome */}
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Nome *</label>
              <input type="text" value={formData.name} placeholder="Ex: Leitor Assíduo"
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
            </div>

            {/* Descrição */}
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Descrição</label>
              <textarea rows={2} value={formData.description} placeholder="O que o usuário precisa fazer?"
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none" />
            </div>

            {/* Ícone */}
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Ícone</label>
              <div className="grid grid-cols-7 gap-1.5">
                {BADGE_ICONS.map(({ id, icon: Icon, label }) => (
                  <button key={id} type="button" onClick={() => setFormData((p) => ({ ...p, icon: id }))}
                    title={label}
                    className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                      formData.icon === id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Cor */}
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {BADGE_COLORS.map(({ id, label, bg, icon }) => (
                  <button key={id} type="button" onClick={() => setFormData((p) => ({ ...p, color: id }))}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${bg} ${icon} ${
                      formData.color === id ? 'ring-2 ring-primary-500 ring-offset-1' : 'opacity-70 hover:opacity-100'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Categoria</label>
              <select value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                {CATEGORIES.filter((c) => c.id !== 'all').map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>

            {/* Ativo */}
            <div className="flex items-center gap-3 pt-5">
              <label className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Ativa</label>
              <div onClick={() => setFormData((p) => ({ ...p, active: !p.active }))}
                className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${formData.active ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${formData.active ? 'left-4' : 'left-0.5'}`} />
              </div>
            </div>

            {/* Condição */}
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                Condição *
                <span className="ml-2 font-normal normal-case text-gray-400 dark:text-gray-500">(ex: chapters_read &gt;= 50)</span>
              </label>
              <input type="text" value={formData.condition}
                placeholder="chapters_read >= 50"
                onChange={(e) => setFormData((p) => ({ ...p, condition: e.target.value }))}
                className="w-full px-3 py-2 text-sm font-mono border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
            </div>

            {/* Recompensas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                🪙 Coins de recompensa
              </label>
              <input type="number" min="0" value={formData.coins} placeholder="0"
                onChange={(e) => setFormData((p) => ({ ...p, coins: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
                ⚡ XP de recompensa
              </label>
              <input type="number" min="0" value={formData.xp} placeholder="0"
                onChange={(e) => setFormData((p) => ({ ...p, xp: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {selectedBadge ? 'Atualizar' : 'Criar'} Conquista
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Badges;