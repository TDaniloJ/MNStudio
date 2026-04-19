import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy, TrendingUp, Eye, Star, Clock,
  Users, BookOpen, FileText, Crown, Medal, Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rankingService } from '../services/rankingService';
import { getImageUrl, formatNumber } from '../utils/formatters';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

/* ── Dados de configuração ─────────────────────────────────────── */

const TABS = [
  { id: 'global', label: 'Global', icon: Trophy   },
  { id: 'mangas', label: 'Mangás', icon: BookOpen  },
  { id: 'novels', label: 'Novels', icon: FileText  },
  { id: 'users',  label: 'Leitores', icon: Users   },
];

const RANKING_TYPES = {
  global: [
    { value: 'views',  label: 'Mais vistos',     icon: Eye  },
    { value: 'rating', label: 'Mais bem avaliados', icon: Star },
  ],
  mangas: [
    { value: 'views',   label: 'Mais vistos',       icon: Eye      },
    { value: 'rating',  label: 'Mais bem avaliados', icon: Star     },
    { value: 'chapters',label: 'Mais capítulos',    icon: BookOpen },
    { value: 'recent',  label: 'Mais recentes',     icon: Clock    },
  ],
  novels: [
    { value: 'views',   label: 'Mais vistos',       icon: Eye      },
    { value: 'rating',  label: 'Mais bem avaliados', icon: Star     },
    { value: 'chapters',label: 'Mais capítulos',    icon: FileText },
    { value: 'recent',  label: 'Mais recentes',     icon: Clock    },
  ],
  users: [
    { value: 'uploads', label: 'Mais uploads', icon: TrendingUp },
    { value: 'views',   label: 'Mais vistos',  icon: Eye        },
    { value: 'chapters',label: 'Capítulos lidos', icon: BookOpen },
  ],
};

const PERIODS = [
  { value: 'all',   label: 'Todo o período'  },
  { value: 'year',  label: 'Último ano'      },
  { value: 'month', label: 'Último mês'      },
  { value: 'week',  label: 'Última semana'   },
  { value: 'day',   label: 'Hoje'            },
];

