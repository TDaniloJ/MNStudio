import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Eye, 
  Calendar, 
  User, 
  Heart, 
  Share2,
  ArrowLeft,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  PauseCircle,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNovelStore } from '../store/novelStore';
import { favoriteService } from '../services/favoriteService';
import { useAuthStore } from '../store/authStore';
import { getImageUrl, formatDate, formatNumber } from '../utils/formatters';
import { ratingService } from '../services/ratingService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const NovelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNovel, loading, fetchNovelById, clearCurrentNovel } = useNovelStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    const loadNovel = async () => {
      try {
        await fetchNovelById(id);
      } catch {
        toast.error('Erro ao carregar novel');
        navigate('/novels');
      }
    };

    loadNovel();
    return () => clearCurrentNovel();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const checkFavoriteStatus = async () => {
      if (isAuthenticated && currentNovel) {
        try {
          const data = await favoriteService.checkFavorite('novel', currentNovel.id);
          setIsFavorite(data);
        } catch (error) {
          console.error('Erro ao verificar favorito:', error);
        }
      } else {
        setIsFavorite(false);
      }
    };

    checkFavoriteStatus();
  }, [isAuthenticated, currentNovel]);

  useEffect(() => {
    const loadRatings = async () => {
      if (!currentNovel) return;

      try {
        const res = await ratingService.getRatings('novel', currentNovel.id);
        if (res.ratings?.length > 0) {
          const me = res.ratings.find(r => r.user_id === (user?.id || 0));
          if (me) setUserRating(me.score);
        }
      } catch {}
    };

    loadRatings();
  }, [currentNovel, user?.id]);

  if (!loading && !currentNovel) {
    return (
      <div className="p-10 text-center">
        Novel não encontrada 😢
      </div>
    );
  }

  const loadNovel = async () => {
    try {
      await fetchNovelById(id);
    } catch (error) {
      toast.error('Erro ao carregar novel');
      navigate('/novels');
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar aos favoritos');
      navigate('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await favoriteService.removeFavorite('novel', id);
        setIsFavorite(false);
        toast.success('Removido dos favoritos');
      } else {
        await favoriteService.addFavorite('novel', id);
        setIsFavorite(true);
        toast.success('Adicionado aos favoritos');
      }
    } catch {
      toast.error('Erro ao atualizar favoritos');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentNovel?.title,
        text: currentNovel?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    }
  };

  if (loading || !currentNovel) {
    return <Loading fullScreen />;
  }

  const sortedChapters = [...(currentNovel.chapters || [])].sort((a, b) => {
    const aNum = parseFloat(a.chapter_number);
    const bNum = parseFloat(b.chapter_number);
    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const imageUrl = getImageUrl(currentNovel.cover_image);

  const getStatusIcon = () => {
    switch (currentNovel.status) {
      case 'ongoing':
        return <Play className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'hiatus':
        return <PauseCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (currentNovel.status) {
      case 'ongoing':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'hiatus':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (currentNovel.status) {
      case 'ongoing':
        return 'Em Andamento';
      case 'completed':
        return 'Completo';
      case 'hiatus':
        return 'Em Hiato';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* HERO IGUAL AO DO MANGA */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden dark:from-gray-800 dark:to-gray-900">
        {!imageError && imageUrl && (
          <div 
            className="absolute inset-0 opacity-20 blur-2xl"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        <div className="relative container-custom py-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 bg-white/10 hover:bg-white/20 text-white border-0 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col md:flex-row gap-8">

            {/* IMAGEM */}
            <div className="flex-shrink-0">
              <div className="w-full md:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-white/10">
                {!imageError && imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={currentNovel.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <BookOpen className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>
            </div>

            {/* INFO PRINCIPAL */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                {currentNovel.title}
              </h1>

              {currentNovel.alternative_titles?.length > 0 && (
                <p className="text-gray-300 text-lg mb-6 italic">
                  {currentNovel.alternative_titles.join(' • ')}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mb-6">

                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor()}`}>
                  {getStatusIcon()}
                  {getStatusText()}
                </span>

                <span className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-full font-semibold uppercase text-sm dark:bg-primary-500 dark:text-white">
                  Novel
                </span>

                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <Eye className="w-4 h-4" />
                  {formatNumber(currentNovel.views)} views
                </span>

                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <BookOpen className="w-4 h-4" />
                  {sortedChapters.length} capítulos
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {currentNovel.genres?.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/novels?genre=${genre.id}`}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Autor:</span>
                  <span className="font-medium">{currentNovel.author}</span>
                </div>
              </div>

              {/* AÇÕES */}
              <div className="flex flex-wrap gap-3">
                {sortedChapters.length > 0 && (
                  <Link to={`/novel/${currentNovel.id}/chapter/${sortedChapters[0].id}`}>
                    <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                      <Play className="w-5 h-5 mr-2" />
                      Começar a Ler
                    </Button>
                  </Link>
                )}

                <Button
                  variant={isFavorite ? 'danger' : 'secondary'}
                  size="lg"
                  onClick={handleFavorite}
                  loading={favoriteLoading}
                  className={isFavorite ? '' : 'bg-white/10 hover:bg-white/20 border-0'}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleShare}
                  className="bg-white/10 hover:bg-white/20 border-0"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* COLUNA PRINCIPAL */}
          <div className="lg:col-span-2 space-y-6">

            {/* Sinopse */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
                <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Sinopse
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line dark:text-gray-300">
                  {currentNovel.description || 'Sem descrição disponível.'}
                </p>
              </div>
            </Card>

            {/* LISTA DE CAPÍTULOS */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 dark:text-white">
                  <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  Capítulos
                  <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                    ({sortedChapters.length})
                  </span>
                </h2>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
                </Button>
              </div>

              {sortedChapters.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4 dark:text-gray-600" />
                  <p className="text-gray-500 text-lg dark:text-gray-400">Nenhum capítulo disponível ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedChapters.map((chapter) => (
                    <Link
                      key={chapter.id}
                      to={`/novel/${currentNovel.id}/chapter/${chapter.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-all group border border-transparent hover:border-primary-200 dark:hover:bg-gray-800 dark:hover:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors dark:bg-primary-900 dark:text-primary-400 dark:group-hover:bg-primary-500 dark:group-hover:text-white">
                          {chapter.chapter_number}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors dark:text-white">
                            Capítulo {chapter.chapter_number}
                            {chapter.title && ` - ${chapter.title}`}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(chapter.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {formatNumber(chapter.views)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Play className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors dark:text-gray-500" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* SIDEBAR IGUAL */}
          <div className="space-y-6">

            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg dark:text-white">Informações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2 dark:text-gray-400">
                    <BookOpen className="w-4 h-4" />
                    Capítulos
                  </span>
                  <span className="font-semibold">{sortedChapters.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2 dark:text-gray-400">
                    <Eye className="w-4 h-4" />
                    Visualizações
                  </span>
                  <span className="font-semibold">
                    {formatNumber(currentNovel.views)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2  dark:text-gray-400">
                    <Star className="w-4 h-4" />
                    Avaliação
                  </span>
                  <span className="font-semibold">
                      {(() => {
                        const ratingValue = Number(currentNovel.rating) || 0;
                        return ratingValue > 0 ? ratingValue.toFixed(1) : 'N/A';
                      })()}
                    </span>
                </div>
                {/* Rating UI */}
                <div className="mt-2 flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      key={s}
                      onClick={async () => {
                        if (!isAuthenticated) {
                          toast.error('Faça login para avaliar');
                          navigate('/login');
                          return;
                        }
                        try {
                          setRatingLoading(true);
                          await ratingService.submitRating('novel', currentNovel.id, s);
                          await fetchNovelById(id);
                          setUserRating(s);
                          toast.success('Avaliação enviada');
                        } catch (err) {
                          toast.error('Erro ao enviar avaliação');
                        } finally {
                          setRatingLoading(false);
                        }
                      }}
                      className={`transform transition duration-150 ${userRating >= s ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110`}
                      disabled={ratingLoading}
                      aria-label={`Avaliar ${s} estrelas`}
                      title={`Avaliar ${s} estrelas`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    Status
                  </span>
                  <span className={`font-semibold ${
                    currentNovel.status === 'ongoing' ? 'text-green-600' :
                    currentNovel.status === 'completed' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </Card>

            {currentNovel.uploader && (
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg dark:text-white">Enviado por</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg dark:bg-primary-500">
                    {currentNovel.uploader.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{currentNovel.uploader.username}</p>
                    <p className="text-sm text-gray-500">{currentNovel.uploader.role}</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/50 dark:to-primary-800/50">
              <h3 className="font-bold text-gray-900 mb-3 dark:text-white">💡 Dica</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Use as setas do teclado ← → para navegar entre as páginas da novel!
              </p>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelDetail;
