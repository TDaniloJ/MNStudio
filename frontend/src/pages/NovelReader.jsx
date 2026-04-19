import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ArrowLeft, Settings, X,
  BookOpen, Share, Maximize, Minimize, RotateCcw, List,
  Type, AlignJustify, AlignLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../services/novelService';
import { readingHistoryService } from '../services/readingHistoryService';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { notificationService } from '../services/userEnhancementService';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

/* ── Constantes ──────────────────────────────────────────────────── */

const FONT_FAMILIES = {
  serif:      'Georgia, "Times New Roman", serif',
  'sans-serif': 'system-ui, -apple-system, sans-serif',
  monospace:  '"JetBrains Mono", "Fira Code", Consolas, monospace',
};

const THEMES = {
  dark:  { bg: 'bg-gray-950',      text: 'text-gray-100',  border: 'border-gray-800',  header: 'bg-gray-950/95' },
  night: { bg: 'bg-[#0d0d0f]',     text: 'text-gray-300',  border: 'border-gray-900',  header: 'bg-[#0d0d0f]/95' },
  sepia: { bg: 'bg-[#f4ecd8]',     text: 'text-[#5c4b37]', border: 'border-[#d9c9a8]', header: 'bg-[#f4ecd8]/95' },
  light: { bg: 'bg-white',         text: 'text-gray-900',  border: 'border-gray-200',  header: 'bg-white/95' },
  paper: { bg: 'bg-[#fafaf8]',     text: 'text-gray-800',  border: 'border-gray-200',  header: 'bg-[#fafaf8]/95' },
};

const THEME_SWATCHES = [
  { id: 'dark',  label: 'Escuro', swatch: 'bg-gray-950 border border-white/10' },
  { id: 'night', label: 'Noturno', swatch: 'bg-[#0d0d0f] border border-white/10' },
  { id: 'sepia', label: 'Sépia', swatch: 'bg-[#f4ecd8]' },
  { id: 'light', label: 'Claro', swatch: 'bg-white border border-gray-300' },
  { id: 'paper', label: 'Papel', swatch: 'bg-[#fafaf8] border border-gray-300' },
];

/* ── Componente principal ────────────────────────────────────────── */

