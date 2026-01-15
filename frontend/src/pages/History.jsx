import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, BookOpen, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { readingHistoryService } from '../services/readingHistoryService';
import { getImageUrl, formatDateTime } from '../utils/formatters';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';

const History = () => {
  const [history, setHistory] = useState({ mangas: [], novels: [] });
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <Loading fullScreen />;
  }

  const isEmpty = history.mangas.length === 0 && history.novels.length === 0;

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

      {isEmpty ? (
        <EmptyState
          icon={HistoryIcon}
          title="Histórico vazio"
          description="Comece a ler mangás e novels para ver seu histórico aqui"
        />
      ) : (
        <div className="space-y-8">
          {/* Mangás */}
          {history.mangas.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Mangás
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.mangas.map((item) => (
                  <HistoryMangaCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Novels */}
          {history.novels.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Novels
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.novels.map((item) => (
                  <HistoryNovelCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const HistoryMangaCard = ({ item }) => (
  <Card className="p-4 hover:shadow-lg transition bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
              Continuar: Cap. {item.current_chapter.chapter_number}
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

const HistoryNovelCard = ({ item }) => (
  <Card className="p-4 hover:shadow-lg transition bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
              Continuar: Cap. {item.current_chapter.chapter_number}
              {item.current_chapter.title && ` - ${item.current_chapter.title}`}
            </Link>
          </div>
        )}
      </div>
    </div>
  </Card>
);

export default History;