const MEDAL = {
  1: { icon: Crown,  color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  2: { icon: Medal,  color: 'text-gray-400',    bg: 'bg-gray-400/10'   },
  3: { icon: Award,  color: 'text-orange-500',  bg: 'bg-orange-500/10' },
};

/* ── Componente principal ─────────────────────────────────────── */

const Rankings = () => {
  const [activeTab,    setActiveTab]    = useState('global');
  const [rankingType,  setRankingType]  = useState('views');
  const [period,       setPeriod]       = useState('all');
  const [data,         setData]         = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadData(); }, [activeTab, rankingType, period]);
  useEffect(() => { if (activeTab === 'global') setPeriod('all'); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result;
      switch (activeTab) {
        case 'global': result = await rankingService.getGlobalRankings(rankingType);       setData(result.rankings || []); break;
        case 'mangas': result = await rankingService.getMangaRankings(rankingType, period); setData(result.mangas   || []); break;
        case 'novels': result = await rankingService.getNovelRankings(rankingType, period); setData(result.novels   || []); break;
        case 'users':  result = await rankingService.getUserRankings(rankingType);          setData(result.users    || []); break;
      }
    } catch { toast.error('Erro ao carregar ranking'); }
    finally { setLoading(false); }
  };

  const loadStats = async () => {
    try { const r = await rankingService.getGlobalStats(); setStats(r.stats); }
    catch { /* silencioso */ }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0f]">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative bg-gray-950 overflow-hidden">
        {/* grain */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent" />

        <div className="relative container-custom py-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-yellow-500/15 border border-yellow-500/20 rounded-2xl">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Rankings</h1>
              <p className="text-white/40 text-sm">Os melhores conteúdos e leitores da plataforma</p>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Conteúdos',    value: stats.total_content, color: 'text-blue-400'   },
                { label: 'Mangás',       value: stats.total_mangas,  color: 'text-green-400'  },
                { label: 'Novels',       value: stats.total_novels,  color: 'text-purple-400' },
                { label: 'Visualizações',value: stats.total_views,   color: 'text-yellow-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-white/30 text-xs mb-1">{label}</p>
                  <p className={`text-2xl font-black ${color} tabular-nums`}>{formatNumber(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8 space-y-6">

        {/* ── Tabs ──────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id}
              onClick={() => { setActiveTab(id); setRankingType(RANKING_TYPES[id][0].value); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Filtros ───────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Tipo de ranking */}
          <div className="flex flex-wrap gap-2">
            {RANKING_TYPES[activeTab]?.map(({ value, label, icon: Icon }) => (
              <button key={value} onClick={() => setRankingType(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  rankingType === value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Período */}
          {(activeTab === 'mangas' || activeTab === 'novels') && (
            <select value={period} onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40 md:ml-auto">
              {PERIODS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          )}
        </div>

        {/* ── Lista ─────────────────────────────────────────────── */}
        {loading ? (
          <Loading />
        ) : data.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500">Nenhum resultado encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((item, index) => (
              <RankingItem
                key={item.id ? `${item.id}-${index}` : `rank-${index}`}
                item={item}
                position={index + 1}
                type={activeTab}
                rankingType={rankingType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── RankingItem ──────────────────────────────────────────────────── */

const RankingItem = ({ item, position, type, rankingType }) => {
  if (!item) return null;

  const isUser      = type === 'users';
  const contentType = item.content_type || type.replace(/s$/, '');
  const medal       = MEDAL[position];

  const statsValue = {
    views:    isUser ? item.total_views    : item.views,
    rating:   item.rating,
    chapters: isUser ? item.total_chapters : item.chapter_count,
    uploads:  item.total_uploads,
    recent:   item.views,
  }[rankingType] ?? item.views;

  const statsLabel = {
    views: 'visualizações', rating: 'avaliação',
    chapters: 'capítulos', uploads: 'uploads', recent: 'visualizações',
  }[rankingType] ?? 'visualizações';

  const linkTo = type === 'global'
    ? `/${contentType}/${item.id}`
    : `/${contentType === 'manga' ? 'manga' : 'novel'}/${item.id}`;

  const inner = (
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
      position <= 3
        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800'
        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-800'
    }`}>

      {/* Posição */}
      <div className="flex-shrink-0 w-14 flex items-center justify-center">
        {medal ? (
          <div className={`p-2 rounded-xl ${medal.bg}`}>
            <medal.icon className={`w-5 h-5 ${medal.color}`} />
          </div>
        ) : (
          <span className="text-lg font-black text-gray-300 dark:text-gray-700">#{position}</span>
        )}
      </div>

      {/* Capa ou avatar */}
      {isUser ? (
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0">
          {item.username?.charAt(0).toUpperCase()}
        </div>
      ) : (
        <img
          src={getImageUrl(item.cover_image)}
          alt={item.title}
          className="w-12 h-16 object-cover rounded-xl flex-shrink-0"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/48x64?text=N/A'; }}
        />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white truncate">
          {isUser ? item.username : item.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          {isUser ? (
            <span className="text-xs text-gray-400 capitalize">{item.role}</span>
          ) : (
            <>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                contentType === 'manga'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              }`}>
                {contentType}
              </span>
              {item.type && (
                <span className="text-xs text-gray-400 dark:text-gray-500">{item.type}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Valor */}
      <div className="text-right flex-shrink-0">
        <p className="text-xl font-black text-primary-600 dark:text-primary-400 tabular-nums">
          {rankingType === 'rating' ? Number(statsValue || 0).toFixed(1) : formatNumber(statsValue)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{statsLabel}</p>
      </div>
    </div>
  );

  return isUser
    ? <div>{inner}</div>
    : <Link to={linkTo}>{inner}</Link>;
};

export default Rankings;