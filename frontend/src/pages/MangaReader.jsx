import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowLeft, List,
  Settings, X, Maximize, Minimize,
  ZoomIn, ZoomOut, RotateCw, BookOpen,
  Layers, AlignJustify, Square,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../services/mangaService';
import { readingHistoryService } from '../services/readingHistoryService';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { getImageUrl } from '../utils/formatters';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

/* ── Assets ─────────────────────────────────────────────────────── */

const READER_ASSETS = {
  fallback: import.meta.env.VITE_READER_FALLBACK_IMAGE || '/images/reader/reader-page-error.png',
  loading:  import.meta.env.VITE_READER_LOADING_IMAGE  || '/images/reader/reader-loading.png',
  empty:    import.meta.env.VITE_READER_EMPTY_IMAGE    || '/images/reader/reader-empty.png',
  end:      import.meta.env.VITE_READER_END_IMAGE      || '/images/reader/reader-end.png',
};

/* ── Constantes de estilo ────────────────────────────────────────── */

const BG_COLORS = {
  black: 'bg-black',
  dark:  'bg-gray-900',
  gray:  'bg-gray-100',
  white: 'bg-white',
};

const FIT_MODES = {
  'fit-width':  'w-full h-auto',
  'fit-height': 'max-h-screen w-auto',
  'fit-both':   'max-w-full max-h-screen',
  'original':   'w-auto h-auto',
};

/* ── Componente principal ────────────────────────────────────────── */

