import React, { useEffect, useState, useMemo } from 'react';
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
  Play,
  CalendarDays,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMangaStore } from '../store/mangaStore';
import { ratingService } from '../services/ratingService';
import { favoriteService } from '../services/favoriteService';
import { readingHistoryService } from '../services/readingHistoryService';
import { useAuthStore } from '../store/authStore';
import { getImageUrl, formatDate, formatNumber } from '../utils/formatters';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const MangaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentManga, loading, fetchMangaById, clearCurrentManga } = useMangaStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [lastReadHistory, setLastReadHistory] = useState(null);
  const [lastUpdatedInfo, setLastUpdatedInfo] = useState('');

  const sortedChapters = useMemo(() => {
    const chapters = Array.isArray(currentManga?.chapters) ? currentManga.chapters : [];
    return [...chapters].sort((a, b) => {
      const aNum = Number(a.chapter_number || a.number || a.index || 0);
      const bNum = Number(b.chapter_number || b.number || b.index || 0);
      if (Number.isNaN(aNum) || Number.isNaN(bNum)) return 0;
      return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
    });
  }, [currentManga?.chapters, sortOrder]);

  const imageUrl = getImageUrl(currentManga?.cover_image);

  const loadManga = async () => {
    try {
      await fetchMangaById(id);
    } catch (error) {
      toast.error('Erro ao carregar mangá');
      navigate('/mangas');
    }
  };

  useEffect(() => {
    loadManga();
    return () => clearCurrentManga();
  }, [id]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar aos favoritos');
      navigate('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await favoriteService.removeFavorite('manga', id);
        setIsFavorite(false);
        toast.success('Removido dos favoritos');
      } else {
        await favoriteService.addFavorite('manga', id);
        setIsFavorite(true);
        toast.success('Adicionado aos favoritos');
      }
    } catch (error) {
      toast.error('Erro ao atualizar favoritos');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentManga?.title,
        text: currentManga?.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    }
  };

  if (loading || !currentManga) {
    return <Loading fullScreen />;
  }

  const getStatusIcon = () => {
    switch (currentManga.status) {
      case 'ongoing': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'hiatus': return <PauseCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (currentManga.status) {
      case 'ongoing': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700';
      case 'hiatus': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  const getStatusText = () => {
    switch (currentManga.status) {
      case 'ongoing': return 'Em Andamento';
      case 'completed': return 'Completo';
      case 'hiatus': return 'Em Hiato';
      default: return 'Desconhecido';
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'agora mesmo';
    if (diffMinutes < 60) return `há ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `há ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  };

  // ✅ Função para obter imagem do capítulo
  const getChapterImage = (chapter) => {
    return chapter.thumbnail
      ? getImageUrl(chapter.thumbnail)
      : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Blur Background */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden dark:from-gray-800 dark:to-gray-900">
        {/* Blurred Background Image */}
        {!imageError && imageUrl && (
          <div 
            className="absolute inset-0 opacity-30 blur-2xl"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        <div className="relative container-custom py-8">
          {/* Back Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 bg-white/10 hover:bg-white/20 text-white border-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <div className="w-full md:w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 group">
                {!imageError && imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={currentManga.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <BookOpen className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                {currentManga.title}
              </h1>
              
              {/* Alternative Titles */}
              {currentManga.alternative_titles?.length > 0 && (
                <p className="text-gray-300 text-lg mb-6 italic">
                  {currentManga.alternative_titles.join(' • ')}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor()}`}>
                  {getStatusIcon()}
                  {getStatusText()}
                </span>

                <span className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-full font-semibold uppercase text-sm">
                  {currentManga.type}
                </span>

                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                  <Eye className="w-4 h-4" />
                  {formatNumber(currentManga.views)}
                </span>

                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                  <BookOpen className="w-4 h-4" />
                  {sortedChapters.length} caps
                </span>

                {(() => {
                  const ratingValue = Number(currentManga.rating) || 0;
                  return ratingValue > 0 ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full backdrop-blur-sm border border-yellow-500/30">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {ratingValue.toFixed(1)}
                    </span>
                  ) : null;
                })()}

                {lastUpdatedInfo && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm border border-white/20">
                    <CalendarDays className="w-4 h-4" />
                    Atualizado {lastUpdatedInfo}
                  </span>
                )}

                {/* Rating UI */}
                <div className="ml-3 flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button
                      key={s}
                      onClick={async (e) => {
                        e.preventDefault();
                        if (!isAuthenticated) {
                          toast.error('Faça login para avaliar');
                          navigate('/login');
                          return;
                        }
                        try {
                          setRatingLoading(true);
                          await ratingService.submitRating('manga', currentManga.id, s);
                          await fetchMangaById(id);
                          setUserRating(s); 
                          toast.success('Avaliação enviada');                  

                        } catch (err) {
                          toast.error('Erro ao enviar avaliação');
                        } finally {
                          setRatingLoading(false);
                        }
                      }}
                      className={`p-1 transform transition duration-150 ${userRating >= s ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110`}
                      disabled={ratingLoading}
                      aria-label={`Avaliar ${s} estrelas`}
                      title={`Avaliar ${s} estrelas`}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Author & Artist */}
              <div className="flex flex-wrap gap-6 mb-6 text-sm">
                {currentManga.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Autor:</span>
                    <span className="font-medium">{currentManga.author}</span>
                  </div>
                )}
                {currentManga.artist && currentManga.artist !== currentManga.author && (
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Artista:</span>
                    <span className="font-medium">{currentManga.artist}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Adicionado:</span>
                  <span className="font-medium">{formatDate(currentManga.created_at)}</span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-6">
                {currentManga.genres?.map((genre) => (
                  <Link
                    key={genre.id}
                    to={`/mangas?genre=${genre.id}`}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition backdrop-blur-sm"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Synopsis */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line dark:text-gray-300">
                    {currentManga.description || 'Sem descrição disponível.'}
                  </p>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {sortedChapters.length > 0 && (
                  <Link to={`/manga/${currentManga.id}/chapter/${sortedChapters[0].id}`}>
                    <Button size="lg" className="bg-primary-600 hover:bg-primary-700">
                      <Play className="w-5 h-5 mr-2" />
                      Começar a Ler
                    </Button>
                  </Link>
                )}

                {lastReadHistory?.current_chapter && (
                  <Link to={`/manga/${currentManga.id}/chapter/${lastReadHistory.current_chapter.id}`}>
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      <Play className="w-5 h-5 mr-2" />
                      Continuar cap. {Math.trunc(Number(lastReadHistory.current_chapter.chapter_number || 0))}
                    </Button>
                  </Link>
                )}

                <Button
                  variant={isFavorite ? 'danger' : 'secondary'}
                  size="lg"
                  onClick={handleFavorite}
                  loading={favoriteLoading}
                  className={isFavorite ? '' : 'bg-white/10 hover:bg-white/20 border-0 backdrop-blur-sm'}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleShare}
                  className="bg-white/10 hover:bg-white/20 border-0 backdrop-blur-sm"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Synopsis */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
                <BookOpen className="w-6 h-6 text-primary-600" />
                Sinopse
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line dark:text-gray-300">
                  {currentManga.description || 'Sem descrição disponível.'}
                </p>
              </div>
            </Card>

            {/* Chapters List */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 dark:text-white">
                  <BookOpen className="w-6 h-6 text-primary-600" />
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
                  <p className="text-gray-500 text-lg">Nenhum capítulo disponível ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedChapters.map((chapter, index) => {
                    const chapterImage = getChapterImage(chapter);
                    
                    return (
                      <Link
                        key={chapter.id}
                        to={`/manga/${currentManga.id}/chapter/${chapter.id}`}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-all group border border-transparent hover:border-primary-200 hover:shadow-md dark:hover:bg-gray-800 dark:hover:border-primary-700"
                      >
                        <div className="flex items-center gap-4">
                          {/* ✅ Thumbnail do capítulo */}
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0 group-hover:ring-2 group-hover:ring-primary-500 transition-all dark:bg-primary-900/50">
                            {chapterImage ? (
                              <img
                                src={chapterImage}
                                alt={`Capítulo ${chapter.chapter_number}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.parentElement.innerHTML = `<span class="text-primary-600 font-bold dark:text-primary-400">${parseFloat(chapter.chapter_number).toFixed(0)}</span>`;
                                }}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-primary-600 dark:text-primary-400">
                                <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
                                <span className="text-xs font-semibold">{parseFloat(chapter.chapter_number).toFixed(0)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors dark:text-gray-200 dark:group-hover:text-primary-400">
                              Capítulo {parseFloat(chapter.chapter_number).toFixed(0)}
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
                        <Play className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors dark:group-hover:text-primary-400" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6 ">
              <Clock className="w-6 h-6 text-primary-600" />
              <h3 className="font-bold text-gray-900 mb-4 text-lg dark:text-white">  Detalhes</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Star className="w-4 h-4" />
                    <span>Avaliação</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {(() => {
                      const ratingValue = Number(currentManga.rating) || 0;
                      return ratingValue > 0 ? (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {ratingValue.toFixed(1)}
                        </span>
                      ) : 'N/A';
                    })()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  <span className={`font-semibold ${
                    currentManga.status === 'ongoing' ? 'text-green-600 dark:text-green-400' :
                    currentManga.status === 'completed' ? 'text-blue-600 dark:text-blue-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {getStatusText()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <BookOpen className="w-4 h-4" />
                    <span>Tipo</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {currentManga.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CalendarDays className="w-4 h-4" />
                    <span>Atualizado</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-200">
                    {formatDate(currentManga.created_at)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Uploader Info */}
            {currentManga.uploader && (
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 text-lg dark:text-white">Enviado por</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {currentManga.uploader.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-200">
                      {currentManga.uploader.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentManga.uploader.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Tip Card */}
            <Card className="p-6 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 dark:border-primary-700">
              <h3 className="font-bold text-gray-900 mb-3 dark:text-white flex items-center gap-2">
                <span>💡</span> Dica de Leitura
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Use as setas do teclado <kbd className="px-2 py-1 bg-white rounded shadow-sm dark:bg-gray-700">←</kbd> <kbd className="px-2 py-1 bg-white rounded shadow-sm dark:bg-gray-700">→</kbd> para navegar entre as páginas durante a leitura!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;