import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, TrendingUp, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMangaStore } from '../store/mangaStore';
import { genreService } from '../services/genreService';
import { getImageUrl, formatNumber } from '../utils/formatters';
import { STATUS_OPTIONS, TYPE_OPTIONS, SORT_OPTIONS } from '../utils/constants';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import Card from '../components/common/Card';
import SearchBar from '../components/common/SearchBar';
import Select from '../components/common/Select';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';

const MangaList = () => {
  const { mangas, loading, pagination, fetchMangas } = useMangaStore();
  const { page, goToPage } = usePagination();
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState('created_at');
  const [genres, setGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    loadMangas();
  }, [page, debouncedSearch, status, type, genre, sort]);

  const loadGenres = async () => {
    try {
      const data = await genreService.getAll();
      setGenres(data.genres);
    } catch (error) {
      toast.error('Erro ao carregar gêneros');
    }
  };

  const loadMangas = async () => {
    try {
      await fetchMangas({
        page,
        limit: 20,
        search: debouncedSearch,
        status,
        type,
        genre,
        sort
      });
    } catch (error) {
      toast.error('Erro ao carregar mangás');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
    setGenre('');
    setSort('created_at');
    goToPage(1);
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Mangás
        </h1>
        <p className="text-gray-600">
          Explore nossa coleção de mangás, manhwas e manhuas
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buscar mangás..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center gap-2 whitespace-nowrap"
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <Card className="p-4 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={STATUS_OPTIONS}
              />
              <Select
                label="Tipo"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={TYPE_OPTIONS}
              />
              <Select
                label="Gênero"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                options={genres.map(g => ({ value: g.id, label: g.name }))}
              />
              <Select
                label="Ordenar por"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                options={SORT_OPTIONS}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Limpar filtros
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <Loading />
      ) : mangas.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {mangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>

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

const MangaCard = ({ manga }) => (
  <Link to={`/manga/${manga.id}`}>
    <Card hover className="group">
      <div className="aspect-[2/3] overflow-hidden bg-gray-200">
        <img
          src={getImageUrl(manga.cover_image)}
          alt={manga.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
          }}
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
          {manga.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {manga.chapters?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {formatNumber(manga.views)}
          </span>
        </div>
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
            {manga.type}
          </span>
        </div>
      </div>
    </Card>
  </Link>
);

export default MangaList;