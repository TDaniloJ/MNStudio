import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Sparkles, Lightbulb, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../../services/novelService';
import { aiService } from '../../services/aiService';
import WorldbuildingPanel from '../../components/admin/WorldbuildingPanel';
import { formatDate, formatNumber } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import ProviderSelector from '../../components/admin/ProviderSelector';

const NovelChapterManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterLoading, setChapterLoading] = useState(false);

  useEffect(() => {
    loadNovel();
  }, [id]);

  const loadNovel = async () => {
    try {
      setLoading(true);
      const data = await novelService.getById(id);
      setNovel(data.novel);
      setChapters(data.novel.chapters || []);
    } catch (error) {
      toast.error('Erro ao carregar novel');
      navigate('/admin/novels');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = () => {
    setEditingChapter(null);
    setShowModal(true);
  };

  const handleEditChapter = async (chapter) => {
    try {
      setChapterLoading(true);
      const chapterData = await novelService.getChapter(chapter.id);
      setEditingChapter(chapterData.chapter);
      setShowModal(true);
    } catch (error) {
      toast.error('Erro ao carregar capítulo');
    } finally {
      setChapterLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm('Tem certeza que deseja deletar este capítulo?')) return;

    try {
      await novelService.deleteChapter(chapterId);
      toast.success('Capítulo deletado com sucesso');
      loadNovel();
    } catch (error) {
      toast.error('Erro ao deletar capítulo');
    }
  };

  const getContentPreview = (content) => {
    if (!content) return 'Sem conteúdo disponível';
    const safeContent = typeof content === 'string' ? content : String(content);
    const textOnly = safeContent.replace(/<[^>]*>/g, '');
    return textOnly.length > 100 ? textOnly.substring(0, 100) + '...' : textOnly;
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/novels')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Capítulos de {novel?.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {chapters.length} capítulo{chapters.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/novels/${id}/worldbuilding`)}
        >
          <Sparkles className="w-4 h-4 mr-2" />
           Worldbuilding
        </Button>

        <Button onClick={handleCreateChapter}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Capítulo
        </Button>
      </div>

      {chapterLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <Loading />
          </div>
        </div>
      )}

      {chapters.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nenhum capítulo cadastrado
          </p>
          <Button onClick={handleCreateChapter}>
            Criar Primeiro Capítulo
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {chapters
            .sort((a, b) => parseFloat(a.chapter_number) - parseFloat(b.chapter_number))
            .map((chapter) => (
              <Card key={chapter.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        {chapter.chapter_number}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Capítulo {chapter.chapter_number}
                      {chapter.title && ` - ${chapter.title}`}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {getContentPreview(chapter.content)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatNumber(chapter.views || 0)} visualizações • Criado em {formatDate(chapter.created_at)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditChapter(chapter)}
                      className="p-2 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition"
                      title="Editar"
                      disabled={chapterLoading}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
                      title="Deletar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {showModal && (
        <NovelChapterModal
          novelId={id}
          chapter={editingChapter}
          onClose={() => {
            setShowModal(false);
            setEditingChapter(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingChapter(null);
            loadNovel();
          }}
        />
      )}
    </div>
  );
};

const NovelChapterModal = ({ novelId, chapter, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showWorldbuilding, setShowWorldbuilding] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [providerConfig, setProviderConfig] = useState(null);
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [ideasList, setIdeasList] = useState([]);
  const [aiError, setAiError] = useState(null);
  
  const [formData, setFormData] = useState({
    chapter_number: '',
    title: '',
    content: ''
  });
  
  const textareaRef = useRef(null);

  useEffect(() => {
    if (chapter) {
      setFormData({
        chapter_number: chapter.chapter_number || '',
        title: chapter.title || '',
        content: chapter.content || ''
      });
    }
  }, [chapter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (chapter) {
        await novelService.updateChapter(chapter.id, formData);
        toast.success('Capítulo atualizado com sucesso!');
      } else {
        await novelService.createChapter(novelId, formData);
        toast.success('Capítulo criado com sucesso!');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar capítulo');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAction = async (action) => {
    if (!providerConfig?.provider || !providerConfig?.model) {
      toast.error('Selecione um provedor e modelo de IA');
      return;
    }

    setAiError(null);
    setAiLoading(true);

    try {
      let result;

      switch (action) {
        case 'generate':
          if (!formData.chapter_number) {
            toast.error('Informe o número do capítulo primeiro');
            return;
          }
          
          const loadingToast = toast.loading('Gerando capítulo... (pode demorar 30-60s)');
          result = await aiService.generateChapter(
            novelId,
            formData.chapter_number,
            formData.title,
            aiPrompt,
            providerConfig
          );
          toast.dismiss(loadingToast);
          
          if (result.content) {
            setFormData(prev => ({ ...prev, content: result.content }));
            toast.success(`Capítulo gerado com ${result.provider?.provider}!`);
          }
          break;
          
        case 'improve':
          if (!formData.content) {
            toast.error('Escreva algum conteúdo primeiro');
            return;
          }
          result = await aiService.improveContent(novelId, formData.content, aiPrompt, providerConfig);
          if (result.content) {
            setFormData(prev => ({ ...prev, content: result.content }));
            toast.success('Texto melhorado!');
          }
          break;
          
        case 'continue':
          if (!formData.content) {
            toast.error('Escreva algum conteúdo primeiro');
            return;
          }
          result = await aiService.continueText(novelId, formData.content, aiPrompt, providerConfig);
          if (result.content) {
            setFormData(prev => ({ ...prev, content: prev.content + '\n\n' + result.content }));
            toast.success('Texto continuado!');
          }
          break;
          
        case 'ideas':
          result = await aiService.getChapterIdeas(novelId, providerConfig);
          const ideas = Array.isArray(result.ideas) ? result.ideas : [result.ideas];
          setIdeasList(ideas.filter(Boolean));
          setShowIdeasModal(true);
          break;
      }
      
      setAiPrompt('');
    } catch (error) {
      console.error('Erro na ação IA:', error);
      
      const errorMsg = error.response?.data?.error || error.message;
      setAiError(errorMsg);
      
      if (errorMsg.includes('quota') || errorMsg.includes('créditos')) {
        toast.error('Créditos esgotados. Tente outro provedor.');
      } else if (errorMsg.includes('disponível')) {
        toast.error('Nenhum provedor disponível. Configure as API keys.');
      } else {
        toast.error('Erro ao executar ação de IA');
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title={chapter ? 'Editar Capítulo' : 'Novo Capítulo'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Provider Config */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-2 mb-3 m-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Configuração de IA
            </h3>
          </div>
          
          <ProviderSelector
            value={providerConfig}
            onChange={setProviderConfig}
          />

          {aiError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800 dark:text-red-200">
                {aiError}
              </div>
            </div>
          )}
        </Card>

        {/* Chapter Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Número do Capítulo *"
            type="text"
            value={formData.chapter_number}
            onChange={(e) => setFormData(prev => ({ ...prev, chapter_number: e.target.value }))}
            placeholder="Ex: 1, 1.5, 2"
            required
          />
          <Input
            label="Título (opcional)"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: O Início"
          />
        </div>

        {/* AI Tools */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="space-y-3 m-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Ferramentas de IA
                </h3>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleAIAction('ideas')}
                loading={aiLoading}
                disabled={!providerConfig}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Gerar Ideias
              </Button>
            </div>
            
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Instruções para a IA (opcional). Ex: 'Adicione mais ação', 'Foque no desenvolvimento do personagem'"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={2}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => handleAIAction('generate')}
                loading={aiLoading}
                disabled={!providerConfig || !formData.chapter_number}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                🎭 Gerar Capítulo
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleAIAction('improve')}
                loading={aiLoading}
                disabled={!providerConfig || !formData.content}
              >
                ✨ Melhorar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => handleAIAction('continue')}
                loading={aiLoading}
                disabled={!providerConfig || !formData.content}
              >
                ➕ Continuar
              </Button>
            </div>

            <p className="text-xs text-amber-700 dark:text-amber-300">
              💡 Dica: Gerar um capítulo completo pode levar 30-60 segundos
            </p>
          </div>
        </Card>

        {/* Worldbuilding */}
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowWorldbuilding(!showWorldbuilding)}
          >
            📚 {showWorldbuilding ? 'Ocultar' : 'Mostrar'} Worldbuilding
          </Button>

          {showWorldbuilding && (
            <div className="mt-3">
              <WorldbuildingPanel
                novelId={novelId}
                onSelect={(item, type) => {
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
                  toast.success('Inserido no capítulo!');
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Conteúdo *
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formData.content.length} caracteres • ~{Math.round(formData.content.length / 5)} palavras
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={16}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-serif resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Digite o texto do capítulo aqui ou use as ferramentas de IA..."
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {chapter ? 'Atualizar' : 'Criar'} Capítulo
          </Button>
        </div>
      </form>

      {/* Ideas Modal */}
      {showIdeasModal && (
        <Modal 
          isOpen={true} 
          onClose={() => setShowIdeasModal(false)} 
          title="💡 Ideias de Capítulos"
        >
          <div className="space-y-3">
            {ideasList.map((idea, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Ideia {idx + 1}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {typeof idea === 'string' ? idea : JSON.stringify(idea)}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    type="button" 
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(typeof idea === 'string' ? idea : JSON.stringify(idea));
                      toast.success('Copiado!');
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default NovelChapterManager;