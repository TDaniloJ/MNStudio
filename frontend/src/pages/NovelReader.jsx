import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  Settings,
  X,
  Type,
  Moon,
  Sun,
  Bookmark,
  Share,
  BookOpen,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../services/novelService';
import { readingHistoryService } from '../services/readingHistoryService';
import { useAuthStore } from '../store/authStore';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useSettingsStore } from '../store/settingsStore';
import { notificationService } from '../services/userEnhancementService';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

const NovelReader = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [chapter, setChapter] = useState(null);
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [nextChapterTarget, setNextChapterTarget] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showFirstModal, setShowFirstModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Reading preferences
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('serif');
  const [lineHeight, setLineHeight] = useState(1.8);
  const [theme, setTheme] = useState('light');
  const [maxWidth, setMaxWidth] = useState(800);
  const [paragraphSpacing, setParagraphSpacing] = useState(1.5);
  const [justifyText, setJustifyText] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const { publicSettings } = useSettingsStore();

  const [autoAdvance, setAutoAdvance] = useState(false);

  const formatContent = (content) => {
    if (!content) return '';
    
    return content
      .split(/\n\s*\n/)
      .map(paragraph => {
        const trimmed = paragraph.trim();
        return trimmed ? `<p>${trimmed.replace(/\n/g, '<br/>')}</p>` : '';
      })
      .join('');
  };

  const sanitizedContent = useMemo(() => {
    if (!chapter?.content) return '';
    
    const rawHtml = marked.parse(chapter.content);
    return DOMPurify.sanitize(rawHtml);
  }, [chapter?.content]);

useEffect(() => {
  loadChapter();
  loadNovelData();
}, [chapterId, novelId]);

  useEffect(() => {
    const gv = publicSettings?.reader_auto_advance;
    if (gv !== undefined && gv !== null) {
      const val = gv === true || gv === 'true';
      setAutoAdvance(val);
    }
  }, [publicSettings]);

