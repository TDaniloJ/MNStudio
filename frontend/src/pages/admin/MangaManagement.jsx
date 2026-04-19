import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Search, List, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../../services/mangaService';
import { getImageUrl, formatNumber, formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const STATUS_STYLE = {
  ongoing:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  completed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  hiatus:    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
};
const STATUS_LABEL = { ongoing: 'Ativo', completed: 'Completo', hiatus: 'Hiato' };

const MangaManagement = () => {
  const navigate = useNavigate();
  const { page, goToPage } = usePagination();
  const [mangas,      setMangas]      = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, pages: 1 });
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [chaptersCount, setChaptersCount] = useState({});
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => { loadMangas(); }, [page, debouncedSearch]);

  const loadMangas = async () => {
    setLoading(true);
    try {
      const data = await mangaService.getAll({ page, limit: 20, search: debouncedSearch });
      setMangas(data.mangas);
      setPagination(data.pagination);
      loadChaptersCount(data.mangas);
    } catch { toast.error('Erro ao carregar mangás'); }
    finally { setLoading(false); }
  };

  const loadChaptersCount = async (list) => {
    const counts = {};
    for (const m of (list || [])) {
      try { const d = await mangaService.getMangaChapters(m.id); counts[`manga_${m.id}`] = d.chapters?.length || 0; }
      catch { counts[`manga_${m.id}`] = 0; }
    }
    setChaptersCount(counts);
  };

  const getChapCount = (manga) => {
    const v = chaptersCount[`manga_${manga.id}`];
    return v !== undefined ? v : '…';
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Deletar "${title}"?`)) return;
    try { await mangaService.delete(id); toast.success('Mangá deletado'); loadMangas(); }
    catch { toast.error('Erro ao deletar mangá'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Mangás</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.total} mangá{pagination.total !== 1 ? 's' : ''} cadastrado{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/admin/mangas/new">
          <Button size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Novo Mangá
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar mangás..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {loading ? <Loading /> : mangas.length === 0 ? (
        <EmptyState icon={BookOpen} title="Nenhum mangá encontrado" description="Comece criando seu primeiro mangá" />
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                    {['Mangá', 'Status', 'Tipo', 'Capítulos', 'Views', 'Criado em', ''].map((h) => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 ${h === '' ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {mangas.map((manga) => (
                    <tr key={manga.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                      {/* Título */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                            <img src={getImageUrl(manga.cover_image)} alt={manga.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/36x48?text=N/A'; }} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">{manga.title}</p>
                            {manga.author && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{manga.author}</p>}
                          </div>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-lg ${STATUS_STYLE[manga.status] ?? STATUS_STYLE.hiatus}`}>
                          {STATUS_LABEL[manga.status] ?? manga.status}
                        </span>
                      </td>
                      {/* Tipo */}
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 capitalize">{manga.type}</td>
                      {/* Capítulos */}
                      <td className="px-4 py-3">
                        {getChapCount(manga) === '…'
                          ? <span className="text-gray-300 dark:text-gray-600 text-xs">…</span>
                          : <span className="font-medium text-gray-900 dark:text-white tabular-nums">{getChapCount(manga)}</span>}
                      </td>
                      {/* Views */}
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 tabular-nums">{formatNumber(manga.views)}</td>
                      {/* Data */}
                      <td className="px-4 py-3 text-gray-400 dark:text-gray-500 whitespace-nowrap">{formatDate(manga.created_at)}</td>
                      {/* Ações */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ActionBtn to={`/admin/mangas/${manga.id}/chapters`} title="Capítulos"><List className="w-4 h-4" /></ActionBtn>
                          <ActionBtn to={`/manga/${manga.id}`} title="Ver"><Eye className="w-4 h-4" /></ActionBtn>
                          <ActionBtn to={`/admin/mangas/${manga.id}/edit`} title="Editar"><Edit className="w-4 h-4" /></ActionBtn>
                          <button onClick={() => handleDelete(manga.id, manga.title)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Deletar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={goToPage} />
        </>
      )}
    </div>
  );
};

const ActionBtn = ({ to, title, children }) => (
  <Link to={to} title={title}>
    <button className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
      {children}
    </button>
  </Link>
);

export default MangaManagement;