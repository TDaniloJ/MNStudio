import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, ArrowRight, Eye, Star, Flame, Sparkles, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { mangaService } from '../services/mangaService';
import { novelService } from '../services/novelService';
import { getImageUrl, formatNumber, formatDate } from '../utils/formatters';
import Loading from '../components/common/Loading';

/* ─────────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────────── */

/**
 * Normaliza genres para sempre ser string[].
 * O backend pode retornar:
 *  - string[]          → ["Ação", "Romance"]
 *  - {id,name}[]       → [{id:1, name:"Ação"}]
 *  - {id,name,novel_genres}[]  → [{id:1, name:"Ação", novel_genres:{…}}]
 */
const normalizeGenres = (genres) => {
  if (!Array.isArray(genres)) return [];
  return genres.map((g) => {
    if (typeof g === 'string') return g;
    if (g && typeof g === 'object') return g.name ?? String(g.id ?? '');
    return '';
  }).filter(Boolean);
};

const tagManga = (items) =>
  items.map((m) => ({
    ...m,
    type: 'manga',
    contentType: 'manga',
    genres: normalizeGenres(m.genres ?? m.manga_genres),
  }));

const tagNovel = (items) =>
  items.map((n) => ({
    ...n,
    type: 'novel',
    contentType: 'novel',
    genres: normalizeGenres(n.genres ?? n.novel_genres),
  }));

/* ─────────────────────────────────────────────────────────────────
   Home
───────────────────────────────────────────────────────────────── */

const Home = () => {
  const [featured,      setFeatured]      = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [recommended,   setRecommended]   = useState([]);
  const [popular,       setPopular]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [fM, fN, rM, rN, pM, pN, recM, recN] = await Promise.all([
        mangaService.getAll({ limit: 3, sort: 'views' }),
        novelService.getAll({ limit: 3, sort: 'views' }),
        mangaService.getAll({ limit: 12, sort: 'created_at' }),
        novelService.getAll({ limit: 12, sort: 'created_at' }),
        mangaService.getAll({ limit: 6,  sort: 'views' }),
        novelService.getAll({ limit: 6,  sort: 'views' }),
        mangaService.getAll({ limit: 6,  sort: 'rating' }),
        novelService.getAll({ limit: 6,  sort: 'rating' }),
      ]);

      setFeatured(
        [...tagManga(fM.mangas), ...tagNovel(fN.novels)]
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
      );
      setRecentUpdates(
        [...tagManga(rM.mangas), ...tagNovel(rN.novels)]
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 18)
      );
      setPopular(
        [...tagManga(pM.mangas), ...tagNovel(pN.novels)]
          .sort((a, b) => b.views - a.views)
          .slice(0, 12)
      );
      setRecommended(
        [...tagManga(recM.mangas), ...tagNovel(recN.novels)]
          .slice(0, 12)
      );
    } catch (err) {
      console.error('Erro ao carregar home:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d0d0f] transition-colors duration-300">

      {/* ── HERO CINEMATIC ───────────────────────────────────────── */}
      <HeroBanner items={featured} />

      <div className="container-custom space-y-16 py-12">

        {/* ── ATUALIZAÇÕES RECENTES ─────────────────────────────── */}
        <ContentRow
          title="Recém Atualizados"
          subtitle="Novos capítulos disponíveis"
          icon={<Clock className="w-5 h-5" />}
          accent="blue"
          items={recentUpdates}
          showRating
        />

        {/* ── POPULARES ─────────────────────────────────────────── */}
        <ContentRow
          title="Obras Populares"
          subtitle="As mais acessadas do site"
          icon={<Flame className="w-5 h-5" />}
          accent="orange"
          items={popular}
          showRating
        />

        {/* ── RECOMENDAÇÕES ─────────────────────────────────────── */}
        <ContentRow
          title="Recomendadas para Você"
          subtitle="Selecionadas com base nas melhores avaliações"
          icon={<Sparkles className="w-5 h-5" />}
          accent="purple"
          items={recommended}
          showRating
        />

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────
   HeroBanner — hero cinematográfico com spotlight na obra em foco
───────────────────────────────────────────────────────────────── */

const HeroBanner = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] ?? items[0];

  if (!active) return null;

  const link = `/${active.type}/${active.id}`;

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'min(90vh, 660px)' }}>

      {/* Background: imagem desfocada da obra ativa */}
      <div className="absolute inset-0 transition-all duration-700 ease-in-out">
        <img
          key={active.id}
          src={getImageUrl(active.cover_image)}
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-top scale-110 blur-sm brightness-40 dark:brightness-30 transition-all duration-700"
        />
        {/* gradientes */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        {/* grain texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="relative h-full container-custom flex items-center gap-10">

        {/* Info lateral esquerda */}
        <div className="flex-1 max-w-xl z-10 pb-12">
          {/* Badge tipo */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest
              ${active.type === 'manga'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}`}>
              {active.type === 'manga'
                ? <BookOpen className="w-3 h-3" />
                : <FileText className="w-3 h-3" />}
              {active.type === 'manga' ? 'Mangá' : 'Novel'}
            </span>
            {active.rating > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {Number(active.rating).toFixed(1)}
              </span>
            )}
          </div>

          {/* Título */}
          <h1
            className="text-4xl sm:text-5xl font-black text-white leading-[1.05] mb-3 tracking-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          >
            {active.title}
          </h1>

          {/* Gêneros */}
          {active.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {active.genres.slice(0, 4).map((g, i) => (
                <span key={`${g}-${i}`} className="px-2 py-0.5 rounded-md bg-white/10 text-white/70 text-xs font-medium border border-white/10">
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Sinopse */}
          {active.synopsis && (
            <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-3">
              {active.synopsis}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 mb-7 text-white/60 text-sm">
            {active.views > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {formatNumber(active.views)}
              </span>
            )}
            {active.chapters_count > 0 && (
              <span className="flex items-center gap-1.5">
                {active.type === 'manga'
                  ? <BookOpen className="w-4 h-4" />
                  : <FileText className="w-4 h-4" />}
                {active.chapters_count} capítulos
              </span>
            )}
          </div>

          {/* CTA */}
          <Link to={link}>
            <button className="group inline-flex items-center gap-3 px-7 py-3.5 bg-white text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-black/30 hover:shadow-xl hover:scale-[1.02]">
              Ler agora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Capa central em destaque */}
        <div className="hidden lg:flex items-center justify-center flex-shrink-0 z-10 pb-12">
          <Link to={link} className="group">
            <div className="relative"
              style={{ filter: 'drop-shadow(0 25px 60px rgba(0,0,0,0.8))' }}>
              <img
                key={active.id}
                src={getImageUrl(active.cover_image)}
                alt={active.title}
                className="w-52 rounded-2xl object-cover group-hover:scale-[1.03] transition-transform duration-300"
                style={{ aspectRatio: '2/3' }}
              />
              {/* brilho sutil na borda */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20 group-hover:ring-white/40 transition" />
            </div>
          </Link>
        </div>

        {/* Miniaturas das outras obras */}
        <div className="hidden xl:flex flex-col gap-3 z-10 pb-12">
          {items.map((item, idx) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex items-center gap-3 p-2 rounded-xl transition-all duration-200
                ${activeIndex === idx
                  ? 'bg-white/15 ring-1 ring-white/30 scale-100'
                  : 'bg-white/5 hover:bg-white/10 scale-95 opacity-60 hover:opacity-90 hover:scale-100'}`}
            >
              <img
                src={getImageUrl(item.cover_image)}
                alt={item.title}
                className="w-10 h-14 rounded-lg object-cover flex-shrink-0"
              />
              <span className="text-xs font-semibold text-white max-w-[120px] text-left line-clamp-2 leading-tight">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dots de paginação mobile */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              activeIndex === idx
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Auto-avanço */}
      <HeroAutoplay
        count={items.length}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
    </div>
  );
};

