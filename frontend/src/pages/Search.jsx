import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, X, BookOpen, FileText, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../services/mangaService';
import { novelService } from '../services/novelService';
import { genreService } from '../services/genreService';
import { getImageUrl, formatNumber } from '../utils/formatters';
import { STATUS_OPTIONS, TYPE_OPTIONS, SORT_OPTIONS } from '../utils/constants';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import Card from '../components/common/Card';
import SearchBar from '../components/common/SearchBar';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, goToPage } = usePagination();

  // Estados
  const [results, setResults] = useState({ mangas: [], novels: [] });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  // Filtros
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [contentType, setContentType] = useState(searchParams.get('type') || 'all'); // all, manga, novel
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [mangaType, setMangaType] = useState(searchParams.get('mangaType') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'created_at');

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    if (debouncedSearch || contentType !== 'all' || selectedGenre || status || mangaType) {
      performSearch();
      updateURL();
    }
  }, [debouncedSearch, contentType, selectedGenre, status, mangaType, sort, page]);

  const loadGenres = async () => {
    try {
      const data = await genreService.getAll();
      setGenres(data.genres);
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 20,
        search: debouncedSearch,
        genre: selectedGenre || undefined,
        status: status || undefined,
        sort
      };

      let mangasData = { mangas: [], pagination: { total: 0, pages: 1 } };
      let novelsData = { novels: [], pagination: { total: 0, pages: 1 } };

      if (contentType === 'all' || contentType === 'manga') {
        mangasData = await mangaService.getAll({
          ...params,
          type: mangaType || undefined
        });
      }

      if (contentType === 'all' || contentType === 'novel') {
        novelsData = await novelService.getAll(params);
      }

      setResults({
        mangas: mangasData.mangas || [],
        novels: novelsData.novels || []
      });

      const totalResults = (mangasData.pagination?.total || 0) + (novelsData.pagination?.total || 0);
      setPagination({
        total: totalResults,
        pages: Math.max(mangasData.pagination?.pages || 1, novelsData.pagination?.pages || 1)
      });
    } catch (error) {
      toast.error('Erro ao pesquisar');
      console.error('Erro na pesquisa:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (contentType !== 'all') params.set('type', contentType);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (status) params.set('status', status);
    if (mangaType) params.set('mangaType', mangaType);
    if (sort !== 'created_at') params.set('sort', sort);
    if (page > 1) params.set('page', page);

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setContentType('all');
    setSelectedGenre('');
    setStatus('');
    setMangaType('');
    setSort('created_at');
    goToPage(1);
    setSearchParams({});
  };

  const totalResults = results.mangas.length + results.novels.length;
  const hasFilters = selectedGenre || status || (contentType === 'manga' && mangaType) || contentType !== 'all';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Pesquisar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Encontre seus mangás e novels favoritos
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por título, autor..."
              />
            </div>
            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {hasFilters && (
                <span className="ml-1 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  •
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-6 mb-6 animate-fadeIn">
            <div className="space-y-4">
              {/* Content Type Tabs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Conteúdo
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setContentType('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      contentType === 'all'
                        ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setContentType('manga')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      contentType === 'manga'
                        ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Mangás
                  </button>
                  <button
                    onClick={() => setContentType('novel')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      contentType === 'novel'
                        ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Novels
                  </button>
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Genre Filter */}
                <Select
                  label="Gênero"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  options={genres.map(g => ({ value: g.id, label: g.name }))}
                />

                {/* Status Filter */}
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={STATUS_OPTIONS}
                />

                {/* Manga Type Filter */}
                {contentType !== 'novel' && (
                  <Select
                    label="Tipo de Mangá"
                    value={mangaType}
                    onChange={(e) => setMangaType(e.target.value)}
                    options={TYPE_OPTIONS}
                  />
                )}

                {/* Sort */}
                <Select
                  label="Ordenar por"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  options={SORT_OPTIONS}
                />
              </div>

              {/* Clear Filters */}
              {hasFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpar filtros
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Results Info */}
        {(debouncedSearch || hasFilters) && !loading && (
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {pagination.total > 0 ? (
                <>
                  Encontrado{pagination.total !== 1 ? 's' : ''}{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span>{' '}
                  resultado{pagination.total !== 1 ? 's' : ''}
                  {debouncedSearch && (
                    <> para "<span className="font-semibold text-gray-900 dark:text-white">{debouncedSearch}</span>"</>
                  )}
                </>
              ) : (
                'Nenhum resultado encontrado'
              )}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && <Loading />}

        {/* Results */}
        {!loading && (
          <>
            {/* Mangas */}
            {results.mangas.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary-600" />
                  Mangás ({results.mangas.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.mangas.map((manga) => (
                    <ResultCard key={`manga-${manga.id}`} item={manga} type="manga" />
                  ))}
                </div>
              </section>
            )}

            {/* Novels */}
            {results.novels.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary-600" />
                  Novels ({results.novels.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.novels.map((novel) => (
                    <ResultCard key={`novel-${novel.id}`} item={novel} type="novel" />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {totalResults === 0 && (debouncedSearch || hasFilters) && (
              <EmptyState
                icon={SearchIcon}
                title="Nenhum resultado encontrado"
                description="Tente ajustar os filtros ou usar termos diferentes"
              />
            )}

            {/* Initial State */}
            {totalResults === 0 && !debouncedSearch && !hasFilters && (
              <EmptyState
                icon={SearchIcon}
                title="Comece sua pesquisa"
                description="Digite algo na barra de pesquisa ou use os filtros para encontrar conteúdo"
              />
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={pagination.pages}
                onPageChange={goToPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const ResultCard = ({ item, type }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(item.cover_image);

  return (
    <Link to={`/${type}/${item.id}`}>
      <Card hover className="group">
        <div className="aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="mb-2">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
              {type === 'manga' ? 'Mangá' : 'Novel'}
            </span>
          </div>
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-900 dark:text-white">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              {type === 'manga' ? <BookOpen className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {item.chapters?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {formatNumber(item.views)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Search;