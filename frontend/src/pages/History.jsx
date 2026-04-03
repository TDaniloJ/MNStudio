import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, BookOpen, FileText, Trash2, Search, Filter, Calendar, Clock, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { readingHistoryService } from '../services/readingHistoryService';
import { getImageUrl, formatDateTime } from '../utils/formatters';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';

const normalizeChapterNumber = (chapterNumber) => {
  if (chapterNumber === undefined || chapterNumber === null) return '';

  const parsed = Number(chapterNumber);
  if (Number.isNaN(parsed)) return String(chapterNumber);

  if (Number.isInteger(parsed)) {
    return String(parsed);
  }

  return String(parsed).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
};

const History = () => {
  const [history, setHistory] = useState({ mangas: [], novels: [] });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'mangas', 'novels'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'title', 'progress'

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await readingHistoryService.getHistory();
      setHistory(data.history);
    } catch (error) {
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId, type) => {
    if (!confirm(`Tem certeza que deseja remover este item do histórico?`)) {
      return;
    }

    try {
      await readingHistoryService.removeFromHistory(itemId, type);
      toast.success('Item removido do histórico');
      
      // Atualizar o estado local
      setHistory(prev => ({
        ...prev,
        [type]: prev[type].filter(item => item.id !== itemId)
      }));
    } catch (error) {
      toast.error('Erro ao remover item do histórico');
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Tem certeza que deseja limpar todo o histórico?')) {
      return;
    }

    try {
      await readingHistoryService.clearHistory();
      toast.success('Histórico limpo com sucesso');
      setHistory({ mangas: [], novels: [] });
    } catch (error) {
      toast.error('Erro ao limpar histórico');
    }
  };

  const normalizeChapterNumber = (chapterNumber) => {
    if (chapterNumber === undefined || chapterNumber === null) return '';

    const parsed = Number(chapterNumber);
    if (Number.isNaN(parsed)) return String(chapterNumber);

    if (Number.isInteger(parsed)) {
      return String(parsed);
    }

    // Remove 0 final de float tipo 1.50 => 1.5, 1.0 => 1 (se não entrar no integer)
    return String(parsed).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  };

  // Filtragem e ordenação dos dados
  const filteredHistory = useMemo(() => {
    let mangas = [...history.mangas];
    let novels = [...history.novels];

    // Filtro por tipo
    if (filterType === 'mangas') novels = [];
    if (filterType === 'novels') mangas = [];

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      mangas = mangas.filter(item =>
        item.manga?.title?.toLowerCase().includes(term) ||
        item.current_chapter?.title?.toLowerCase().includes(term)
      );
      novels = novels.filter(item =>
        item.novel?.title?.toLowerCase().includes(term) ||
        item.current_chapter?.title?.toLowerCase().includes(term)
      );
    }

    // Ordenação
    const sortItems = (items, getTitle, getDate) => {
      return items.sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return getTitle(a).localeCompare(getTitle(b));
          case 'progress':
            // Ordena por capítulo atual (mais avançado primeiro)
            const chapA = a.current_chapter?.chapter_number || 0;
            const chapB = b.current_chapter?.chapter_number || 0;
            return chapB - chapA;
          case 'recent':
          default:
            return new Date(getDate(b)) - new Date(getDate(a));
        }
      });
    };

    mangas = sortItems(mangas, item => item.manga?.title || '', item => item.updated_at);
    novels = sortItems(novels, item => item.novel?.title || '', item => item.updated_at);

    return { mangas, novels };
  }, [history, searchTerm, filterType, sortBy]);

  // Estatísticas
  const stats = useMemo(() => {
    const totalItems = history.mangas.length + history.novels.length;
    const totalMangas = history.mangas.length;
    const totalNovels = history.novels.length;
    const recentReads = [...history.mangas, ...history.novels]
      .filter(item => {
        const date = new Date(item.updated_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date > weekAgo;
      }).length;

    return { totalItems, totalMangas, totalNovels, recentReads };
  }, [history]);

  if (loading) {
    return <Loading fullScreen />;
  }

  const isEmpty = history.mangas.length === 0 && history.novels.length === 0;
  const hasFilteredResults = filteredHistory.mangas.length === 0 && filteredHistory.novels.length === 0;

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Histórico de Leitura
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Continue de onde parou
          </p>
        </div>
        {!isEmpty && (
          <Button
            variant="danger"
            onClick={handleClearHistory}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Histórico
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      {!isEmpty && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalItems}</div>
            <div className="text-sm text-blue-600/70 dark:text-blue-400/70">Total de itens</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalMangas}</div>
            <div className="text-sm text-green-600/70 dark:text-green-400/70">Mangás</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <FileText className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalNovels}</div>
            <div className="text-sm text-purple-600/70 dark:text-purple-400/70">Novels</div>
          </Card>
          <Card className="p-4 text-center bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.recentReads}</div>
            <div className="text-sm text-orange-600/70 dark:text-orange-400/70">Lidos recentemente</div>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      {!isEmpty && (
        <Card className="p-4 mb-6 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por título ou capítulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Filtro por tipo */}
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Todos os tipos</option>
                <option value="mangas">Apenas Mangás</option>
                <option value="novels">Apenas Novels</option>
              </select>

              {/* Ordenação */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="recent">Mais recentes</option>
                <option value="title">Por título</option>
                <option value="progress">Por progresso</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {isEmpty ? (
        <EmptyState
          icon={HistoryIcon}
          title="Histórico vazio"
          description="Comece a ler mangás e novels para ver seu histórico aqui"
        />
      ) : hasFilteredResults ? (
        <EmptyState
          icon={Search}
          title="Nenhum resultado encontrado"
          description="Tente ajustar os filtros de busca"
        />
      ) : (
        <div className="space-y-8">
          {/* Mangás */}
          {filteredHistory.mangas.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Mangás ({filteredHistory.mangas.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHistory.mangas.map((item) => (
                  <HistoryMangaCard key={item.id} item={item} onRemove={handleRemoveItem} />
                ))}
              </div>
            </div>
          )}

          {/* Novels */}
          {filteredHistory.novels.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Novels ({filteredHistory.novels.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHistory.novels.map((item) => (
                  <HistoryNovelCard key={item.id} item={item} onRemove={handleRemoveItem} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const HistoryMangaCard = ({ item, onRemove }) => (
  <Card className="p-4 hover:shadow-lg transition bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative group">
    <button
      onClick={(e) => {
        e.preventDefault();
        onRemove(item.id, 'mangas');
      }}
      className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
      title="Remover do histórico"
    >
      <Trash2 className="w-3 h-3" />
    </button>
    <div className="flex gap-4">
      <Link to={`/manga/${item.manga?.id}`} className="flex-shrink-0">
        <img
          src={getImageUrl(item.manga?.cover_image)}
          alt={item.manga?.title}
          className="w-24 h-32 object-cover rounded"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150x200?text=No+Image';
          }}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link 
          to={`/manga/${item.manga?.id}`}
          className="font-semibold text-lg text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 transition-colors"
        >
          {item.manga?.title}
        </Link>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Última leitura: {formatDateTime(item.updated_at)}
        </p>

        {item.current_chapter && (
          <div className="mt-3">
            <Link
              to={`/manga/${item.manga?.id}/chapter/${item.current_chapter.id}`}
              className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Continuar: Cap. {normalizeChapterNumber(item.current_chapter.chapter_number)}
              {item.current_chapter.title && ` - ${item.current_chapter.title}`}
            </Link>
            {item.last_page && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Página {item.last_page}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  </Card>
);

const HistoryNovelCard = ({ item, onRemove }) => (
  <Card className="p-4 hover:shadow-lg transition bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative group">
    <button
      onClick={(e) => {
        e.preventDefault();
        onRemove(item.id, 'novels');
      }}
      className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
      title="Remover do histórico"
    >
      <Trash2 className="w-3 h-3" />
    </button>
    <div className="flex gap-4">
      <Link to={`/novel/${item.novel?.id}`} className="flex-shrink-0">
        <img
          src={getImageUrl(item.novel?.cover_image)}
          alt={item.novel?.title}
          className="w-24 h-32 object-cover rounded"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150x200?text=No+Image';
          }}
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link 
          to={`/novel/${item.novel?.id}`}
          className="font-semibold text-lg text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-2 transition-colors"
        >
          {item.novel?.title}
        </Link>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Última leitura: {formatDateTime(item.updated_at)}
        </p>

        {item.current_chapter && (
          <div className="mt-3">
            <Link
              to={`/novel/${item.novel?.id}/chapter/${item.current_chapter.id}`}
              className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              <FileText className="w-4 h-4" />
              Continuar: Cap. {normalizeChapterNumber(item.current_chapter.chapter_number)}
              {item.current_chapter.title && ` - ${item.current_chapter.title}`}
            </Link>
          </div>
        )}
      </div>
    </div>
  </Card>
);

export default History;