/* Auto-avanço a cada 5s */
const HeroAutoplay = ({ count, activeIndex, onChange }) => {
  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => {
      onChange((prev) => (prev + 1) % count);
    }, 5000);
    return () => clearInterval(id);
  }, [count, onChange]);
  return null;
};

/* ─────────────────────────────────────────────────────────────────
   ContentRow — seção com scroll horizontal estilo streaming
───────────────────────────────────────────────────────────────── */

const ACCENT = {
  blue:   { bar: 'bg-blue-500',   icon: 'text-blue-500 dark:text-blue-400',   label: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  orange: { bar: 'bg-orange-500', icon: 'text-orange-500 dark:text-orange-400', label: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  purple: { bar: 'bg-purple-500', icon: 'text-purple-500 dark:text-purple-400', label: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
};

const ContentRow = ({ title, subtitle, icon, accent = 'blue', items, showRating = false, linksLeft }) => {
  const a      = ACCENT[accent] ?? ACCENT.blue;
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  return (
    <section>
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div className="flex items-start gap-3">
          {/* barra colorida */}
          <div className={`w-1 rounded-full self-stretch mt-1 ${a.bar}`} />
          <div>
            <div className={`flex items-center gap-2 mb-1 ${a.icon}`}>
              {icon}
              <span className="text-xs font-bold uppercase tracking-widest">{subtitle}</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {linksLeft?.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${a.label} hover:opacity-80`}
            >
              {l.label}
            </Link>
          ))}
          {/* Setas de scroll */}
          <button
            onClick={() => scroll(-1)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll horizontal */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-3 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item, idx) => (
          <ContentCard
            key={`${item.type}-${item.id}-${idx}`}
            item={item}
            showRating={showRating}
            rank={idx + 1}
          />
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────
   ContentCard — card de obra individual
───────────────────────────────────────────────────────────────── */

const ContentCard = ({ item, showRating, rank }) => {
  const [imgErr, setImgErr] = useState(false);
  const link = `/${item.type}/${item.id}`;

  return (
    <Link
      to={link}
      className="group flex-shrink-0 flex flex-col gap-2"
      style={{ width: '148px' }}
    >
      {/* Capa */}
      <div className="relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-md group-hover:shadow-xl transition-all duration-300"
        style={{ aspectRatio: '2/3' }}>

        {!imgErr ? (
          <img
            src={getImageUrl(item.cover_image)}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
            <BookOpen className="w-10 h-10" />
          </div>
        )}

        {/* Overlay ao hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge tipo */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide
            ${item.type === 'manga'
              ? 'bg-blue-600/90 text-white'
              : 'bg-purple-600/90 text-white'}`}>
            {item.type === 'manga' ? 'M' : 'N'}
          </span>
        </div>

        {/* Rating ao hover */}
        {showRating && item.rating > 0 && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            <span className="text-xs font-bold text-white">{Number(item.rating).toFixed(1)}</span>
          </div>
        )}

        {/* Número de ranking (para popular) */}
        {rank <= 3 && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
            <span className={`text-xs font-black ${
              rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : 'text-amber-600'
            }`}>
              {rank}
            </span>
          </div>
        )}

        {/* Classificação etaria*/}
        {item.age_rating && (
          <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{item.age_rating}</span>
          </div>
        )}
      </div>

      {/* Título + meta */}
      <div className="px-0.5">
        <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {item.title}
        </p>
        {item.updated_at && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
            {formatDate(item.updated_at)}
          </p>
        )}
      </div>
    </Link>
  );
};

export default Home;