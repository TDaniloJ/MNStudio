import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  History as HistoryIcon, BookOpen, FileText, Trash2,
  Search, Clock, BarChart3, ChevronRight, Play,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { readingHistoryService } from '../services/readingHistoryService';
import { getImageUrl, formatDateTime } from '../utils/formatters';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';

const normalizeChNum = (n) => {
  if (n === undefined || n === null) return '';
  const p = Number(n);
  if (isNaN(p)) return String(n);
  if (Number.isInteger(p)) return String(p);
  return String(p).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
};

const History = () => {
  const [history,    setHistory]    = useState({ mangas: [], novels: [] });
  const [loading,    setLoading]    = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy,     setSortBy]     = useState('recent');

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await readingHistoryService.getHistory();
      setHistory(data.history);
    } catch { toast.error('Erro ao carregar histórico'); }
    finally { setLoading(false); }
  };

  const handleRemove = async (itemId, type) => {
    if (!confirm('Remover este item do histórico?')) return;
    try {
      await readingHistoryService.removeFromHistory(itemId, type);
      toast.success('Removido do histórico');
      setHistory((prev) => ({ ...prev, [type]: prev[type].filter((i) => i.id !== itemId) }));
    } catch { toast.error('Erro ao remover item'); }
  };

  const handleClear = async () => {
    if (!confirm('Limpar todo o histórico?')) return;
    try {
      await readingHistoryService.clearHistory();
      toast.success('Histórico limpo!');
      setHistory({ mangas: [], novels: [] });
    } catch { toast.error('Erro ao limpar histórico'); }
  };

  const stats = useMemo(() => {
    const all       = [...history.mangas, ...history.novels];
    const weekAgo   = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent    = all.filter((i) => new Date(i.updated_at) > weekAgo).length;
    return { total: all.length, mangas: history.mangas.length, novels: history.novels.length, recent };
  }, [history]);

  const filtered = useMemo(() => {
    let mangas = [...history.mangas];
    let novels = [...history.novels];

    if (filterType === 'mangas') novels = [];
    if (filterType === 'novels') mangas = [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      mangas = mangas.filter((i) => i.manga?.title?.toLowerCase().includes(term));
      novels = novels.filter((i) => i.novel?.title?.toLowerCase().includes(term));
    }

    const sort = (items, getTitle, getDate) => items.sort((a, b) => {
      if (sortBy === 'title')    return getTitle(a).localeCompare(getTitle(b));
      if (sortBy === 'progress') return (b.current_chapter?.chapter_number || 0) - (a.current_chapter?.chapter_number || 0);
      return new Date(getDate(b)) - new Date(getDate(a));
    });

    return {
      mangas: sort(mangas, (i) => i.manga?.title || '',  (i) => i.updated_at),
      novels: sort(novels, (i) => i.novel?.title || '',  (i) => i.updated_at),
    };
  }, [history, searchTerm, filterType, sortBy]);

  if (loading) return <Loading fullScreen />;

  const isEmpty         = stats.total === 0;
  const noFilterResults = filtered.mangas.length === 0 && filtered.novels.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0f] py-8">
      <div className="container-custom">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <HistoryIcon className="w-6 h-6 text-primary-500" />
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Histórico
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm ml-9">Continue de onde parou</p>
          </div>
          {!isEmpty && (
            <Button variant="danger" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Limpar
            </Button>
          )}
        </div>

        {/* Stats cards */}
        {!isEmpty && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
            {[
              { label: 'Total de itens',        value: stats.total,  color: 'text-primary-500', bg: 'bg-primary-500/10', icon: BarChart3   },
              { label: 'Mangás',                value: stats.mangas, color: 'text-blue-500',    bg: 'bg-blue-500/10',    icon: BookOpen    },
              { label: 'Novels',                value: stats.novels, color: 'text-purple-500',  bg: 'bg-purple-500/10',  icon: FileText    },
              { label: 'Lidos essa semana',     value: stats.recent, color: 'text-green-500',   bg: 'bg-green-500/10',   icon: Clock       },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div key={label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className={`p-2 rounded-xl ${bg} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div>
                  <p className={`text-xl font-black ${color} tabular-nums`}>{value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filtros */}
        {!isEmpty && (
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-900 dark:text-white placeholder-gray-400" />
            </div>

            {/* Tipo */}
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40">
              <option value="all">Todos os tipos</option>
              <option value="mangas">Apenas Mangás</option>
              <option value="novels">Apenas Novels</option>
            </select>

            {/* Ordenação */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40">
              <option value="recent">Mais recentes</option>
              <option value="title">Por título</option>
              <option value="progress">Por progresso</option>
            </select>
          </div>
        )}

        {/* Conteúdo */}
        {isEmpty ? (
          <EmptyState icon={HistoryIcon} title="Histórico vazio"
            description="Comece a ler para ver seu histórico aqui" />
        ) : noFilterResults ? (
          <EmptyState icon={Search} title="Nenhum resultado"
            description="Tente ajustar os filtros de busca" />
        ) : (
          <div className="space-y-8">
            {/* Mangás */}
            {filtered.mangas.length > 0 && (
              <section>
                {filterType === 'all' && (
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Mangás
                    <span className="text-sm font-normal text-gray-400">({filtered.mangas.length})</span>
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filtered.mangas.map((item) => (
                    <HistoryCard key={item.id} item={item} type="manga" onRemove={handleRemove} />
                  ))}
                </div>
              </section>
            )}

            {/* Novels */}
            {filtered.novels.length > 0 && (
              <section>
                {filterType === 'all' && (
                  <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Novels
                    <span className="text-sm font-normal text-gray-400">({filtered.novels.length})</span>
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filtered.novels.map((item) => (
                    <HistoryCard key={item.id} item={item} type="novel" onRemove={handleRemove} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── HistoryCard ─────────────────────────────────────────────────── */

const HistoryCard = ({ item, type, onRemove }) => {
  const isManga    = type === 'manga';
  const content    = isManga ? item.manga  : item.novel;
  const chapter    = item.current_chapter;
  const chapterLink = chapter
    ? `/${type}/${content?.id}/chapter/${chapter.id}`
    : `/${type}/${content?.id}`;

  return (
    <div className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all flex gap-4">

      {/* Capa */}
      <Link to={`/${type}/${content?.id}`} className="flex-shrink-0">
        <div className="w-16 h-24 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800">
          <img src={getImageUrl(content?.cover_image)} alt={content?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/64x96?text=N/A'; }} />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/${type}/${content?.id}`}
          className="font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1 leading-tight">
          {content?.title}
        </Link>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDateTime(item.updated_at)}
        </p>

        {chapter && (
          <Link to={chapterLink}
            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Play className="w-3 h-3" />
            Continuar — Cap. {normalizeChNum(chapter.chapter_number)}
            {chapter.title && <span className="font-normal opacity-70"> — {chapter.title}</span>}
            <ChevronRight className="w-3 h-3 ml-auto" />
          </Link>
        )}

        {isManga && item.last_page && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Página {item.last_page}</p>
        )}
      </div>

      {/* Botão remover */}
      <button onClick={() => onRemove(item.id, `${type}s`)}
        className="absolute top-3 right-3 w-7 h-7 bg-red-500/0 hover:bg-red-500 border border-transparent hover:border-red-600 text-transparent hover:text-white rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
        title="Remover do histórico">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default History;