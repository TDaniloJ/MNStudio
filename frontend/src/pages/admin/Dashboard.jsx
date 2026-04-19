import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, FileText, Users, Tag,
  TrendingUp, Plus, BarChart3, Eye, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../../services/mangaService';
import { novelService } from '../../services/novelService';
import { formatNumber, formatDate } from '../../utils/formatters';
import { getImageUrl } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import NotificationBroadcastPanel from '../../components/admin/NotificationBroadcastPanel';

/* ── Constantes de cor ────────────────────────────────────────────── */

const STAT_COLORS = {
  blue:   { icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',   value: 'text-blue-700 dark:text-blue-300'   },
  green:  { icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', value: 'text-green-700 dark:text-green-300' },
  purple: { icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', value: 'text-purple-700 dark:text-purple-300' },
  amber:  { icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',  value: 'text-amber-700 dark:text-amber-300'  },
};

const QUICK_ACTIONS = [
  { to: '/admin/mangas', icon: BookOpen, label: 'Mangás',     color: 'blue'   },
  { to: '/admin/novels', icon: FileText, label: 'Novels',     color: 'purple' },
  { to: '/admin/genres', icon: Tag,      label: 'Gêneros',    color: 'green'  },
  { to: '/admin/users',  icon: Users,    label: 'Usuários',   color: 'amber'  },
];

/* ── Componente principal ─────────────────────────────────────────── */

const Dashboard = () => {
  const [stats, setStats]             = useState({ totalMangas: 0, totalNovels: 0, totalViews: 0, recentMangas: [], recentNovels: [] });
  const [chaptersCount, setChaptersCount] = useState({});
  const [loading, setLoading]         = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [mData, nData] = await Promise.all([
        mangaService.getAll({ limit: 5, sort: 'created_at' }),
        novelService.getAll({ limit: 5, sort: 'created_at' }),
      ]);

      const totalViews = [...(mData.mangas || []), ...(nData.novels || [])]
        .reduce((sum, i) => sum + (i.views || 0), 0);

      setStats({
        totalMangas:  mData.pagination?.total || mData.mangas?.length || 0,
        totalNovels:  nData.pagination?.total || nData.novels?.length || 0,
        totalViews,
        recentMangas: mData.mangas || [],
        recentNovels: nData.novels || [],
      });

      loadChaptersInBackground(mData.mangas, nData.novels);
    } catch {
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadChaptersInBackground = async (mangas, novels) => {
    const counts = {};
    for (const m of (mangas || [])) {
      try { const d = await mangaService.getMangaChapters(m.id); counts[`manga_${m.id}`] = d.chapters?.length || 0; }
      catch { counts[`manga_${m.id}`] = 0; }
    }
    for (const n of (novels || [])) {
      try { const d = await novelService.getNovelChapters(n.id); counts[`novel_${n.id}`] = d.chapters?.length || 0; }
      catch { counts[`novel_${n.id}`] = 0; }
    }
    setChaptersCount(counts);
  };

  const getChapCount = (item, type) => {
    const v = chaptersCount[`${type}_${item.id}`];
    return v !== undefined ? v : '…';
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="space-y-8">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Visão geral do sistema</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/mangas/new">
            <Button size="sm">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Novo Mangá
            </Button>
          </Link>
          <Link to="/admin/novels/new">
            <Button size="sm" variant="secondary">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nova Novel
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen,   label: 'Mangás',        value: stats.totalMangas,                         color: 'blue'   },
          { icon: FileText,   label: 'Novels',         value: stats.totalNovels,                         color: 'purple' },
          { icon: TrendingUp, label: 'Visualizações',  value: formatNumber(stats.totalViews),            color: 'green'  },
          { icon: BarChart3,  label: 'Total de obras', value: stats.totalMangas + stats.totalNovels,     color: 'amber'  },
        ].map(({ icon: Icon, label, value, color }) => {
          const c = STAT_COLORS[color];
          return (
            <Card key={label} className="p-5">
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${c.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                  <p className={`text-2xl font-black tabular-nums ${c.value}`}>{value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Conteúdo recente ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentSection
          title="Mangás Recentes"
          viewAllLink="/admin/mangas"
          items={stats.recentMangas}
          type="manga"
          getChapCount={getChapCount}
          emptyText="Nenhum mangá cadastrado"
        />
        <ContentSection
          title="Novels Recentes"
          viewAllLink="/admin/novels"
          items={stats.recentNovels}
          type="novel"
          getChapCount={getChapCount}
          emptyText="Nenhuma novel cadastrada"
        />
      </div>

      {/* ── Ações rápidas ───────────────────────────────────────── */}
      <Card className="p-6">
        <h2 className="text-base font-black text-gray-900 dark:text-white mb-5">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ to, icon: Icon, label, color }) => {
            const c = STAT_COLORS[color];
            return (
              <Link key={to} to={to}>
                <button className="group w-full flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all">
                  <div className={`p-3 rounded-xl transition-all ${c.icon} group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                    {label}
                  </p>
                </button>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* ── Broadcast ───────────────────────────────────────────── */}
      <NotificationBroadcastPanel />
    </div>
  );
};

/* ── ContentSection ──────────────────────────────────────────────── */

const ContentSection = ({ title, viewAllLink, items, type, getChapCount, emptyText }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-black text-gray-900 dark:text-white">{title}</h2>
      <Link to={viewAllLink} className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
        Ver todos <ArrowRight className="w-3 h-3" />
      </Link>
    </div>

    {items.length === 0 ? (
      <p className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">{emptyText}</p>
    ) : (
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/admin/${type}s/${item.id}/edit`}
            className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
          >
            <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
              <img
                src={getImageUrl(item.cover_image)}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/40x56?text=N/A'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {(() => {
                  const c = getChapCount(item, type);
                  return c === '…' ? 'Carregando…' : `${c} cap.`;
                })()}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
              <Eye className="w-3 h-3" />
              {formatNumber(item.views || 0)}
            </div>
          </Link>
        ))}
      </div>
    )}
  </Card>
);

export default Dashboard;