import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen, Eye, Calendar, User, Heart, Share2, ArrowLeft,
  Clock, Star, CheckCircle, XCircle, PauseCircle, Play,
  CalendarDays, Palette, Image as ImageIcon, ChevronUp, ChevronDown,
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

/* ── Helpers ──────────────────────────────────────────────────────── */

const STATUS_MAP = {
  ongoing:   { label: 'Em Andamento', color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/30',  icon: Play         },
  completed: { label: 'Completo',     color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/30',    icon: CheckCircle  },
  hiatus:    { label: 'Em Hiato',     color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', icon: PauseCircle },
};

const getStatus = (status) => STATUS_MAP[status] ?? { label: 'Desconhecido', color: 'text-gray-400', bg: 'bg-gray-500/15 border-gray-500/30', icon: XCircle };

const relativeTime = (dateString) => {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return 'agora mesmo';
  if (mins < 60) return `há ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `há ${days} dia${days > 1 ? 's' : ''}`;
};

/* ── Componente principal ─────────────────────────────────────────── */

const MangaDetail = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { currentManga, loading, fetchMangaById, clearCurrentManga } = useMangaStore();
  const { isAuthenticated } = useAuthStore();

  const [isFavorite,      setIsFavorite]      = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageError,      setImageError]      = useState(false);
  const [sortOrder,       setSortOrder]       = useState('asc');
  const [userRating,      setUserRating]      = useState(0);
  const [ratingLoading,   setRatingLoading]   = useState(false);
  const [lastReadHistory, setLastReadHistory] = useState(null);
  const [hoveredStar,     setHoveredStar]     = useState(0);

  const sortedChapters = useMemo(() => {
    const chs = Array.isArray(currentManga?.chapters) ? currentManga.chapters : [];
    return [...chs].sort((a, b) => {
      const an = Number(a.chapter_number || a.number || a.index || 0);
      const bn = Number(b.chapter_number || b.number || b.index || 0);
      if (isNaN(an) || isNaN(bn)) return 0;
      return sortOrder === 'asc' ? an - bn : bn - an;
    });
  }, [currentManga?.chapters, sortOrder]);

  const imageUrl = getImageUrl(currentManga?.cover_image);
  const status   = getStatus(currentManga?.status);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchMangaById(id);
      } catch {
        toast.error('Erro ao carregar mangá');
        navigate('/mangas');
      }
    };
    load();
    return () => clearCurrentManga();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !currentManga?.id) return;
    favoriteService.checkFavorite?.('manga', currentManga.id)
      .then((res) => setIsFavorite(res?.isFavorite ?? false))
      .catch(() => {});
    readingHistoryService.getHistory?.(currentManga.id)
      .then((res) => setLastReadHistory(res))
      .catch(() => {});
  }, [currentManga?.id, isAuthenticated]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Faça login para favoritar');
      navigate('/login');
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite('manga', id);
        setIsFavorite(false);
        toast.success('Removido dos favoritos');
      } else {
        await favoriteService.addFavorite('manga', id);
        setIsFavorite(true);
        toast.success('Adicionado aos favoritos!');
      }
    } catch {
      toast.error('Erro ao atualizar favoritos');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: currentManga?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    }
  };

  const handleRating = async (stars) => {
    if (!isAuthenticated) {
      toast.error('Faça login para avaliar');
      navigate('/login');
      return;
    }
    setRatingLoading(true);
    try {
      await ratingService.submitRating('manga', currentManga.id, stars);
      await fetchMangaById(id);
      setUserRating(stars);
      toast.success('Avaliação enviada!');
    } catch {
      toast.error('Erro ao enviar avaliação');
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading || !currentManga) return <Loading fullScreen />;

  const firstChapter    = sortedChapters[0];
  const continueChapter = lastReadHistory?.current_chapter;
  const ratingValue     = Number(currentManga.rating) || 0;
  const lastChapterDate = sortedChapters.at(-1)?.created_at;

  // Normaliza genres para sempre ser {id, name}
  const genres = (currentManga.genres ?? []).map((g) =>
    typeof g === 'string' ? { id: g, name: g } : g
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0f]">

      {/* ── HERO CINEMATIC ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: '520px' }}>

        {/* Background: capa desfocada */}
        {!imageError && imageUrl && (
          <div className="absolute inset-0">
            <img
              src={imageUrl}
              alt=""
              aria-hidden
              className="w-full h-full object-cover object-top scale-110 blur-md brightness-30 dark:brightness-20"
            />
          </div>
        )}
        {/* Gradientes */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#0d0d0f] via-transparent to-transparent" />
        {/* grain */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
        />

        <div className="relative container-custom pt-6 pb-12">

          {/* Botão voltar */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar
          </button>

          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Capa */}
            <div className="flex-shrink-0 w-48 md:w-56">
              <div
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{ aspectRatio: '2/3', filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.8))' }}
              >
                {!imageError && imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={currentManga.title}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <BookOpen className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                {/* borda sutil */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">

              {/* Badges de topo */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.bg} ${status.color}`}>
                  <status.icon className="w-3.5 h-3.5" />
                  {status.label}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-primary-600/80 text-white rounded-full text-xs font-bold uppercase tracking-wide border border-primary-500/50">
                  {currentManga.type ?? 'Mangá'}
                </span>
                {ratingValue > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 rounded-full text-xs font-bold">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {ratingValue.toFixed(1)}
                  </span>
                )}
                {lastChapterDate && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/70 rounded-full text-xs border border-white/10">
                    <Clock className="w-3 h-3" />
                    {relativeTime(lastChapterDate)}
                  </span>
                )}
              </div>

              {/* Título */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.05] tracking-tight mb-2">
                {currentManga.title}
              </h1>

              {/* Títulos alternativos */}
              {currentManga.alternative_titles?.length > 0 && (
                <p className="text-white/50 text-sm mb-4 italic">
                  {currentManga.alternative_titles.join(' · ')}
                </p>
              )}

              {/* Autor / Artista / Data */}
              <div className="flex flex-wrap gap-5 mb-4 text-sm text-white/60">
                {currentManga.author && (
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-white/40">Autor:</span>
                    <span className="text-white/80 font-medium">{currentManga.author}</span>
                  </span>
                )}
                {currentManga.artist && currentManga.artist !== currentManga.author && (
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    <span className="text-white/40">Artista:</span>
                    <span className="text-white/80 font-medium">{currentManga.artist}</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="text-white/40">Adicionado:</span>
                  <span className="text-white/80">{formatDate(currentManga.created_at)}</span>
                </span>
              </div>

              {/* Stats: views + capítulos */}
              <div className="flex items-center gap-5 mb-4 text-sm text-white/50">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  {formatNumber(currentManga.views)} visualizações
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {sortedChapters.length} capítulos
                </span>
              </div>

              {/* Gêneros */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {genres.map((genre, i) => (
                    <Link
                      key={genre.id ?? i}
                      to={`/mangas?genre=${genre.id}`}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-lg text-xs text-white/70 hover:text-white font-medium transition"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Sinopse */}
              {currentManga.description && (
                <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-2xl line-clamp-3">
                  {currentManga.description}
                </p>
              )}

              {/* Avaliação por estrelas */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs text-white/40 font-medium">Avaliar:</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      disabled={ratingLoading}
                      onClick={() => handleRating(s)}
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-1 transition-transform hover:scale-125 disabled:opacity-50"
                      aria-label={`Avaliar ${s} estrelas`}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          (hoveredStar || userRating) >= s
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-white/20'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                {firstChapter && (
                  <Link to={`/manga/${currentManga.id}/chapter/${firstChapter.id}`}>
                    <button className="group inline-flex items-center gap-2.5 px-6 py-3 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition shadow-lg shadow-black/30 hover:scale-[1.02]">
                      <Play className="w-4 h-4" />
                      Começar a ler
                      <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </Link>
                )}

                {continueChapter && (
                  <Link to={`/manga/${currentManga.id}/chapter/${continueChapter.id}`}>
                    <button className="inline-flex items-center gap-2.5 px-6 py-3 bg-green-500/20 text-green-300 border border-green-500/30 font-bold rounded-2xl hover:bg-green-500/30 transition">
                      <Play className="w-4 h-4" />
                      Continuar cap. {Math.trunc(Number(continueChapter.chapter_number || 0))}
                    </button>
                  </Link>
                )}

                <button
                  onClick={handleFavorite}
                  disabled={favoriteLoading}
                  className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm border transition ${
                    isFavorite
                      ? 'bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30'
                      : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-4 py-3 bg-white/10 text-white/70 border border-white/10 rounded-2xl hover:bg-white/20 hover:text-white transition"
                  aria-label="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO PRINCIPAL ──────────────────────────────────────── */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Coluna principal ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Sinopse completa */}
            <Card className="p-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" />
                Sinopse
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                {currentManga.description || 'Sem descrição disponível.'}
              </p>
            </Card>

            {/* Lista de capítulos */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-500" />
                  Capítulos
                  <span className="text-base font-normal text-gray-400 dark:text-gray-500">
                    ({sortedChapters.length})
                  </span>
                </h2>
                <button
                  onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  {sortOrder === 'asc'
                    ? <><ChevronUp className="w-3.5 h-3.5" /> Crescente</>
                    : <><ChevronDown className="w-3.5 h-3.5" /> Decrescente</>}
                </button>
              </div>

              {sortedChapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-gray-700">
                  <BookOpen className="w-12 h-12 mb-3" />
                  <p className="text-gray-400 dark:text-gray-500 font-medium">
                    Nenhum capítulo disponível ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sortedChapters.map((chapter) => {
                    const chapterImg = chapter.thumbnail
                      ? getImageUrl(chapter.thumbnail)
                      : null;
                    const isContinue = continueChapter?.id === chapter.id;

                    return (
                      <Link
                        key={chapter.id}
                        to={`/manga/${currentManga.id}/chapter/${chapter.id}`}
                        className={`group flex items-center justify-between p-3.5 rounded-xl transition-all border ${
                          isContinue
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                            : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Thumbnail */}
                          <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:ring-2 group-hover:ring-primary-500/50 transition">
                            {chapterImg ? (
                              <img
                                src={chapterImg}
                                alt={`Cap. ${chapter.chapter_number}`}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <span className="text-xs font-black text-gray-400 dark:text-gray-500">
                                {parseFloat(chapter.chapter_number).toFixed(0)}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                Capítulo {parseFloat(chapter.chapter_number).toFixed(0)}
                                {chapter.title && (
                                  <span className="font-normal text-gray-500 dark:text-gray-400"> — {chapter.title}</span>
                                )}
                              </p>
                              {isContinue && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-md">
                                  continuar
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(chapter.created_at)}
                              </span>
                              {chapter.views > 0 && (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {formatNumber(chapter.views)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <Play className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Detalhes */}
            <Card className="p-5">
              <h3 className="font-black text-gray-900 dark:text-white mb-4 text-base">Detalhes</h3>
              <div className="space-y-3">
                {[
                  {
                    icon: <Star className="w-4 h-4" />,
                    label: 'Avaliação',
                    value: ratingValue > 0
                      ? <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{ratingValue.toFixed(1)}</span>
                      : '0.0',
                  },
                  {
                    icon: <status.icon className="w-4 h-4" />,
                    label: 'Status',
                    value: <span className={status.color}>{status.label}</span>,
                  },
                  {
                    icon: <BookOpen className="w-4 h-4" />,
                    label: 'Tipo',
                    value: currentManga.type ?? 'Mangá',
                  },
                  {
                    icon: <Eye className="w-4 h-4" />,
                    label: 'Views',
                    value: formatNumber(currentManga.views),
                  },
                  {
                    icon: <CalendarDays className="w-4 h-4" />,
                    label: 'Última atualização',
                    value: lastChapterDate ? relativeTime(lastChapterDate) : 'N/A',
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      {icon}{label}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Uploader */}
            {currentManga.uploader && (
              <Card className="p-5">
                <h3 className="font-black text-gray-900 dark:text-white mb-3 text-base">
                  Enviado por
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 dark:bg-primary-700 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {currentManga.uploader.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {currentManga.uploader.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentManga.uploader.role === 'admin' ? 'Administrador' : 'Colaborador'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Dica de leitura */}
            <Card className="p-5 bg-gradient-to-br from-primary-50 to-primary-100/50 border-primary-200 dark:from-primary-900/20 dark:to-primary-800/10 dark:border-primary-800">
              <h3 className="font-black text-gray-900 dark:text-white mb-2 text-sm flex items-center gap-2">
                <span>💡</span> Dica
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Use{' '}
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded-md shadow-sm text-[10px] font-bold">←</kbd>
                {' '}e{' '}
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded-md shadow-sm text-[10px] font-bold">→</kbd>
                {' '}para navegar entre páginas durante a leitura.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetail;