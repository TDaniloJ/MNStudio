import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, X, BookOpen, FileText, TrendingUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../services/mangaService';
import { novelService } from '../services/novelService';
import { genreService } from '../services/genreService';
import { getImageUrl, formatNumber } from '../utils/formatters';
import { STATUS_OPTIONS, TYPE_OPTIONS, SORT_OPTIONS } from '../utils/constants';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import Loading from '../components/common/Loading';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import Select from '../components/common/Select';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, goToPage } = usePagination();

  const [results,     setResults]     = useState({ mangas: [], novels: [] });
  const [loading,     setLoading]     = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [genres,      setGenres]      = useState([]);
  const [pagination,  setPagination]  = useState({ total: 0, pages: 1 });

  const [searchQuery,   setSearchQuery]   = useState(searchParams.get('q')         || '');
  const [contentType,   setContentType]   = useState(searchParams.get('type')      || 'all');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre')     || '');
  const [status,        setStatus]        = useState(searchParams.get('status')    || '');
  const [mangaType,     setMangaType]     = useState(searchParams.get('mangaType') || '');
  const [sort,          setSort]          = useState(searchParams.get('sort')       || 'created_at');

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => { loadGenres(); }, []);

  useEffect(() => {
    if (debouncedSearch || contentType !== 'all' || selectedGenre || status || mangaType) {
      performSearch();
      updateURL();
    }
  }, [debouncedSearch, contentType, selectedGenre, status, mangaType, sort, page]);

  const loadGenres = async () => {
    try { const d = await genreService.getAll(); setGenres(d.genres); }
    catch { console.error('Erro ao carregar gêneros'); }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, search: debouncedSearch, genre: selectedGenre || undefined, status: status || undefined, sort };
      let mData = { mangas: [], pagination: { total: 0, pages: 1 } };
      let nData = { novels: [], pagination: { total: 0, pages: 1 } };

      if (contentType === 'all' || contentType === 'manga')
        mData = await mangaService.getAll({ ...params, type: mangaType || undefined });
      if (contentType === 'all' || contentType === 'novel')
        nData = await novelService.getAll(params);

      setResults({ mangas: mData.mangas || [], novels: nData.novels || [] });
      setPagination({
        total: (mData.pagination?.total || 0) + (nData.pagination?.total || 0),
        pages: Math.max(mData.pagination?.pages || 1, nData.pagination?.pages || 1),
      });
    } catch { toast.error('Erro ao pesquisar'); }
    finally { setLoading(false); }
  };

  const updateURL = () => {
    const p = new URLSearchParams();
    if (debouncedSearch)       p.set('q',         debouncedSearch);
    if (contentType !== 'all') p.set('type',       contentType);
    if (selectedGenre)         p.set('genre',      selectedGenre);
    if (status)                p.set('status',     status);
    if (mangaType)             p.set('mangaType',  mangaType);
    if (sort !== 'created_at') p.set('sort',       sort);
    if (page > 1)              p.set('page',       page);
    setSearchParams(p);
  };

  const clearFilters = () => {
    setSearchQuery(''); setContentType('all'); setSelectedGenre('');
    setStatus(''); setMangaType(''); setSort('created_at');
    goToPage(1); setSearchParams({});
  };

  const hasFilters = selectedGenre || status || (contentType === 'manga' && mangaType) || contentType !== 'all';
  const totalResults = results.mangas.length + results.novels.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0f] py-8">
      <div className="container-custom">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">Pesquisar</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Encontre seus mangás e novels favoritos</p>
        </div>

        {/* Search + filtros */}
        <div className="mb-5">
          <div className="flex gap-3">
            {/* Input */}
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, autor..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400/50 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
              />
            </div>

            {/* Botão filtros */}
            <button onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                showFilters || hasFilters
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}>
              <Filter className="w-4 h-4" />
              Filtros
              {hasFilters && (
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Painel de filtros */}
        {showFilters && (
          <div className="mb-6 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-5">

            {/* Tipo de conteúdo */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2.5">Tipo de Conteúdo</p>
              <div className="flex gap-2">
                {[
                  { value: 'all',   label: 'Todos',  icon: null       },
                  { value: 'manga', label: 'Mangás', icon: BookOpen   },
                  { value: 'novel', label: 'Novels', icon: FileText   },
                ].map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => setContentType(value)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      contentType === value
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}>
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField label="Gênero" value={selectedGenre} onChange={setSelectedGenre}
                options={[{ value: '', label: 'Todos os gêneros' }, ...genres.map((g) => ({ value: g.id, label: g.name }))]} />
              <SelectField label="Status" value={status} onChange={setStatus}
                options={[{ value: '', label: 'Qualquer status' }, ...STATUS_OPTIONS]} />
              {contentType !== 'novel' && (
                <SelectField label="Tipo de Mangá" value={mangaType} onChange={setMangaType}
                  options={[{ value: '', label: 'Qualquer tipo' }, ...TYPE_OPTIONS]} />
              )}
              <SelectField label="Ordenar por" value={sort} onChange={setSort} options={SORT_OPTIONS} />
            </div>

            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
                <X className="w-3.5 h-3.5" />
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {/* Info de resultados */}
        {(debouncedSearch || hasFilters) && !loading && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {pagination.total > 0 ? (
              <>
                <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span>
                {' '}resultado{pagination.total !== 1 ? 's' : ''}
                {debouncedSearch && <> para "<span className="font-semibold text-gray-900 dark:text-white">{debouncedSearch}</span>"</>}
              </>
            ) : 'Nenhum resultado encontrado'}
          </p>
        )}

        {loading ? <Loading /> : (
          <>
            {/* Mangás */}
            {results.mangas.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-500" />
                  Mangás
                  <span className="text-sm font-normal text-gray-400">({results.mangas.length})</span>
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                  {results.mangas.map((manga) => (
                    <ResultCard key={`manga-${manga.id}`} item={manga} type="manga" />
                  ))}
                </div>
              </section>
            )}

            {/* Novels */}
            {results.novels.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-500" />
                  Novels
                  <span className="text-sm font-normal text-gray-400">({results.novels.length})</span>
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
                  {results.novels.map((novel) => (
                    <ResultCard key={`novel-${novel.id}`} item={novel} type="novel" />
                  ))}
                </div>
              </section>
            )}

            {totalResults === 0 && (debouncedSearch || hasFilters) && (
              <EmptyState icon={SearchIcon} title="Nenhum resultado" description="Tente ajustar os filtros ou usar termos diferentes" />
            )}
            {totalResults === 0 && !debouncedSearch && !hasFilters && (
              <EmptyState icon={SearchIcon} title="Comece sua pesquisa" description="Digite algo ou use os filtros para encontrar conteúdo" />
            )}

            {pagination.pages > 1 && (
              <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={goToPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ── Subcomponentes ──────────────────────────────────────────────── */

const ResultCard = ({ item, type }) => {
  const [imgErr, setImgErr] = useState(false);
  const imageUrl = getImageUrl(item.cover_image);

  return (
    <Link to={`/${type}/${item.id}`} className="group flex flex-col gap-2">
      <div className="relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-sm group-hover:shadow-lg transition-all"
        style={{ aspectRatio: '2/3' }}>
        {!imgErr && imageUrl ? (
          <img src={imageUrl} alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
            <BookOpen className="w-8 h-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          type === 'manga'
            ? 'bg-blue-600/90 text-white'
            : 'bg-purple-600/90 text-white'
        }`}>
          {type === 'manga' ? 'M' : 'N'}
        </span>
      </div>
      <div className="px-0.5">
        <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {item.title}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
          <TrendingUp className="w-2.5 h-2.5" />
          {formatNumber(item.views)}
        </p>
      </div>
    </Link>
  );
};

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 transition">
      {options.map(({ value: v, label: l }) => (
        <option key={v} value={v}>{l}</option>
      ))}
    </select>
  </div>
);

export default Search;