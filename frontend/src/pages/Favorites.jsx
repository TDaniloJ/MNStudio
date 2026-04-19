import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, FileText, TrendingUp, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { favoriteService } from '../services/favoriteService';
import { getImageUrl, formatNumber } from '../utils/formatters';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';

const TABS = [
  { id: 'all',   label: 'Todos'  },
  { id: 'manga', label: 'Mangás' },
  { id: 'novel', label: 'Novels' },
];

const Favorites = () => {
  const [favorites, setFavorites] = useState({ mangas: [], novels: [] });
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { loadFavorites(); }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await favoriteService.getUserFavorites();
      setFavorites(data.favorites);
    } catch { toast.error('Erro ao carregar favoritos'); }
    finally { setLoading(false); }
  };

  const handleRemove = async (type, id) => {
    try {
      await favoriteService.removeFavorite(type, id);
      toast.success('Removido dos favoritos');
      loadFavorites();
    } catch { toast.error('Erro ao remover favorito'); }
  };

  const visibleMangas = activeTab === 'all' || activeTab === 'manga' ? favorites.mangas : [];
  const visibleNovels = activeTab === 'all' || activeTab === 'novel' ? favorites.novels : [];
  const total         = favorites.mangas.length + favorites.novels.length;
  const isEmpty       = total === 0;

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0f] py-8">
      <div className="container-custom">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Meus Favoritos
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm ml-9">
            {total > 0 ? `${total} obra${total !== 1 ? 's' : ''} salva${total !== 1 ? 's' : ''}` : 'Seus favoritos em um só lugar'}
          </p>
        </div>

        {isEmpty ? (
          <EmptyState icon={Heart} title="Nenhum favorito ainda"
            description="Comece a adicionar seus mangás e novels favoritos" />
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 mb-7 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-fit">
              {TABS.map(({ id, label }) => {
                const count = id === 'all' ? total : id === 'manga' ? favorites.mangas.length : favorites.novels.length;
                return (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                      activeTab === id
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}>
                    {label}
                    <span className={`ml-1.5 text-xs font-normal ${activeTab === id ? 'text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-10">
              {/* Mangás */}
              {visibleMangas.length > 0 && (
                <section>
                  {activeTab === 'all' && (
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      Mangás
                      <span className="text-sm font-normal text-gray-400">({favorites.mangas.length})</span>
                    </h2>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {visibleMangas.map((manga) => (
                      <FavoriteCard key={manga.id} item={manga} type="manga"
                        onRemove={() => handleRemove('manga', manga.id)} />
                    ))}
                  </div>
                </section>
              )}

              {/* Novels */}
              {visibleNovels.length > 0 && (
                <section>
                  {activeTab === 'all' && (
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      Novels
                      <span className="text-sm font-normal text-gray-400">({favorites.novels.length})</span>
                    </h2>
                  )}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {visibleNovels.map((novel) => (
                      <FavoriteCard key={novel.id} item={novel} type="novel"
                        onRemove={() => handleRemove('novel', novel.id)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── FavoriteCard ─────────────────────────────────────────────────── */

const FavoriteCard = ({ item, type, onRemove }) => {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="group relative flex flex-col gap-2">
      <Link to={`/${type}/${item.id}`}>
        <div className="relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-sm group-hover:shadow-lg transition-all"
          style={{ aspectRatio: '2/3' }}>
          {!imgErr ? (
            <img src={getImageUrl(item.cover_image)} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgErr(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
              <BookOpen className="w-8 h-8" />
            </div>
          )}
          {/* Overlay hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {/* Badge tipo */}
          <span className={`absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
            type === 'manga' ? 'bg-blue-600/90 text-white' : 'bg-purple-600/90 text-white'
          }`}>
            {type === 'manga' ? 'M' : 'N'}
          </span>
        </div>
      </Link>

      {/* Botão remover */}
      <button onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
        title="Remover dos favoritos">
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Título */}
      <div className="px-0.5">
        <Link to={`/${type}/${item.id}`}>
          <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {item.title}
          </p>
        </Link>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
          {item.status}
        </p>
      </div>
    </div>
  );
};

export default Favorites;