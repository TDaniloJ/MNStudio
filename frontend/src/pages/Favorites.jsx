import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, FileText, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { favoriteService } from '../services/favoriteService';
import { getImageUrl, formatNumber } from '../utils/formatters';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';

const Favorites = () => {
  const [favorites, setFavorites] = useState({ mangas: [], novels: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getUserFavorites();
      setFavorites(data.favorites);
    } catch (error) {
      toast.error('Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (type, id) => {
    try {
      await favoriteService.removeFavorite(type, id);
      toast.success('Removido dos favoritos');
      loadFavorites();
    } catch (error) {
      toast.error('Erro ao remover favorito');
    }
  };

  const filteredMangas = activeTab === 'all' || activeTab === 'manga' ? favorites.mangas : [];
  const filteredNovels = activeTab === 'all' || activeTab === 'novel' ? favorites.novels : [];

  if (loading) {
    return <Loading fullScreen />;
  }

  const isEmpty = favorites.mangas.length === 0 && favorites.novels.length === 0;

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Meus Favoritos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Seus mangás e novels favoritos em um só lugar
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'all'
              ? 'border-b-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Todos ({favorites.mangas.length + favorites.novels.length})
        </button>
        <button
          onClick={() => setActiveTab('manga')}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'manga'
              ? 'border-b-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Mangás ({favorites.mangas.length})
        </button>
        <button
          onClick={() => setActiveTab('novel')}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === 'novel'
              ? 'border-b-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Novels ({favorites.novels.length})
        </button>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={Heart}
          title="Nenhum favorito ainda"
          description="Comece a adicionar seus mangás e novels favoritos"
        />
      ) : (
        <div className="space-y-8">
          {/* Mangás */}
          {filteredMangas.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Mangás
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredMangas.map((manga) => (
                  <FavoriteCard
                    key={manga.id}
                    item={manga}
                    type="manga"
                    onRemove={() => handleRemoveFavorite('manga', manga.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Novels */}
          {filteredNovels.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Novels
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredNovels.map((novel) => (
                  <FavoriteCard
                    key={novel.id}
                    item={novel}
                    type="novel"
                    onRemove={() => handleRemoveFavorite('novel', novel.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FavoriteCard = ({ item, type, onRemove }) => (
  <div className="relative group">
    <Link to={`/${type}/${item.id}`}>
      <Card hover className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="aspect-[2/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={getImageUrl(item.cover_image)}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }}
          />
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-gray-900 dark:text-white">
            {item.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              {type === 'manga' ? <BookOpen className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              {item.status}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {formatNumber(item.views || 0)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
    
    <button
      onClick={(e) => {
        e.preventDefault();
        onRemove();
      }}
      className="absolute top-2 right-2 p-2 bg-red-500 dark:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 dark:hover:bg-red-700"
      title="Remover dos favoritos"
    >
      <Heart className="w-4 h-4 fill-current" />
    </button>
  </div>
);

export default Favorites;