useEffect(() => {
  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const article = document.querySelector('article');
        if (article) {
          const scrollTop = window.scrollY;
          const articleTop = article.offsetTop;
          const articleHeight = article.offsetHeight;
          const windowHeight = window.innerHeight;

          const progress = Math.min(100, Math.max(0,
            ((scrollTop + windowHeight - articleTop) / articleHeight) * 100
          ));

          setReadingProgress(progress);
        }
        ticking = false;
      });

      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [chapterId]);

  useEffect(() => {
    if (!chapter || !isAuthenticated) return;

    const timeout = setTimeout(() => {
      saveProgress();
    }, 2000); // debounce

    return () => clearTimeout(timeout);
  }, [readingProgress]);

    // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showSettings || showChapters) return;
      
      switch(e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          nextChapter();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevChapter();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          setShowSettings(!showSettings);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSettings, showChapters, isFullscreen]);

  useEffect(() => {
  let touchStartX = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;

    if (diff > 50) prevChapter();
    if (diff < -50) nextChapter();
  };

  window.addEventListener('touchstart', handleTouchStart);
  window.addEventListener('touchend', handleTouchEnd);

  return () => {
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchend', handleTouchEnd);
  };
}, []);

  const handleMarkAsRead = async () => {
    try {
      // ... marcar como lido ...
      
      // Atualizar notificações
      const data = await notificationService.getNotifications(false, 10);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      
      // Toast de confirmação
      toast.success('Capítulo marcado como lido!');
    } catch (error) {
      toast.error('Erro ao marcar capítulo');
    }
  };

  const loadChapter = async () => {
    try {
      setLoading(true);
      const data = await novelService.getChapter(chapterId);
      setChapter(data.chapter);
      
      // Scroll to top when chapter changes
      window.scrollTo(0, 0);
    } catch (error) {
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
      
      // Check if bookmarked
      if (isAuthenticated) {
        // Implement bookmark check logic here
      }
    } catch (error) {
      console.error('Erro ao carregar dados da novel:', error);
    }
  };

  const saveProgress = async () => {
    try {
      await readingHistoryService.saveProgress({
        content_type: 'novel',
        content_id: parseInt(novelId),
        chapter_id: parseInt(chapterId),
        progress: Math.floor(readingProgress)
      });
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  const loadPreferences = () => {
    const saved = localStorage.getItem('novelReaderPreferences');
    if (saved) {
      const prefs = JSON.parse(saved);
      setFontSize(prefs.fontSize || 18);
      setFontFamily(prefs.fontFamily || 'serif');
      setLineHeight(prefs.lineHeight || 1.8);
      setTheme(prefs.theme || 'light');
      setMaxWidth(prefs.maxWidth || 800);
      setParagraphSpacing(prefs.paragraphSpacing || 1.5);
      setJustifyText(prefs.justifyText !== false);
      setShowProgress(prefs.showProgress !== false);
      setAutoAdvance(prefs.autoAdvance === true || prefs.autoAdvance === 'true');
    }
  };

  const savePreferences = () => {
    const prefs = { 
      fontSize, 
      fontFamily, 
      lineHeight, 
      theme, 
      maxWidth,
      paragraphSpacing,
      justifyText,
      showProgress
      , autoAdvance
    };
    localStorage.setItem('novelReaderPreferences', JSON.stringify(prefs));
    toast.success('Preferências salvas');
  };

  const resetPreferences = () => {
    setFontSize(18);
    setFontFamily('serif');
    setLineHeight(1.8);
    setTheme('light');
    setMaxWidth(800);
    setParagraphSpacing(1.5);
    setJustifyText(true);
    setShowProgress(true);
    toast.success('Preferências resetadas');
  };

  const toggleBookmark = async () => {
    try {
      // Implement bookmark logic here
      setIsBookmarked(!isBookmarked);
      toast.success(isBookmarked ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    } catch (error) {
      toast.error('Erro ao atualizar favoritos');
    }
  };

  const shareChapter = async () => {
    try {
      const shareUrl = `${window.location.origin}/novel/${novelId}/chapter/${chapterId}`;
      if (navigator.share) {
        await navigator.share({
          title: `${novel?.title} - Capítulo ${chapter?.chapter_number}`,
          text: chapter?.title || '',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copiado para a área de transferência');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getAdjacentChapters = () => {
    if (!chapters.length) return { prev: null, next: null };
    
    const currentIndex = chapters.findIndex(ch => ch.id === parseInt(chapterId));
    return {
      prev: chapters[currentIndex - 1],
      next: chapters[currentIndex + 1]
    };
  };

  const prevChapter = () => {
    const { prev } = getAdjacentChapters();
    if (prev) {
      navigate(`/novel/${novelId}/chapter/${prev.id}`);
    } else {
      setShowFirstModal(true);
    }
  };

  const nextChapter = () => {
    const { next } = getAdjacentChapters();

    if (!next) {
      setShowEndModal(true);
      return;
    }

    const isNearEnd = readingProgress > 90;

    if (autoAdvance && isNearEnd) {
      navigate(`/novel/${novelId}/chapter/${next.id}`);
    } else {
      setNextChapterTarget(next.id);
      setShowNextConfirm(true);
    }
  };



  if (loading || !chapter) {
    return <Loading fullScreen />;
  }

  const { prev, next } = getAdjacentChapters();
  const fontFamilies = {
    'serif': 'Georgia, "Times New Roman", serif',
    'sans-serif': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'monospace': '"JetBrains Mono", "Fira Code", Consolas, monospace'
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-[#f4ecd8] text-[#5c4b37]',
    night: 'bg-gray-950 text-gray-300',
    paper: 'bg-[#fefefe] text-gray-800'
  };

  return (
    <div className={`min-h-screen ${themeClasses[theme]} transition-colors duration-300`}>
      {/* Next / End Modals */}
      <Modal
        isOpen={showNextConfirm}
        onClose={() => setShowNextConfirm(false)}
        title="Ir para o próximo capítulo?"
        size="sm"
      >
        <p className="mb-4">Deseja abrir o próximo capítulo agora?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowNextConfirm(false)}>Cancelar</Button>
          <Button onClick={() => {
            setShowNextConfirm(false);
            if (nextChapterTarget) navigate(`/novel/${novelId}/chapter/${nextChapterTarget}`);
          }}>Ir ao próximo</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="Fim dos capítulos"
        size="sm"
      >
        <p className="mb-4">Você chegou ao fim dos capítulos desta novel.</p>
        <div className="flex justify-end">
          <Button onClick={() => setShowEndModal(false)}>Ok</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showFirstModal}
        onClose={() => setShowFirstModal(false)}
        title="Primeiro capítulo"
        size="sm"
      >
        <p className="mb-4">Você já está no primeiro capítulo desta novel.</p>
        <div className="flex justify-end">
          <Button onClick={() => setShowFirstModal(false)}>Ok</Button>
        </div>
      </Modal>
      {/* Progress Bar */}
      {showProgress && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 z-50">
          <div 
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-inherit border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-95">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/novel/${novelId}`)}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold truncate" title={novel?.title}>
                  {novel?.title}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  Capítulo {chapter.chapter_number}
                  {chapter.title && ` - ${chapter.title}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleBookmark}
                className={isBookmarked ? 'text-yellow-500' : ''}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={shareChapter}
              >
                <Share className="w-4 h-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowChapters(true)}
              >
                <BookOpen className="w-4 h-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Modal */}
      {showChapters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className={`${themeClasses[theme]} rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold">Capítulos</h3>
              <button onClick={() => setShowChapters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[60vh]">
              {chapters.map((chap) => (
                <button
                  key={chap.id}
                  onClick={() => {
                    navigate(`/novel/${novelId}/chapter/${chap.id}`);
                    setShowChapters(false);
                  }}
                  className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                    chap.id === parseInt(chapterId) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : ''
                  }`}
                >
                  <div className="font-medium">
                    Capítulo {chap.chapter_number}
                    {chap.title && ` - ${chap.title}`}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(chap.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className={`${themeClasses[theme]} rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Configurações de Leitura</h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium mb-3">Predefinições</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setFontSize(16);
                      setLineHeight(1.6);
                      setMaxWidth(700);
                    }}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    📱 Mobile
                  </button>
                  <button
                    onClick={() => {
                      setFontSize(20);
                      setLineHeight(1.8);
                      setMaxWidth(900);
                    }}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    🖥️ Desktop
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tamanho da Fonte: {fontSize}px
                </label>
                <input
                  type="range"
                  min="14"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium mb-2">Fonte</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full input dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="serif">Serif (Tradicional)</option>
                  <option value="sans-serif">Sans Serif (Moderno)</option>
                  <option value="monospace">Monospace (Programação)</option>
                </select>
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Espaçamento entre linhas: {lineHeight}
                </label>
                <input
                  type="range"
                  min="1.2"
                  max="2.5"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Paragraph Spacing */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Espaçamento entre parágrafos: {paragraphSpacing}em
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={paragraphSpacing}
                  onChange={(e) => setParagraphSpacing(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Max Width */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Largura do texto: {maxWidth}px
                </label>
                <input
                  type="range"
                  min="500"
                  max="1200"
                  step="50"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Text Alignment */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={justifyText}
                    onChange={(e) => setJustifyText(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">Texto justificado</span>
                </label>
              </div>

              {/* Show Progress */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showProgress}
                    onChange={(e) => setShowProgress(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">Mostrar barra de progresso</span>
                </label>
              </div>

              {/* Auto Advance */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium">Avançar automaticamente para próximo capítulo</span>
                </label>
              </div>

              {/* Theme */}
              <div>
                <label className="block text-sm font-medium mb-2">Tema</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'light', label: 'Claro', icon: Sun },
                    { value: 'dark', label: 'Escuro', icon: Moon },
                    { value: 'sepia', label: 'Sépia', icon: Type },
                    { value: 'night', label: 'Noturno', icon: Moon },
                    { value: 'paper', label: 'Papel', icon: Type }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
                        theme === value 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={resetPreferences}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Resetar
                </Button>
                <Button
                  onClick={() => {
                    savePreferences();
                    setShowSettings(false);
                  }}
                  className="flex-1"
                >
                  Salvar
                </Button>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Atalhos de Teclado</h4>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p><kbd className="px-2 py-1 bg-white dark:bg-gray-700 border rounded">→</kbd> ou <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border rounded">Space</kbd> - Próximo capítulo</p>
                  <p><kbd className="px-2 py-1 bg-white dark:bg-gray-700 border rounded">←</kbd> - Capítulo anterior</p>
                  <p><kbd className="px-2 py-1 bg-white dark:bg-gray-700 border rounded">F</kbd> - Tela cheia</p>
                  <p><kbd className="px-2 py-1 bg-white dark:bg-gray-700 border rounded">S</kbd> - Configurações</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto py-8 px-4">
        <article 
          className="mx-auto transition-all duration-300"
          style={{ 
            maxWidth: `${maxWidth}px`,
            fontSize: `${fontSize}px`,
            fontFamily: fontFamilies[fontFamily],
            lineHeight: lineHeight
          }}
        >
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">
              Capítulo {chapter.chapter_number}
            </h1>
            {chapter.title && (
              <h2 className="text-xl opacity-75 mb-4">
                {chapter.title}
              </h2>
            )}
            <div className="text-sm opacity-60">
              {novel?.author && <span>Por {novel.author} • </span>}
              {new Date(chapter.created_at).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </header>
          
          <div 
            className={`prose max-w-none transition-all duration-300 ${
              justifyText ? 'text-justify' : 'text-left'
            }`}
            style={{ 
              '--tw-prose-body': 'inherit',
              '--tw-prose-headings': 'inherit',
              '--tw-prose-links': 'inherit',
              '--tw-prose-bold': 'inherit',
              '--tw-prose-counters': 'inherit',
              '--tw-prose-bullets': 'inherit',
              '--tw-prose-quotes': 'inherit',
              '--tw-prose-quote-borders': 'inherit',
            }}
          >
            <div 
              style={{ marginBottom: `${paragraphSpacing}em` }}
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>
        </article>
      </div>

      <div>
        {/* ... conteúdo do leitor ... */}
        <Button onClick={handleMarkAsRead}>
          Marcar como Lido
        </Button>
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 bg-inherit backdrop-blur-sm bg-opacity-95">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={prevChapter}
              disabled={!prev}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {Math.floor(readingProgress)}% lido
            </div>
            
            <Button
              onClick={nextChapter}
              disabled={!next}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelReader;