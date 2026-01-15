import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Eye, 
  FileText,
  Wand2,
  RotateCcw,
  Copy,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../../services/novelService';
import { aiService } from '../../services/aiService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import WorldbuildingPanel from '../../components/admin/WorldbuildingPanel';
import ProviderSelector from '../../components/admin/ProviderSelector';

const NovelChapterEditor = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!chapterId;
  const textareaRef = useRef(null);

  const [novel, setNovel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showWorldbuilding, setShowWorldbuilding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [providerConfig, setProviderConfig] = useState({ provider: 'anthropic' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [formData, setFormData] = useState({
    chapter_number: '',
    title: '',
    content: ''
  });

  // Stats
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    paragraphs: 0,
    readingTime: 0
  });

  useEffect(() => {
    loadNovel();
    if (isEdit) {
      loadChapter();
    }
  }, [novelId, chapterId]);

  useEffect(() => {
    updateStats();
  }, [formData.content]);

  const loadNovel = async () => {
    try {
      const data = await novelService.getById(novelId);
      setNovel(data.novel);
    } catch (error) {
      toast.error('Erro ao carregar novel');
      navigate('/admin/novels');
    }
  };

  const loadChapter = async () => {
    try {
      setLoading(true);
      const data = await novelService.getChapter(chapterId);
      setFormData({
        chapter_number: data.chapter.chapter_number,
        title: data.chapter.title || '',
        content: data.chapter.content || ''
      });
      addToHistory(data.chapter.content || '');
    } catch (error) {
      toast.error('Erro ao carregar capítulo');
      navigate(`/admin/novels/${novelId}/chapters`);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    const content = formData.content;
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const characters = content.length;
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200); // 200 palavras por minuto

    setStats({ words, characters, paragraphs, readingTime });
  };

  const addToHistory = (content) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(content);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setFormData({ ...formData, content: history[newIndex] });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setFormData({ ...formData, content: history[newIndex] });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (isEdit) {
        await novelService.updateChapter(chapterId, formData);
        toast.success('Capítulo atualizado!');
      } else {
        await novelService.createChapter(novelId, formData);
        toast.success('Capítulo criado!');
      }

      navigate(`/admin/novels/${novelId}/chapters`);
    } catch (error) {
      toast.error('Erro ao salvar capítulo');
    } finally {
      setSaving(false);
    }
  };

  const handleAIAction = async (action) => {
    try {
      setAiLoading(true);
      let result;

      switch (action) {
        case 'generate':
          result = await aiService.generateChapter(
            novelId,
            formData.chapter_number,
            formData.title,
            aiPrompt,
            providerConfig
          );
          setFormData({ ...formData, content: result.content });
          addToHistory(result.content);
          break;

        case 'improve':
          result = await aiService.improveContent(
            formData.content,
            aiPrompt,
            providerConfig
          );
          setFormData({ ...formData, content: result.content });
          addToHistory(result.content);
          break;

        case 'continue':
          result = await aiService.continueText(
            novelId,
            formData.content,
            aiPrompt,
            providerConfig
          );
          const newContent = formData.content + '\n\n' + result.content;
          setFormData({ ...formData, content: newContent });
          addToHistory(newContent);
          break;

        case 'ideas':
          result = await aiService.getChapterIdeas(novelId, providerConfig);
          setShowSettings(true);
          alert('💡 Ideias:\n\n' + result.ideas);
          break;

        case 'summarize':
          result = await aiService.summarizeSettings(novelId, providerConfig);
          setShowSettings(true);
          break;
      }

      toast.success(`Ação executada com ${result.provider.name}!`);
      setShowAIPanel(false);
      setAiPrompt('');
    } catch (error) {
      toast.error('Erro ao executar ação');
    } finally {
      setAiLoading(false);
    }
  };

  const handleWorldbuildingSelect = (item, type) => {
    const cursorPos = textareaRef.current?.selectionStart || formData.content.length;
    let insertion = '';

    switch (type) {
      case 'character':
        insertion = `\n\n[${item.name}]\n${item.description}\n`;
        break;
      case 'world':
        insertion = `\n\n[Mundo: ${item.name}]\n${item.description}\n`;
        break;
      case 'magic':
        insertion = `\n\n[Sistema de Magia: ${item.name}]\n${item.description}\n`;
        break;
      case 'cultivation':
        insertion = `\n\n[Cultivo: ${item.name}]\nNíveis: ${item.levels?.join(', ')}\n`;
        break;
    }

    const newContent = 
      formData.content.slice(0, cursorPos) + 
      insertion + 
      formData.content.slice(cursorPos);

    setFormData({ ...formData, content: newContent });
    addToHistory(newContent);
    toast.success('Inserido no capítulo!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formData.content);
    toast.success('Conteúdo copiado!');
  };

  const downloadAsText = () => {
    const blob = new Blob([formData.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capitulo-${formData.chapter_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/admin/novels/${novelId}/chapters`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {isEdit ? 'Editar' : 'Novo'} Capítulo
                </h1>
                <p className="text-sm text-gray-600">{novel?.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Editar' : 'Preview'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAIPanel(!showAIPanel)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                IA
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowWorldbuilding(!showWorldbuilding)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Worldbuilding
              </Button>

              <Button
                onClick={handleSave}
                loading={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4">
            {/* Chapter Info */}
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4 dark:text-white">
                <Input
                  label="Número do Capítulo *"
                  type="number"
                  step="0.1"
                  value={formData.chapter_number}
                  onChange={(e) => setFormData({ ...formData, chapter_number: e.target.value })}
                  placeholder="Ex: 1, 1.5, 2"
                  required
                />
                <Input
                  label="Título (opcional)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: O Início"
                />
              </div>
            </Card>

            {/* Stats Bar */}
            <Card className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-6">
                  <span className="text-gray-600">
                    <strong className="text-gray-900">{stats.words.toLocaleString()}</strong> palavras
                  </span>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">{stats.characters.toLocaleString()}</strong> caracteres
                  </span>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">{stats.paragraphs}</strong> parágrafos
                  </span>
                  <span className="text-gray-600">
                    <strong className="text-gray-900">{stats.readingTime}</strong> min leitura
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="p-1 text-gray-600 hover:text-primary-600 disabled:opacity-30"
                    title="Desfazer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    className="p-1 text-gray-600 hover:text-primary-600 disabled:opacity-30"
                    title="Refazer"
                  >
                    <RotateCcw className="w-4 h-4 transform scale-x-[-1]" />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="p-1 text-gray-600 hover:text-primary-600"
                    title="Copiar"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={downloadAsText}
                    className="p-1 text-gray-600 hover:text-primary-600"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Editor / Preview */}
            <Card className="p-6">
              {showPreview ? (
                <div className="prose prose-lg max-w-none">
                  <h2>Capítulo {formData.chapter_number}{formData.title && ` - ${formData.title}`}</h2>
                  <div className="whitespace-pre-wrap font-serif leading-relaxed">
                    {formData.content}
                  </div>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e.target.value });
                  }}
                  onBlur={() => {
                    if (formData.content !== history[historyIndex]) {
                      addToHistory(formData.content);
                    }
                  }}
                  rows={25}
                  className="w-full px-0 py-0 border-0 focus:outline-none focus:ring-0 font-serif text-lg leading-relaxed resize-none"
                  placeholder="Comece a escrever seu capítulo aqui ou use as ferramentas de IA..."
                />
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* AI Panel */}
            {showAIPanel && (
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Assistente de IA
                </h3>

                <ProviderSelector
                  value={providerConfig}
                  onChange={setProviderConfig}
                  className="mb-3"
                />

                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Instruções para a IA..."
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
                  rows={3}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAIAction('generate')}
                    loading={aiLoading}
                    disabled={!formData.chapter_number}
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Gerar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAIAction('improve')}
                    loading={aiLoading}
                    disabled={!formData.content}
                  >
                    ✨ Melhorar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAIAction('continue')}
                    loading={aiLoading}
                    disabled={!formData.content}
                  >
                    ➕ Continuar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAIAction('ideas')}
                    loading={aiLoading}
                  >
                    💡 Ideias
                  </Button>
                </div>
              </Card>
            )}

            {/* Worldbuilding Panel */}
            {showWorldbuilding && (
              <WorldbuildingPanel
                novelId={novelId}
                onSelect={handleWorldbuildingSelect}
              />
            )}

            {/* Quick Tips */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas Rápidas</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use Ctrl+Z para desfazer</li>
                <li>• A IA pode continuar de onde você parou</li>
                <li>• Salve frequentemente</li>
                <li>• Use worldbuilding para consistência</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelChapterEditor;