import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Search, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../../services/mangaService';
import { getImageUrl, formatNumber, formatDate } from '../../utils/formatters';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const MangaManagement = () => {
  const navigate = useNavigate();
  const { page, goToPage } = usePagination();
  const [mangas, setMangas] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [chaptersCount, setChaptersCount] = useState({}); // ✅ Estado para contagem

  useEffect(() => {
    loadMangas();
  }, [page, debouncedSearch]);

  const loadMangas = async () => {
    try {
      setLoading(true);
      const data = await mangaService.getAll({
        page,
        limit: 20,
        search: debouncedSearch
      });
      setMangas(data.mangas);
      setPagination(data.pagination);

      // ✅ CARREGA CONTAGEM DE CAPÍTULOS EM BACKGROUND
      loadChaptersCount(data.mangas);
    } catch (error) {
      toast.error('Erro ao carregar mangás');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA CARREGAR CONTAGEM DE CAPÍTULOS
  const loadChaptersCount = async (mangasList) => {
    try {
      const counts = {};

      if (mangasList && mangasList.length > 0) {
        for (const manga of mangasList) {
          try {
            const chaptersData = await mangaService.getMangaChapters(manga.id);
            counts[`manga_${manga.id}`] = chaptersData.chapters?.length || 0;
          } catch (error) {
            console.warn(`⚠️ Não foi possível carregar capítulos do mangá ${manga.id}:`, error.message);
            counts[`manga_${manga.id}`] = 0;
          }
        }
      }

      setChaptersCount(counts);
    } catch (error) {
      console.error('Erro ao carregar contagem de capítulos:', error);
    }
  };

  // ✅ FUNÇÃO PARA OBTER CONTAGEM
  const getChaptersCount = (manga) => {
    const key = `manga_${manga.id}`;
    return chaptersCount[key] !== undefined ? chaptersCount[key] : '...';
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Tem certeza que deseja deletar "${title}"?`)) {
      return;
    }

    try {
      await mangaService.delete(id);
      toast.success('Mangá deletado com sucesso');
      loadMangas();
    } catch (error) {
      toast.error('Erro ao deletar mangá');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Mangás</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {pagination.total} mangá{pagination.total !== 1 ? 's' : ''} cadastrado{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/admin/mangas/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Mangá
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="p-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar mangás..."
        />
      </Card>

      {/* Table */}
      {loading ? (
        <Loading />
      ) : mangas.length === 0 ? (
        <EmptyState
          title="Nenhum mangá encontrado"
          description="Comece criando seu primeiro mangá"
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Mangá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Capítulos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {mangas.map((manga) => (
                    <tr key={manga.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(manga.cover_image)}
                            alt={manga.title}
                            className="w-12 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-12 h-16 flex items-center justify-center bg-gray-300 rounded dark:bg-gray-600">
                                  <svg class="w-6 h-6 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {manga.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {manga.author}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          manga.status === 'ongoing' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                          manga.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        }`}>
                          {manga.status === 'ongoing' ? 'Ativo' :
                           manga.status === 'completed' ? 'Completo' : 'Hiato'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 capitalize dark:text-white">
                        {manga.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {/* ✅ ATUALIZADO PARA USAR A NOVA CONTAGEM */}
                        {getChaptersCount(manga) === '...' ? (
                          <span className="text-gray-400 dark:text-gray-500">Carregando...</span>
                        ) : (
                          getChaptersCount(manga)
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {formatNumber(manga.views)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(manga.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/mangas/${manga.id}/chapters`}>
                            <button 
                              className="p-2 text-gray-600 hover:text-primary-600 transition dark:hover:text-primary-400"
                              title="Gerenciar capítulos"
                            >
                              <List className="w-4 h-4" />
                            </button>
                          </Link>
                          
                          <Link to={`/manga/${manga.id}`}>
                            <button className="p-2 text-gray-600 hover:text-primary-600 transition dark:hover:text-primary-400">
                              <Eye className="w-4 h-4" />
                            </button>
                          </Link>

                          <Link to={`/admin/mangas/${manga.id}/edit`}>
                            <button className="p-2 text-gray-600 hover:text-primary-600 transition dark:hover:text-primary-400">
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(manga.id, manga.title)}
                            className="p-2 text-gray-600 hover:text-red-600 transition dark:hover:text-red-400"
                          >
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

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={goToPage}
          />
        </>
      )}
    </div>
  );
};

export default MangaManagement;