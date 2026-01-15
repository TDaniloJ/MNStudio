import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  List,
  Settings,
  X,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw
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

const MangaReader = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Configurações
  const [readingMode, setReadingMode] = useState(
    localStorage.getItem('mangaReadingMode') || 'single'
  );
  const [fitMode, setFitMode] = useState(
    localStorage.getItem('mangaFitMode') || 'fit-height'
  );
  const [backgroundColor, setBackgroundColor] = useState(
    localStorage.getItem('mangaBgColor') || 'black'
  );
  const { publicSettings } = useSettingsStore();

  const [autoAdvance, setAutoAdvance] = useState(
    localStorage.getItem('mangaAutoAdvance') === 'true'
  );

  // Override with global public setting when available
  useEffect(() => {
    const gv = publicSettings?.reader_auto_advance;
    if (gv !== undefined && gv !== null) {
      const val = gv === true || gv === 'true';
      setAutoAdvance(val);
    }
  }, [publicSettings]);
  const [preloadPages, setPreloadPages] = useState(3);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Zoom (para modo single)
  const [zoom, setZoom] = useState(100);

  // ✅ ADICIONE ESTE ESTADO PARA PÁGINAS
  const [pages, setPages] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(-1);
  const [showNextConfirm, setShowNextConfirm] = useState(false);
  const [nextChapterTarget, setNextChapterTarget] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);

  useEffect(() => {
    loadChapter();
    
    // Auto-hide controls
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [chapterId]);

  useEffect(() => {
    if (chapter && isAuthenticated) {
      saveProgress();
    }
  }, [currentPage, chapter]);

  // Preload images
  useEffect(() => {
    if (pages && pages.length > 0) {
      preloadImages();
    }
  }, [currentPage, pages, preloadPages]);

  // ✅ ATUALIZE A FUNÇÃO loadChapter
  const loadChapter = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando capítulo:', chapterId);
      
      const data = await mangaService.getChapterPages(chapterId);
      console.log('📊 Dados completos da API:', data);
      
      if (!data) {
        throw new Error('Nenhum dado retornado pela API');
      }
      
      // ✅ VERIFICAÇÃO DE SUCESSO
      if (data.success === false) {
        throw new Error(data.error || 'Falha ao carregar capítulo');
      }
      
      // ✅ EXTRAÇÃO CORRETA DOS DADOS
      const pagesData = data.pages || [];
      const chapterData = data.chapter || {
        id: chapterId,
        chapter_number: '1',
        title: '',
        manga: { id: mangaId, title: 'Mangá' }
      };
      
      console.log('📖 Dados do capítulo extraídos:', chapterData);
      console.log('📄 Páginas extraídas:', pagesData.length);
      
      setPages(pagesData);
      setChapter(chapterData);
      setCurrentPage(0);

      // Carregar lista de capítulos do mangá para navegação entre capítulos
      try {
        const chaptersData = await mangaService.getMangaChapters(mangaId);
        const list = chaptersData.chapters || [];
        setChapters(list);
        const idx = list.findIndex(c => String(c.id) === String(chapterId));
        setCurrentChapterIndex(idx);
      } catch (err) {
        console.warn('Não foi possível carregar lista de capítulos:', err?.message || err);
        setChapters([]);
        setCurrentChapterIndex(-1);
      }
      
      if (pagesData.length === 0) {
        toast.error('Este capítulo não possui páginas');
      } else {
        console.log('✅ Capítulo carregado com sucesso!');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar capítulo:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao carregar capítulo';
      toast.error(errorMessage);
      navigate(`/manga/${mangaId}`);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async () => {
    try {
      await readingHistoryService.saveProgress({
        content_type: 'manga',
        content_id: parseInt(mangaId),
        chapter_id: parseInt(chapterId),
        last_page: currentPage
      });
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  const preloadImages = () => {
    if (!pages || pages.length === 0) return;
    
    const startIdx = Math.max(0, currentPage - 1);
    const endIdx = Math.min(pages.length, currentPage + preloadPages + 1);
    
    for (let i = startIdx; i < endIdx; i++) {
      const img = new Image();
      img.src = getImageUrl(pages[i]?.image_url);
    }
  };

  const nextPage = useCallback(() => {
    if (pages && pages.length > 0 && currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      // Fim do capítulo
      const hasNextChapter = chapters && currentChapterIndex >= 0 && currentChapterIndex < chapters.length - 1;
      if (hasNextChapter) {
        const nextChapter = chapters[currentChapterIndex + 1];
        if (autoAdvance) {
          navigate(`/manga/${mangaId}/chapter/${nextChapter.id}`);
        } else {
          setNextChapterTarget(nextChapter.id);
          setShowNextConfirm(true);
        }
      } else {
        // Não há próximo capítulo
        setShowEndModal(true);
      }
    }
  }, [currentPage, pages, autoAdvance]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    // Ignore when settings or chapter list are open or when typing in inputs
    if (showSettings || showChapterList) return;
    const tag = e.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;

    // Normalize keys
    const key = e.key;
    const tp = pages ? pages.length : 0;

    if (key === 'ArrowRight' || key === 'Right' || e.code === 'Space') {
      e.preventDefault();
      nextPage();
      return;
    }

    if (key === 'ArrowLeft' || key === 'Left') {
      e.preventDefault();
      prevPage();
      return;
    }

    if (key === 'Home') {
      e.preventDefault();
      setCurrentPage(0);
      return;
    }

    if (key === 'End') {
      e.preventDefault();
      setCurrentPage(tp > 0 ? tp - 1 : 0);
      return;
    }

    if (key === 'f' || key === 'F') {
      e.preventDefault();
      toggleFullscreen();
      return;
    }
  }, [showSettings, showChapterList, nextPage, prevPage, pages]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('mangaReadingMode', readingMode);
    localStorage.setItem('mangaFitMode', fitMode);
    localStorage.setItem('mangaBgColor', backgroundColor);
    localStorage.setItem('mangaAutoAdvance', autoAdvance);
    toast.success('Configurações salvas');
  };

  // ✅ ADICIONE ESTA VERIFICAÇÃO NO INÍCIO DO RENDER
  if (loading) {
    return <Loading fullScreen />;
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Capítulo não encontrado</h2>
          <Button onClick={() => navigate(`/manga/${mangaId}`)}>
            Voltar para o mangá
          </Button>
        </div>
      </div>
    );
  }

  const bgColors = {
    black: 'bg-black',
    dark: 'bg-gray-900',
    gray: 'bg-gray-800',
    white: 'bg-white'
  };

  const fitModes = {
    'fit-width': 'w-full h-auto',
    'fit-height': 'h-screen w-auto',
    'fit-both': 'max-w-full max-h-screen',
    'original': 'w-auto h-auto'
  };

  // ✅ USE pages EM VEZ DE chapter.pages EM TODO O COMPONENTE
  const totalPages = pages ? pages.length : 0;
  const currentPageData = pages && pages[currentPage];

  return (
    <div 
      className={`fixed inset-0 ${bgColors[backgroundColor]}`}
      onMouseMove={() => setShowControls(true)}
      onClick={() => {
        if (!showSettings && !showChapterList) {
          setShowControls(true);
          setTimeout(() => setShowControls(false), 3000);
        }
      }}
    >
      {/* Modals */}
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
            if (nextChapterTarget) navigate(`/manga/${mangaId}/chapter/${nextChapterTarget}`);
          }}>Ir ao próximo</Button>
        </div>
      </Modal>

      <Modal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="Fim dos capítulos"
        size="sm"
      >
        <p className="mb-4">Você chegou ao fim dos capítulos deste mangá.</p>
        <div className="flex justify-end">
          <Button onClick={() => setShowEndModal(false)}>Ok</Button>
        </div>
      </Modal>

      {/* Top Controls */}
      <div 
        className={`fixed top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 z-50 transition-all duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/manga/${mangaId}`)}
              className="bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="text-white">
              <h2 className="font-semibold text-lg">
                {chapter?.manga?.title || 'Carregando...'}
              </h2>
              <p className="text-sm text-gray-300">
                Capítulo {chapter?.chapter_number || '1'}
                {chapter?.title && ` - ${chapter.title}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowChapterList(!showChapterList)}
              className="bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-white/10 hover:bg-white/20 text-white border-0"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 dark:bg-gray-900/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto dark:bg-gray-800">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-xl font-semibold">Configurações de Leitura</h3>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Reading Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Modo de Leitura
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setReadingMode('single')}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition hover:border-gray-300 dark:bg-transparent ${
                      readingMode === 'single'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-transparent'
                    }`}
                  >
                    Página Única
                  </button>
                  <button
                    onClick={() => setReadingMode('double')}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition hover:border-gray-300 dark:bg-transparent ${
                      readingMode === 'double'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-transparent'
                    }`}
                  >
                    Página Dupla
                  </button>
                  <button
                    onClick={() => setReadingMode('continuous')}
                    className={`p-3 border-2 rounded-lg text-sm font-medium transition hover:border-gray-300 dark:bg-transparent ${
                      readingMode === 'continuous'
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-transparent'
                    }`}
                  >
                    Contínuo
                  </button>
                </div>
              </div>

              {/* Fit Mode */}
              {readingMode !== 'continuous' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Ajuste da Imagem
                  </label>
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                  >
                    <option value="fit-width">Ajustar à Largura</option>
                    <option value="fit-height">Ajustar à Altura</option>
                    <option value="fit-both">Ajustar Ambos</option>
                    <option value="original">Tamanho Original</option>
                  </select>
                </div>
              )}

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Cor de Fundo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'black', label: 'Preto', class: 'bg-black' },
                    { value: 'dark', label: 'Escuro', class: 'bg-gray-900' },
                    { value: 'gray', label: 'Cinza', class: 'bg-gray-800' },
                    { value: 'white', label: 'Branco', class: 'bg-white' }
                  ].map(color => (
                    <button
                      key={color.value}
                      onClick={() => setBackgroundColor(color.value)}
                      className={`p-3 border-2 rounded-lg text-xs font-medium transition hover:border-gray-300 dark:bg-transparent ${
                        backgroundColor === color.value
                          ? 'border-primary-500'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-transparent'
                      }`}
                    >
                      <div className={`w-full h-8 rounded mb-1 ${color.class} ${color.value === 'white' ? 'border border-gray-300 dark:border-gray-600' : ''}`} />
                      {color.label}
                    </button>
                  ))}
                </div>
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Avançar automaticamente para próximo capítulo
                  </span>
                </label>
              </div>

              {/* Preload Pages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Pré-carregar Páginas: {preloadPages}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={preloadPages}
                  onChange={(e) => setPreloadPages(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  Mais páginas = Navegação mais fluida, mas usa mais dados
                </p>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
                <h4 className="font-semibold text-sm mb-2">Atalhos de Teclado</h4>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                  <p><kbd className="px-2 py-1 bg-white border rounded dark:bg-gray-800">→</kbd> ou <kbd className="px-2 py-1 bg-white border rounded dark:bg-gray-800">Space</kbd> - Próxima página</p>
                  <p><kbd className="px-2 py-1 bg-white border rounded dark:bg-gray-800">←</kbd> - Página anterior</p>
                  <p><kbd className="px-2 py-1 bg-white border rounded dark:bg-gray-800">F</kbd> - Tela cheia</p>
                  <p><kbd className="px-2 py-1 bg-white border rounded dark:bg-gray-800">Home</kbd> - Primeira página</p>
                  <p><kbd className="px-2 py-1 bg-white border rounded dark:bg-gray-800">End</kbd> - Última página</p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  saveSettings();
                  setShowSettings(false);
                }}
              >
                Salvar Configurações
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reader Content */}
      <div className="h-full flex items-center justify-center overflow-hidden">
        {/* ✅ VERIFIQUE pages EM VEZ DE chapter.pages */}
        {readingMode === 'single' && pages && pages.length > 0 && (
          <div className="relative flex items-center justify-center w-full h-full p-4">
            {currentPageData ? (
              <img
                src={getImageUrl(currentPageData.image_url)}
                alt={`Página ${currentPage + 1}`}
                className={`${fitModes[fitMode]} mx-auto cursor-pointer transition-transform`}
                style={{ transform: `scale(${zoom / 100})` }}
                onClick={nextPage}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x1200?text=Erro+ao+carregar';
                }}
              />
            ) : (
              <div className="text-white text-center">
                <p>Página não encontrada</p>
                <Button onClick={() => setCurrentPage(0)} className="mt-4">
                  Voltar para primeira página
                </Button>
              </div>
            )}
          </div>
        )}

        {readingMode === 'double' && pages && pages.length > 0 && (
          <div className="flex items-center justify-center gap-4 w-full h-full p-4">
            {currentPage > 0 && pages[currentPage - 1] && (
              <img
                src={getImageUrl(pages[currentPage - 1].image_url)}
                alt={`Página ${currentPage}`}
                className={`${fitModes[fitMode]}`}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x1200?text=Erro';
                }}
              />
            )}
            {currentPageData ? (
              <img
                src={getImageUrl(currentPageData.image_url)}
                alt={`Página ${currentPage + 1}`}
                className={`${fitModes[fitMode]}`}
                onClick={nextPage}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x1200?text=Erro';
                }}
              />
            ) : (
              <div className="text-white">
                Página não encontrada
              </div>
            )}
          </div>
        )}

        {readingMode === 'continuous' && pages && pages.length > 0 && (
          <div className="overflow-y-auto h-full w-full max-w-4xl mx-auto py-4">
            {pages.map((page, index) => (
              page ? (
                <img
                  key={page.id}
                  src={getImageUrl(page.image_url)}
                  alt={`Página ${index + 1}`}
                  className="w-full mb-2"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x1200?text=Erro';
                  }}
                />
              ) : null
            ))}
          </div>
        )}

        {/* ✅ MENSAGEM PARA QUANDO NÃO HÁ PÁGINAS */}
        {/* No final do Reader Content, substitua a mensagem atual por: */}
        {pages && pages.length === 0 && (
          <div className="text-white text-center space-y-4">
            <p className="text-xl">Nenhuma página encontrada neste capítulo</p>
            <div className="space-y-2">
              <Button 
                onClick={loadChapter}
                className="bg-blue-600 hover:bg-blue-700 mr-2"
              >
                🔄 Tentar Novamente
              </Button>
              <Button 
                onClick={() => navigate(`/manga/${mangaId}`)}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Voltar para o mangá
              </Button>
            </div>
            <details className="text-sm text-gray-300 max-w-md mx-auto">
              <summary className="cursor-pointer">Detalhes técnicos</summary>
              <pre className="text-left mt-2 bg-black/50 p-2 rounded text-xs overflow-auto">
                {JSON.stringify({ chapter, pages }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {readingMode !== 'continuous' && pages && pages.length > 0 && (
        <>
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`fixed left-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            className={`fixed right-4 top-1/2 -translate-y-1/2 p-4 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Bottom Controls */}
      {readingMode !== 'continuous' && pages && pages.length > 0 && (
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-50 transition-all duration-300 ${
            showControls ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="container-custom">
            {/* Progress Bar */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-white text-sm whitespace-nowrap">
                {currentPage + 1} / {totalPages}
              </span>
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if (!pages || pages.length === 0) return;
                  
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = x / rect.width;
                  const newPage = Math.floor(percentage * totalPages);
                  setCurrentPage(Math.max(0, Math.min(newPage, totalPages - 1)));
                }}
              >
                <div 
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded text-white"
                  title="Diminuir zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-white text-sm px-2 flex items-center">
                  {zoom}%
                </span>
                <button
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded text-white"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded text-white"
                  title="Resetar zoom"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Page Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
              {pages.map((page, index) => (
                page ? (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(index)}
                    className={`flex-shrink-0 w-16 h-24 rounded overflow-hidden border-2 transition ${
                      currentPage === index ? 'border-primary-500 ring-2 ring-primary-500' : 'border-white/20 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={getImageUrl(page.image_url)}
                      alt={`Página ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ) : null
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MangaReader;