const NovelReader = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { publicSettings } = useSettingsStore();

  const [chapter,        setChapter]        = useState(null);
  const [novel,          setNovel]          = useState(null);
  const [chapters,       setChapters]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [readingProgress,setReadingProgress]= useState(0);
  const [isFullscreen,   setIsFullscreen]   = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [showChapters,   setShowChapters]   = useState(false);

  // Modais
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [showEndModal,    setShowEndModal]    = useState(false);
  const [showFirstModal,  setShowFirstModal]  = useState(false);
  const [nextChapterTarget,setNextChapterTarget] = useState(null);

  // Preferências (persistidas)
  const [fontSize,          setFontSize]         = useState(18);
  const [fontFamily,        setFontFamily]        = useState('serif');
  const [lineHeight,        setLineHeight]        = useState(1.8);
  const [theme,             setTheme]             = useState('dark');
  const [maxWidth,          setMaxWidth]          = useState(800);
  const [paragraphSpacing,  setParagraphSpacing]  = useState(1.5);
  const [justifyText,       setJustifyText]       = useState(true);
  const [showProgress,      setShowProgress]      = useState(true);
  const [autoAdvance,       setAutoAdvance]       = useState(false);

  const t = THEMES[theme] ?? THEMES.dark;

  /* ── Carregar preferências ──────────────────────────────────── */

  useEffect(() => {
    const saved = localStorage.getItem('novelReaderPreferences');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.fontSize)         setFontSize(p.fontSize);
        if (p.fontFamily)       setFontFamily(p.fontFamily);
        if (p.lineHeight)       setLineHeight(p.lineHeight);
        if (p.theme)            setTheme(p.theme);
        if (p.maxWidth)         setMaxWidth(p.maxWidth);
        if (p.paragraphSpacing) setParagraphSpacing(p.paragraphSpacing);
        if (p.justifyText !== undefined) setJustifyText(p.justifyText);
        if (p.showProgress !== undefined) setShowProgress(p.showProgress);
        if (p.autoAdvance !== undefined)  setAutoAdvance(p.autoAdvance === true || p.autoAdvance === 'true');
      } catch {}
    }
  }, []);

  useEffect(() => {
    const gv = publicSettings?.reader_auto_advance;
    if (gv !== undefined && gv !== null) setAutoAdvance(gv === true || gv === 'true');
  }, [publicSettings]);

  /* ── Dados ───────────────────────────────────────────────────── */

  useEffect(() => { loadChapter(); loadNovelData(); }, [chapterId, novelId]);

  const loadChapter = async () => {
    setLoading(true);
    try {
      const data = await novelService.getChapter(chapterId);
      setChapter(data.chapter);
      window.scrollTo(0, 0);
      setReadingProgress(0);
    } catch {
      toast.error('Erro ao carregar capítulo');
      navigate(`/novel/${novelId}`);
    } finally {
      setLoading(false);
    }
  };

  const loadNovelData = async () => {
    try {
      const data = await novelService.getById(novelId);
      setNovel(data.novel);
      setChapters(data.novel.chapters || []);
    } catch { /* silencioso */ }
  };

  /* ── Progresso de leitura ────────────────────────────────────── */

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const article = document.querySelector('article');
        if (article) {
          const progress = Math.min(100, Math.max(0,
            ((window.scrollY + window.innerHeight - article.offsetTop) / article.offsetHeight) * 100
          ));
          setReadingProgress(progress);
        }
        ticking = false;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapterId]);

  useEffect(() => {
    if (!chapter || !isAuthenticated) return;
    const id = setTimeout(() => {
      readingHistoryService.saveProgress({
        content_type: 'novel',
        content_id:   parseInt(novelId),
        chapter_id:   parseInt(chapterId),
        progress:     Math.floor(readingProgress),
      }).catch(() => {});
    }, 2000);
    return () => clearTimeout(id);
  }, [readingProgress]);

  /* ── Navegação ───────────────────────────────────────────────── */

  const getAdjacentChapters = () => {
    const idx = chapters.findIndex((ch) => ch.id === parseInt(chapterId));
    return { prev: chapters[idx - 1], next: chapters[idx + 1] };
  };

  const prevChapter = () => {
    const { prev } = getAdjacentChapters();
    if (prev) navigate(`/novel/${novelId}/chapter/${prev.id}`);
    else setShowFirstModal(true);
  };

  const nextChapter = () => {
    const { next } = getAdjacentChapters();
    if (!next) { setShowEndModal(true); return; }
    if (autoAdvance && readingProgress > 90) {
      navigate(`/novel/${novelId}/chapter/${next.id}`);
    } else {
      setNextChapterTarget(next.id);
      setShowNextConfirm(true);
    }
  };

  /* ── Teclado + swipe ─────────────────────────────────────────── */

  useEffect(() => {
    const handler = (e) => {
      if (showSettings || showChapters) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.code === 'Space') { e.preventDefault(); nextChapter(); }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); prevChapter(); }
      else if (e.key === 'Escape' && isFullscreen) document.exitFullscreen();
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === 's' || e.key === 'S') { e.preventDefault(); setShowSettings((v) => !v); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showSettings, showChapters, isFullscreen, chapter]);

  useEffect(() => {
    let startX = 0;
    const onStart = (e) => { startX = e.touches[0].clientX; };
    const onEnd   = (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (diff > 50) prevChapter();
      if (diff < -50) nextChapter();
    };
    window.addEventListener('touchstart', onStart);
    window.addEventListener('touchend', onEnd);
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd); };
  }, [chapter]);

  /* ── Fullscreen / Share ──────────────────────────────────────── */

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const shareChapter = async () => {
    const url = `${window.location.origin}/novel/${novelId}/chapter/${chapterId}`;
    if (navigator.share) {
      await navigator.share({ title: `${novel?.title} – Cap. ${chapter?.chapter_number}`, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    }
  };

  /* ── Salvar preferências ─────────────────────────────────────── */

  const savePreferences = () => {
    localStorage.setItem('novelReaderPreferences', JSON.stringify({
      fontSize, fontFamily, lineHeight, theme, maxWidth,
      paragraphSpacing, justifyText, showProgress, autoAdvance,
    }));
    toast.success('Preferências salvas!');
  };

  const resetPreferences = () => {
    setFontSize(18); setFontFamily('serif'); setLineHeight(1.8);
    setTheme('dark'); setMaxWidth(800); setParagraphSpacing(1.5);
    setJustifyText(true); setShowProgress(true);
    toast.success('Preferências resetadas');
  };

  /* ── Conteúdo sanitizado ─────────────────────────────────────── */

  const sanitizedContent = useMemo(() => {
    if (!chapter?.content) return '';
    return DOMPurify.sanitize(marked.parse(chapter.content));
  }, [chapter?.content]);

  /* ── Render ──────────────────────────────────────────────────── */

  if (loading || !chapter) return <Loading fullScreen />;

  const { prev, next } = getAdjacentChapters();

  return (
    <div className={`min-h-screen ${t.bg} ${t.text} transition-colors duration-300`}>

      {/* ── Barra de progresso ──────────────────────────────────── */}
      {showProgress && (
        <div className={`fixed top-0 inset-x-0 h-0.5 z-50 ${t.border} border-b`}>
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* ── Modais ──────────────────────────────────────────────── */}

      <Modal isOpen={showNextConfirm} onClose={() => setShowNextConfirm(false)} title="Próximo capítulo?" size="sm">
        <p className="mb-5 text-gray-500 dark:text-gray-400">Deseja continuar para o próximo capítulo?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowNextConfirm(false)}>Ficar aqui</Button>
          <Button onClick={() => { setShowNextConfirm(false); if (nextChapterTarget) navigate(`/novel/${novelId}/chapter/${nextChapterTarget}`); }}>
            Próximo →
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showEndModal} onClose={() => setShowEndModal(false)} title="Fim dos capítulos" size="sm">
        <p className="mb-5 text-gray-500 dark:text-gray-400">Você chegou ao fim dos capítulos desta novel.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate(`/novel/${novelId}`)}>Ver detalhes</Button>
          <Button onClick={() => setShowEndModal(false)}>Ok</Button>
        </div>
      </Modal>

      <Modal isOpen={showFirstModal} onClose={() => setShowFirstModal(false)} title="Primeiro capítulo" size="sm">
        <p className="mb-5 text-gray-500 dark:text-gray-400">Você já está no primeiro capítulo.</p>
        <div className="flex justify-end">
          <Button onClick={() => setShowFirstModal(false)}>Ok</Button>
        </div>
      </Modal>

      {/* ── Header sticky ───────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 ${t.header} ${t.border} border-b backdrop-blur-md`}>
        <div className="container-custom flex items-center justify-between h-12 gap-4">

          {/* Esquerda */}
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate(`/novel/${novelId}`)}
              className="text-current opacity-50 hover:opacity-100 transition flex-shrink-0 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">{novel?.title}</p>
              <p className="text-xs opacity-50 truncate">
                Capítulo {parseFloat(chapter.chapter_number) || '1'}
                {chapter.title && ` — ${chapter.title}`}
              </p>
            </div>
          </div>

          {/* Direita */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <HdrBtn onClick={shareChapter}><Share className="w-4 h-4" /></HdrBtn>
            <HdrBtn onClick={() => { setShowChapters((v) => !v); setShowSettings(false); }} active={showChapters}>
              <List className="w-4 h-4" />
            </HdrBtn>
            <HdrBtn onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </HdrBtn>
            <HdrBtn onClick={() => { setShowSettings((v) => !v); setShowChapters(false); }} active={showSettings}>
              <Settings className="w-4 h-4" />
            </HdrBtn>
          </div>
        </div>
      </header>

      {/* ── Painel de capítulos ─────────────────────────────────── */}
      <div className={`fixed top-12 right-0 bottom-0 w-72 z-40 transition-all duration-300 ${showChapters ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className={`h-full ${t.bg} ${t.border} border-l flex flex-col`}>
          <div className={`flex items-center justify-between px-4 py-3 ${t.border} border-b flex-shrink-0`}>
            <span className="text-sm font-bold">Capítulos</span>
            <button onClick={() => setShowChapters(false)} className="opacity-50 hover:opacity-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-1.5">
            {chapters.map((ch) => {
              const isCurrent = ch.id === parseInt(chapterId);
              return (
                <button key={ch.id}
                  onClick={() => { navigate(`/novel/${novelId}/chapter/${ch.id}`); setShowChapters(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-primary-500/15 text-primary-500 border-r-2 border-primary-500'
                      : 'opacity-60 hover:opacity-100 hover:bg-white/5'
                  }`}>
                  <span className="w-6 text-right text-xs font-mono opacity-40 flex-shrink-0">
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

      {/* ── Painel de configurações ──────────────────────────────── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="relative bg-gray-950 rounded-2xl border border-white/10 w-full max-w-sm max-h-[85vh] overflow-y-auto shadow-2xl">

            <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gray-950 rounded-t-2xl">
              <span className="text-white font-bold flex items-center gap-2">
                <Type className="w-4 h-4 text-primary-400" />
                Configurações
              </span>
              <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6">

              {/* Tema */}
              <SettSection label="Tema">
                <div className="grid grid-cols-5 gap-2">
                  {THEME_SWATCHES.map(({ id, label, swatch }) => (
                    <button key={id} onClick={() => setTheme(id)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                        theme === id ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20'
                      }`}>
                      <div className={`w-full h-6 rounded-lg ${swatch}`} />
                      <span className="text-[10px] text-white/50">{label}</span>
                    </button>
                  ))}
                </div>
              </SettSection>

              {/* Tamanho da fonte */}
              <SettSection label={`Fonte: ${fontSize}px`}>
                <input type="range" min="14" max="26" value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-primary-500" />
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>Pequena</span><span>Grande</span>
                </div>
              </SettSection>

              {/* Família da fonte */}
              <SettSection label="Fonte">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'serif',      label: 'Serif',  sample: 'Aa' },
                    { value: 'sans-serif', label: 'Sans',   sample: 'Aa' },
                    { value: 'monospace',  label: 'Mono',   sample: 'Aa' },
                  ].map(({ value, label, sample }) => (
                    <SettBtn key={value} active={fontFamily === value} onClick={() => setFontFamily(value)}>
                      <span className="text-base" style={{ fontFamily: FONT_FAMILIES[value] }}>{sample}</span>
                      <span className="text-[10px]">{label}</span>
                    </SettBtn>
                  ))}
                </div>
              </SettSection>

              {/* Espaçamento */}
              <SettSection label={`Espaço entre linhas: ${lineHeight}`}>
                <input type="range" min="1.2" max="2.5" step="0.1" value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full accent-primary-500" />
              </SettSection>

              <SettSection label={`Espaço entre parágrafos: ${paragraphSpacing}em`}>
                <input type="range" min="0.5" max="3" step="0.1" value={paragraphSpacing}
                  onChange={(e) => setParagraphSpacing(Number(e.target.value))}
                  className="w-full accent-primary-500" />
              </SettSection>

              {/* Largura */}
              <SettSection label={`Largura do texto: ${maxWidth}px`}>
                <input type="range" min="500" max="1200" step="50" value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full accent-primary-500" />
              </SettSection>

              {/* Toggles */}
              <SettSection label="Opções">
                <ToggleRow label="Texto justificado"     checked={justifyText}    onChange={setJustifyText} />
                <ToggleRow label="Barra de progresso"    checked={showProgress}   onChange={setShowProgress} />
                <ToggleRow label="Avançar automaticamente" checked={autoAdvance}  onChange={setAutoAdvance} />
              </SettSection>

              {/* Presets */}
              <SettSection label="Predefinições rápidas">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setFontSize(16); setLineHeight(1.6); setMaxWidth(700); }}
                    className="py-2.5 px-3 rounded-xl border border-white/10 hover:border-white/20 text-xs text-white/60 hover:text-white transition">
                    📱 Mobile
                  </button>
                  <button onClick={() => { setFontSize(20); setLineHeight(1.9); setMaxWidth(900); }}
                    className="py-2.5 px-3 rounded-xl border border-white/10 hover:border-white/20 text-xs text-white/60 hover:text-white transition">
                    🖥️ Desktop
                  </button>
                </div>
              </SettSection>

              {/* Atalhos */}
              <SettSection label="Atalhos de teclado">
                <div className="space-y-2 text-xs text-white/40">
                  {[['→ / Espaço', 'Próximo cap.'], ['←', 'Cap. anterior'], ['F', 'Tela cheia'], ['S', 'Configurações']].map(([k, d]) => (
                    <div key={k} className="flex justify-between">
                      <kbd className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-white/60">{k}</kbd>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </SettSection>

              <div className="flex gap-2">
                <button onClick={resetPreferences}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition">
                  <RotateCcw className="w-3.5 h-3.5" /> Resetar
                </button>
                <button onClick={() => { savePreferences(); setShowSettings(false); }}
                  className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition">
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Conteúdo do capítulo ─────────────────────────────────── */}
      <main className="py-10 px-4">
        <article
          className="mx-auto transition-all duration-300"
          style={{ maxWidth: `${maxWidth}px`, fontSize: `${fontSize}px`, fontFamily: FONT_FAMILIES[fontFamily], lineHeight }}
        >
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-black mb-2">
              Capítulo {parseFloat(chapter.chapter_number) || '1'}
            </h1>
            {chapter.title && (
              <h2 className="text-xl opacity-60 mb-3">{chapter.title}</h2>
            )}
            <p className="text-sm opacity-40">
              {novel?.author && `${novel.author} · `}
              {new Date(chapter.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className={`mt-6 h-px opacity-20 ${theme === 'light' || theme === 'sepia' || theme === 'paper' ? 'bg-gray-800' : 'bg-white'}`} />
          </header>

          <div
            className={`prose max-w-none ${justifyText ? 'text-justify' : 'text-left'} ${
              theme === 'dark' || theme === 'night'
                ? 'prose-invert'
                : theme === 'sepia'
                ? '[--tw-prose-body:#5c4b37] [--tw-prose-headings:#3d2e1a]'
                : ''
            }`}
            style={{ '--paragraph-spacing': `${paragraphSpacing}em` }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              style={{ '& p': { marginBottom: `${paragraphSpacing}em` } }}
            />
          </div>

          <div className={`mt-12 h-px opacity-20 ${theme === 'light' || theme === 'sepia' || theme === 'paper' ? 'bg-gray-800' : 'bg-white'}`} />
        </article>
      </main>

      {/* ── Navegação inferior ───────────────────────────────────── */}
      <footer className={`sticky bottom-0 ${t.header} ${t.border} border-t backdrop-blur-md`}>
        <div className="container-custom py-3">
          <div className="flex items-center justify-between gap-4">
            <button onClick={prevChapter} disabled={!prev}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition ${
                prev
                  ? `${t.border} opacity-80 hover:opacity-100 hover:bg-white/5`
                  : 'opacity-20 cursor-not-allowed border-transparent'
              }`}>
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <span className="text-xs opacity-40 font-mono tabular-nums">
              {Math.floor(readingProgress)}%
            </span>

            <button onClick={nextChapter} disabled={!next}
              className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition ${
                next
                  ? `${t.border} opacity-80 hover:opacity-100 hover:bg-white/5`
                  : 'opacity-20 cursor-not-allowed border-transparent'
              }`}>
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ── Sub-componentes ─────────────────────────────────────────────── */

const HdrBtn = ({ onClick, active, children }) => (
  <button onClick={onClick}
    className={`p-2 rounded-lg text-sm transition-all ${
      active ? 'bg-primary-500/20 text-primary-400' : 'opacity-50 hover:opacity-100 hover:bg-white/5'
    }`}>
    {children}
  </button>
);

const SettSection = ({ label, children }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2.5">{label}</p>
    {children}
  </div>
);

const SettBtn = ({ active, onClick, children }) => (
  <button onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border text-white/60 transition-all ${
      active ? 'border-primary-500 bg-primary-500/15 text-primary-300' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
    }`}>
    {children}
  </button>
);

const ToggleRow = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-white/60">{label}</span>
    <div onClick={() => onChange(!checked)}
      className={`relative w-9 h-5 rounded-full cursor-pointer transition-colors ${checked ? 'bg-primary-500' : 'bg-white/15'}`}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
    </div>
  </div>
);

export default NovelReader;