const MangaReader = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [chapter,  setChapter]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [pages,    setPages]    = useState([]);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [currentPage, setCurrentPage] = useState(0);

  const [showControls,    setShowControls]    = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showSettings,    setShowSettings]    = useState(false);
  const [isFullscreen,    setIsFullscreen]    = useState(false);

  // Modais de fim de capítulo
  const [showNextConfirm,       setShowNextConfirm]       = useState(false);
  const [showEndModal,          setShowEndModal]          = useState(false);
  const [showContinuousEndModal,setShowContinuousEndModal]= useState(false);
  const [nextChapterTarget,     setNextChapterTarget]     = useState(null);

  // Configurações persistidas
  const [readingMode,      setReadingMode]      = useState(() => localStorage.getItem('mangaReadingMode') || 'single');
  const [fitMode,          setFitMode]          = useState(() => localStorage.getItem('mangaFitMode')    || 'fit-height');
  const [backgroundColor,  setBackgroundColor]  = useState(() => localStorage.getItem('mangaBgColor')   || 'black');
  const [autoAdvance,      setAutoAdvance]      = useState(() => localStorage.getItem('mangaAutoAdvance') === 'true');
  const [preloadPages,     setPreloadPages]     = useState(3);
  const [zoom,             setZoom]             = useState(100);

  const { publicSettings } = useSettingsStore();

  // Sincroniza autoAdvance com config global
  useEffect(() => {
    const gv = publicSettings?.reader_auto_advance;
    if (gv !== undefined && gv !== null) setAutoAdvance(gv === true || gv === 'true');
  }, [publicSettings]);

  /* ── Scroll contínuo ─────────────────────────────────────────── */

  useEffect(() => {
    if (readingMode !== 'continuous') return;
    const container = document.getElementById('webtoon-container');
    if (!container) return;

    const onScroll = () => {
      const images = container.querySelectorAll('img[data-page-index]');
      let visiblePage = 0;
      let isAtBottom  = false;

      images.forEach((img) => {
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5) visiblePage = Number(img.dataset.pageIndex);
      });

      if (images.length > 0) {
        const lastRect = images[images.length - 1].getBoundingClientRect();
        isAtBottom = lastRect.bottom <= window.innerHeight + 50;
      }

      setCurrentPage(visiblePage);

      if (isAtBottom && pages?.length > 0 && visiblePage >= pages.length - 1) {
        const hasNext = chapters?.length > 0 && currentChapterIndex < chapters.length - 1;
        if (hasNext) {
          const next = chapters[currentChapterIndex + 1];
          if (autoAdvance) navigate(`/manga/${mangaId}/chapter/${next.id}`);
          else { setNextChapterTarget(next.id); setShowContinuousEndModal(true); }
        } else {
          setShowContinuousEndModal(true);
        }
      }
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [readingMode, pages, chapters, currentChapterIndex, autoAdvance, navigate, mangaId]);

  /* ── Carregar capítulo ───────────────────────────────────────── */

  useEffect(() => {
    loadChapter();
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [chapterId]);

  useEffect(() => {
    if (chapter && isAuthenticated) saveProgress();
  }, [currentPage, chapter]);

  useEffect(() => {
    if (pages?.length > 0) preloadImages();
  }, [currentPage, pages, preloadPages]);

  const loadChapter = async () => {
    try {
      setLoading(true);
      const data = await mangaService.getChapterPages(chapterId);
      if (!data || data.success === false) throw new Error(data?.error || 'Falha ao carregar capítulo');

      const pagesData   = data.pages   || [];
      const chapterData = data.chapter || { id: chapterId, chapter_number: '1', title: '', manga: { id: mangaId, title: 'Mangá' } };

      setPages(pagesData);
      setChapter(chapterData);
      setCurrentPage(0);
      scrollToTop();

      try {
        const chaptersData = await mangaService.getMangaChapters(mangaId);
        const list = chaptersData.chapters || [];
        setChapters(list);
        setCurrentChapterIndex(list.findIndex((c) => String(c.id) === String(chapterId)));
      } catch {
        setChapters([]);
        setCurrentChapterIndex(-1);
      }

      if (pagesData.length === 0) toast.error('Este capítulo não possui páginas');
      else toast.success('Capítulo carregado!');
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Erro ao carregar capítulo');
      navigate(`/manga/${mangaId}`);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      await readingHistoryService.saveProgress({
        content_type: 'manga',
        content_id:   parseInt(mangaId),
        chapter_id:   parseInt(chapterId),
        last_page:    currentPage,
      });
    } catch { /* silencioso */ }
  };

  const scrollToTop = () => {
    const id = readingMode === 'continuous' ? 'webtoon-container' : 'page-container';
    document.getElementById(id)?.scrollTo({ top: 0, behavior: 'instant' });
  };

  const preloadImages = () => {
    if (!pages?.length) return;
    for (let i = Math.max(0, currentPage - 1); i < Math.min(pages.length, currentPage + preloadPages + 1); i++) {
      const url = getImageUrl(pages[i]?.image_url);
      if (url) { const img = new Image(); img.src = url; }
    }
  };

  /* ── Navegação ───────────────────────────────────────────────── */

  const nextPage = useCallback(() => {
    if (pages?.length > 0 && currentPage < pages.length - 1) {
      setCurrentPage((p) => p + 1);
      scrollToTop();
    } else {
      const hasNext = chapters?.length > 0 && currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1;
      if (hasNext) {
        const next = chapters[currentChapterIndex + 1];
        if (autoAdvance) navigate(`/manga/${mangaId}/chapter/${next.id}`);
        else { setNextChapterTarget(next.id); setShowNextConfirm(true); }
      } else {
        setShowEndModal(true);
      }
    }
  }, [currentPage, pages, autoAdvance, chapters, currentChapterIndex, navigate, mangaId]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) { setCurrentPage((p) => p - 1); scrollToTop(); }
  }, [currentPage]);

  const handleKeyDown = useCallback((e) => {
    if (showSettings || showChapterList) return;
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;

    if (e.key === 'ArrowRight' || e.code === 'Space') { e.preventDefault(); nextPage(); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); prevPage(); }
    else if (e.key === 'Home')       { e.preventDefault(); setCurrentPage(0); }
    else if (e.key === 'End')        { e.preventDefault(); setCurrentPage(Math.max(0, (pages?.length ?? 1) - 1)); }
    else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
  }, [showSettings, showChapterList, nextPage, prevPage, pages]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const saveSettings = () => {
    localStorage.setItem('mangaReadingMode', readingMode);
    localStorage.setItem('mangaFitMode',     fitMode);
    localStorage.setItem('mangaBgColor',     backgroundColor);
    localStorage.setItem('mangaAutoAdvance', autoAdvance);
    toast.success('Configurações salvas!');
  };

  const showUI = () => {
    setShowControls(true);
    const t = setTimeout(() => setShowControls(false), 3500);
    return () => clearTimeout(t);
  };

  /* ── Render ──────────────────────────────────────────────────── */

  if (loading) return <Loading fullScreen />;

  if (!chapter) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white space-y-4">
        <BookOpen className="w-16 h-16 text-gray-600 mx-auto" />
        <h2 className="text-xl font-bold">Capítulo não encontrado</h2>
        <Button onClick={() => navigate(`/manga/${mangaId}`)}>Voltar</Button>
      </div>
    </div>
  );

  const totalPages      = pages?.length ?? 0;
  const currentPageData = pages?.[currentPage];
  const progress        = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;
  const hasNext         = chapters?.length > 0 && currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1;
  const hasPrev         = currentChapterIndex > 0;

  return (
    <div
      className={`fixed inset-0 ${BG_COLORS[backgroundColor]} select-none`}
      onMouseMove={showUI}
      onClick={() => { if (!showSettings && !showChapterList) showUI(); }}
    >

      {/* ════════════════════════════════════════════
          MODAIS
      ════════════════════════════════════════════ */}

      <Modal isOpen={showNextConfirm} onClose={() => setShowNextConfirm(false)} title="Próximo capítulo?" size="sm">
        <p className="mb-5 text-gray-600 dark:text-gray-400">Você chegou ao fim deste capítulo. Deseja continuar para o próximo?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowNextConfirm(false)}>Ficar aqui</Button>
          <Button onClick={() => { setShowNextConfirm(false); if (nextChapterTarget) navigate(`/manga/${mangaId}/chapter/${nextChapterTarget}`); }}>
            Próximo capítulo →
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showEndModal} onClose={() => setShowEndModal(false)} title="Fim dos capítulos" size="sm">
        <p className="mb-5 text-gray-600 dark:text-gray-400">Você chegou ao fim dos capítulos disponíveis deste mangá.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate(`/manga/${mangaId}`)}>Ver detalhes</Button>
          <Button onClick={() => setShowEndModal(false)}>Ok</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showContinuousEndModal}
        onClose={() => setShowContinuousEndModal(false)}
        title={hasNext ? 'Próximo capítulo disponível' : 'Fim dos capítulos'}
        size="sm"
      >
        <p className="mb-5 text-gray-600 dark:text-gray-400">
          {hasNext ? 'Fim deste capítulo. Deseja continuar?' : 'Você chegou ao fim dos capítulos deste mangá.'}
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => { setShowContinuousEndModal(false); navigate(`/manga/${mangaId}`); }}>
            Ver detalhes
          </Button>
          {hasNext && (
            <Button onClick={() => { setShowContinuousEndModal(false); if (nextChapterTarget) navigate(`/manga/${mangaId}/chapter/${nextChapterTarget}`); }}>
              Próximo →
            </Button>
          )}
        </div>
      </Modal>

      {/* ════════════════════════════════════════════
          BARRA SUPERIOR
      ════════════════════════════════════════════ */}

      <div className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        {/* fundo gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black/70 to-transparent pointer-events-none" />

        <div className="relative flex items-center justify-between px-4 py-3 gap-4">

          {/* Esquerda: voltar + info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(`/manga/${mangaId}`)}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors flex-shrink-0 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Voltar
            </button>

            <div className="w-px h-4 bg-white/20 flex-shrink-0" />

            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate leading-tight">
                {chapter?.manga?.title || 'Mangá'}
              </p>
              <p className="text-white/50 text-xs truncate">
                Capítulo {parseFloat(chapter.chapter_number) || 1}
                {chapter?.title && ` — ${chapter.title}`}
              </p>
            </div>
          </div>

          {/* Direita: ações */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Capítulo anterior */}
            {hasPrev && (
              <TopBtn
                onClick={() => navigate(`/manga/${mangaId}/chapter/${chapters[currentChapterIndex - 1].id}`)}
                title="Capítulo anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </TopBtn>
            )}
            {/* Próximo capítulo */}
            {hasNext && (
              <TopBtn
                onClick={() => navigate(`/manga/${mangaId}/chapter/${chapters[currentChapterIndex + 1].id}`)}
                title="Próximo capítulo"
              >
                <ChevronRight className="w-4 h-4" />
              </TopBtn>
            )}

            <div className="w-px h-4 bg-white/20 mx-1" />

            <TopBtn onClick={() => { setShowChapterList((v) => !v); setShowSettings(false); }} title="Lista de capítulos" active={showChapterList}>
              <List className="w-4 h-4" />
            </TopBtn>
            <TopBtn onClick={toggleFullscreen} title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </TopBtn>
            <TopBtn onClick={() => { setShowSettings((v) => !v); setShowChapterList(false); }} title="Configurações" active={showSettings}>
              <Settings className="w-4 h-4" />
            </TopBtn>
          </div>
        </div>

        {/* Progress bar fina no topo */}
        <div className="relative h-0.5 bg-white/10 mx-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════
          PAINEL DE CAPÍTULOS
      ════════════════════════════════════════════ */}

      <div className={`fixed top-0 right-0 bottom-0 w-72 z-40 transition-all duration-300 ease-in-out ${showChapterList ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full bg-gray-950/95 backdrop-blur-md border-l border-white/10 flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 flex-shrink-0">
            <h3 className="text-white font-bold text-sm">Capítulos</h3>
            <button onClick={() => setShowChapterList(false)} className="text-white/50 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {chapters.map((ch, idx) => {
              const isCurrent = String(ch.id) === String(chapterId);
              return (
                <button
                  key={ch.id}
                  onClick={() => { navigate(`/manga/${mangaId}/chapter/${ch.id}`); setShowChapterList(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-primary-600/20 text-primary-400 border-r-2 border-primary-500'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="w-6 text-right text-xs font-mono text-white/30 flex-shrink-0">
                    {parseFloat(ch.chapter_number).toFixed(0)}
                  </span>
                  <span className="flex-1 truncate">
                    {ch.title || `Capítulo ${parseFloat(ch.chapter_number).toFixed(0)}`}
                  </span>
                  {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          PAINEL DE CONFIGURAÇÕES
      ════════════════════════════════════════════ */}

      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative bg-gray-950/95 backdrop-blur-md rounded-2xl border border-white/10 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl">

            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gray-950/95 backdrop-blur-md rounded-t-2xl">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary-400" />
                Configurações
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6">

              {/* Modo de leitura */}
              <SettingSection label="Modo de Leitura">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'single',     label: 'Página',   icon: Square },
                    { value: 'double',     label: 'Dupla',    icon: Layers },
                    { value: 'continuous', label: 'Contínuo', icon: AlignJustify },
                  ].map(({ value, label, icon: Icon }) => (
                    <SettingBtn key={value} active={readingMode === value} onClick={() => setReadingMode(value)}>
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <span className="text-xs">{label}</span>
                    </SettingBtn>
                  ))}
                </div>
              </SettingSection>

              {/* Ajuste da imagem */}
              {readingMode !== 'continuous' && (
                <SettingSection label="Ajuste da Imagem">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'fit-width',  label: 'Largura' },
                      { value: 'fit-height', label: 'Altura'  },
                      { value: 'fit-both',   label: 'Ambos'   },
                      { value: 'original',   label: 'Original'},
                    ].map(({ value, label }) => (
                      <SettingBtn key={value} active={fitMode === value} onClick={() => setFitMode(value)}>
                        <span className="text-xs">{label}</span>
                      </SettingBtn>
                    ))}
                  </div>
                </SettingSection>
              )}

              {/* Cor de fundo */}
              <SettingSection label="Cor de Fundo">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'black', label: 'Preto',  swatch: 'bg-black border border-white/10' },
                    { value: 'dark',  label: 'Escuro', swatch: 'bg-gray-900 border border-white/10' },
                    { value: 'gray',  label: 'Cinza',  swatch: 'bg-gray-500' },
                    { value: 'white', label: 'Branco', swatch: 'bg-white border border-white/20' },
                  ].map(({ value, label, swatch }) => (
                    <button
                      key={value}
                      onClick={() => setBackgroundColor(value)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                        backgroundColor === value
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-full h-7 rounded-lg ${swatch}`} />
                      <span className="text-[10px] text-white/60">{label}</span>
                    </button>
                  ))}
                </div>
              </SettingSection>

              {/* Avançar automaticamente */}
              <SettingSection label="Comportamento">
                <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
                  <span className="text-white/70 text-sm">Avançar automaticamente</span>
                  <div
                    onClick={() => setAutoAdvance((v) => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${autoAdvance ? 'bg-primary-500' : 'bg-white/15'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${autoAdvance ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </label>
              </SettingSection>

              {/* Pré-carregar páginas */}
              <SettingSection label={`Pré-carregar: ${preloadPages} páginas`}>
                <input
                  type="range" min="1" max="10" value={preloadPages}
                  onChange={(e) => setPreloadPages(Number(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <p className="text-[11px] text-white/30 mt-1">Mais páginas = mais fluidez, mais dados</p>
              </SettingSection>

              {/* Atalhos */}
              <SettingSection label="Atalhos de Teclado">
                <div className="space-y-2 text-xs text-white/50">
                  {[
                    ['→ / Espaço', 'Próxima página'],
                    ['←',         'Página anterior'],
                    ['F',         'Tela cheia'],
                    ['Home',      'Primeira página'],
                    ['End',       'Última página'],
                  ].map(([key, desc]) => (
                    <div key={key} className="flex items-center justify-between">
                      <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/70 font-mono text-[10px]">{key}</kbd>
                      <span>{desc}</span>
                    </div>
                  ))}
                </div>
              </SettingSection>

              <button
                onClick={() => { saveSettings(); setShowSettings(false); showUI(); }}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Salvar configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          ÁREA DE LEITURA
      ════════════════════════════════════════════ */}

      <div id="page-container" className="h-full w-full overflow-y-auto overflow-x-hidden">

        {/* Página única */}
        {readingMode === 'single' && pages?.length > 0 && (
          <div className="flex justify-center items-center min-h-full p-4">
            {currentPageData ? (
              <img
                src={getImageUrl(currentPageData.image_url)}
                alt={`Página ${currentPage + 1}`}
                className={`${FIT_MODES[fitMode]} mx-auto cursor-pointer`}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}
                onClick={nextPage}
                onError={(e) => { if (e.currentTarget.src !== READER_ASSETS.fallback) e.currentTarget.src = READER_ASSETS.fallback; }}
              />
            ) : (
              <div className="text-white/50 text-center space-y-3">
                <p>Página não encontrada</p>
                <Button onClick={() => setCurrentPage(0)}>Primeira página</Button>
              </div>
            )}
          </div>
        )}

        {/* Página dupla */}
        {readingMode === 'double' && pages?.length > 0 && (
          <div className="flex items-center justify-center gap-2 w-full min-h-full p-4">
            {currentPage > 0 && pages[currentPage - 1] && (
              <img
                src={getImageUrl(pages[currentPage - 1].image_url)}
                alt={`Página ${currentPage}`}
                className={FIT_MODES[fitMode]}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = READER_ASSETS.fallback; }}
              />
            )}
            {currentPageData ? (
              <img
                src={getImageUrl(currentPageData.image_url)}
                alt={`Página ${currentPage + 1}`}
                className={FIT_MODES[fitMode]}
                onClick={nextPage}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = READER_ASSETS.fallback; }}
              />
            ) : (
              <div className="text-white/50">Página não encontrada</div>
            )}
          </div>
        )}

        {/* Modo contínuo (webtoon) */}
        {readingMode === 'continuous' && pages?.length > 0 && (
          <div
            id="webtoon-container"
            className="h-full w-full overflow-y-auto overflow-x-hidden flex flex-col items-center gap-0.5 py-16"
          >
            {pages.map((page, index) =>
              page ? (
                <img
                  key={`${page.id}-${index}`}
                  data-page-index={index}
                  src={getImageUrl(page.image_url)}
                  alt={`Página ${index + 1}`}
                  className="w-full max-w-3xl h-auto object-contain"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = READER_ASSETS.fallback; }}
                />
              ) : null
            )}
          </div>
        )}

        {/* Sem páginas */}
        {(!pages || pages.length === 0) && (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-sm">
              <img
                src={READER_ASSETS.empty}
                alt="Sem páginas"
                className="w-48 mx-auto rounded-xl opacity-60"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = READER_ASSETS.fallback; }}
              />
              <h2 className="text-white font-bold text-lg">Capítulo sem páginas</h2>
              <p className="text-white/40 text-sm">Este capítulo pode estar vazio ou com erro no upload.</p>
              <div className="flex flex-col gap-2">
                <Button onClick={loadChapter}>Tentar novamente</Button>
                <Button variant="secondary" onClick={() => navigate(`/manga/${mangaId}`)}>Voltar ao mangá</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════
          SETAS DE NAVEGAÇÃO
      ════════════════════════════════════════════ */}

      {readingMode !== 'continuous' && pages?.length > 0 && (
        <>
          <NavArrow
            direction="left"
            onClick={prevPage}
            disabled={currentPage === 0}
            visible={showControls}
          />
          <NavArrow
            direction="right"
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            visible={showControls}
          />
        </>
      )}

      {/* ════════════════════════════════════════════
          BARRA INFERIOR
      ════════════════════════════════════════════ */}

      {readingMode !== 'continuous' && pages?.length > 0 && (
        <div className={`fixed bottom-0 inset-x-0 z-50 transition-all duration-300 ease-in-out ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent pointer-events-none" />

          <div className="relative px-4 pb-5 pt-8 space-y-3">

            {/* Barra de progresso clicável */}
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-xs font-mono tabular-nums flex-shrink-0">
                {currentPage + 1}
              </span>
              <div
                className="flex-1 h-1 bg-white/15 rounded-full overflow-hidden cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct  = (e.clientX - rect.left) / rect.width;
                  setCurrentPage(Math.max(0, Math.min(Math.floor(pct * totalPages), totalPages - 1)));
                  scrollToTop();
                }}
              >
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white/50 text-xs font-mono tabular-nums flex-shrink-0">
                {totalPages}
              </span>

              {/* Zoom */}
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <ZoomBtn onClick={() => setZoom((z) => Math.max(50, z - 10))} title="Diminuir zoom">
                  <ZoomOut className="w-3.5 h-3.5" />
                </ZoomBtn>
                <span className="text-white/50 text-xs w-10 text-center tabular-nums">{zoom}%</span>
                <ZoomBtn onClick={() => setZoom((z) => Math.min(200, z + 10))} title="Aumentar zoom">
                  <ZoomIn className="w-3.5 h-3.5" />
                </ZoomBtn>
                <ZoomBtn onClick={() => setZoom(100)} title="Resetar zoom">
                  <RotateCw className="w-3.5 h-3.5" />
                </ZoomBtn>
              </div>
            </div>

            {/* Miniaturas das páginas */}
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {pages.map((page, index) =>
                page ? (
                  <button
                    key={page.id}
                    onClick={() => { setCurrentPage(index); scrollToTop(); }}
                    className={`flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                      currentPage === index
                        ? 'ring-2 ring-primary-500 scale-110 z-10'
                        : 'opacity-50 hover:opacity-80 hover:scale-105'
                    }`}
                    style={{ width: 44, height: 62 }}
                  >
                    <img
                      src={getImageUrl(page.image_url)}
                      alt={`Pág. ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ) : null
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Sub-componentes de UI ───────────────────────────────────────── */

const TopBtn = ({ onClick, title, active, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg text-sm transition-all ${
      active
        ? 'bg-primary-500/30 text-primary-300 ring-1 ring-primary-500/50'
        : 'text-white/60 hover:text-white hover:bg-white/10'
    }`}
  >
    {children}
  </button>
);

const NavArrow = ({ direction, onClick, disabled, visible }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`fixed top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-2xl transition-all duration-300 ${
      direction === 'left' ? 'left-3' : 'right-3'
    } ${
      visible ? 'opacity-100 translate-x-0' : direction === 'left' ? 'opacity-0 -translate-x-2' : 'opacity-0 translate-x-2'
    } ${
      disabled
        ? 'bg-white/5 text-white/20 cursor-not-allowed'
        : 'bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 hover:scale-105 active:scale-95'
    }`}
  >
    {direction === 'left'
      ? <ChevronLeft  className="w-6 h-6" />
      : <ChevronRight className="w-6 h-6" />}
  </button>
);

const ZoomBtn = ({ onClick, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
  >
    {children}
  </button>
);

const SettingSection = ({ label, children }) => (
  <div>
    <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2.5">{label}</p>
    {children}
  </div>
);

const SettingBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border text-white/70 transition-all ${
      active
        ? 'border-primary-500 bg-primary-500/15 text-primary-300'
        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
    }`}
  >
    {children}
  </button>
);

export default MangaReader;
