// ═══════════════════════════════════════════════════════════════════
// NovelChapterManager — lista e gerencia capítulos de uma novel
// ═══════════════════════════════════════════════════════════════════
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit, Trash2, Sparkles, Lightbulb,
  AlertCircle, FileText, Save, Eye, Copy, Download,
  RotateCcw, Wand2, Type,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../../services/novelService';
import { aiService } from '../../services/aiService';
import WorldbuildingPanel from '../../components/admin/WorldbuildingPanel';
import ProviderSelector from '../../components/admin/ProviderSelector';
import { formatDate, formatNumber } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

/* ── NovelChapterManager ─────────────────────────────────────────── */

export const NovelChapterManager = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [novel,           setNovel]           = useState(null);
  const [chapters,        setChapters]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showModal,       setShowModal]       = useState(false);
  const [editingChapter,  setEditingChapter]  = useState(null);
  const [chapterLoading,  setChapterLoading]  = useState(false);

  useEffect(() => { loadNovel(); }, [id]);

  const loadNovel = async () => {
    setLoading(true);
    try {
      const data = await novelService.getById(id);
      setNovel(data.novel);
      setChapters(data.novel.chapters || []);
    } catch { toast.error('Erro ao carregar novel'); navigate('/admin/novels'); }
    finally { setLoading(false); }
  };

  const handleCreate = ()      => { setEditingChapter(null); setShowModal(true); };

  const handleEdit = async (ch) => {
    setChapterLoading(true);
    try { const d = await novelService.getChapter(ch.id); setEditingChapter(d.chapter); setShowModal(true); }
    catch { toast.error('Erro ao carregar capítulo'); }
    finally { setChapterLoading(false); }
  };

  const handleDelete = async (chId) => {
    if (!confirm('Deletar este capítulo?')) return;
    try { await novelService.deleteChapter(chId); toast.success('Capítulo deletado'); loadNovel(); }
    catch { toast.error('Erro ao deletar capítulo'); }
  };

  const getContentPreview = (content) => {
    if (!content) return 'Sem conteúdo disponível';
    const text = String(content).replace(/<[^>]*>/g, '');
    return text.length > 120 ? text.slice(0, 120) + '…' : text;
  };

  if (loading) return <Loading />;

  const sorted = [...chapters].sort((a, b) => parseFloat(a.chapter_number) - parseFloat(b.chapter_number));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button onClick={() => navigate('/admin/novels')}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group flex-shrink-0">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight truncate">{novel?.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {chapters.length} capítulo{chapters.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => navigate(`/admin/novels/${id}/worldbuilding`)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-all">
            <Sparkles className="w-4 h-4" />
            Worldbuilding
          </button>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Novo Capítulo
          </Button>
        </div>
      </div>

      {/* Loading overlay */}
      {chapterLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl"><Loading /></div>
        </div>
      )}

      {/* Lista */}
      {sorted.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum capítulo cadastrado</p>
          <Button size="sm" onClick={handleCreate}>Criar Primeiro Capítulo</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((chapter) => (
            <Card key={chapter.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-black text-primary-500 dark:text-primary-400">
                    {chapter.chapter_number}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Capítulo {chapter.chapter_number}
                    {chapter.title && <span className="font-normal text-gray-500 dark:text-gray-400"> — {chapter.title}</span>}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                    {getContentPreview(chapter.content)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {formatNumber(chapter.views || 0)} views · {formatDate(chapter.created_at)}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => handleEdit(chapter)} disabled={chapterLoading}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(chapter.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <NovelChapterModal novelId={id} chapter={editingChapter}
          onClose={() => { setShowModal(false); setEditingChapter(null); }}
          onSuccess={() => { setShowModal(false); setEditingChapter(null); loadNovel(); }} />
      )}
    </div>
  );
};

/* ── NovelChapterModal ───────────────────────────────────────────── */

const NovelChapterModal = ({ novelId, chapter, onClose, onSuccess }) => {
  const [loading,          setLoading]         = useState(false);
  const [aiLoading,        setAiLoading]       = useState(false);
  const [showWorldbuilding,setShowWB]          = useState(false);
  const [aiPrompt,         setAiPrompt]        = useState('');
  const [providerConfig,   setProviderConfig]  = useState(null);
  const [showIdeasModal,   setShowIdeasModal]  = useState(false);
  const [ideasList,        setIdeasList]       = useState([]);
  const [aiError,          setAiError]         = useState(null);
  const [formData,         setFormData]        = useState({ chapter_number: '', title: '', content: '' });
  const textareaRef = useRef(null);

  useEffect(() => {
    if (chapter) setFormData({ chapter_number: chapter.chapter_number || '', title: chapter.title || '', content: chapter.content || '' });
  }, [chapter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (chapter) { await novelService.updateChapter(chapter.id, formData); toast.success('Capítulo atualizado!'); }
      else         { await novelService.createChapter(novelId, formData);    toast.success('Capítulo criado!');     }
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar capítulo'); }
    finally { setLoading(false); }
  };

  const handleAIAction = async (action) => {
    if (!providerConfig?.provider || !providerConfig?.model) { toast.error('Selecione um provedor de IA'); return; }
    setAiError(null); setAiLoading(true);
    try {
      let result;
      if (action === 'generate') {
        if (!formData.chapter_number) { toast.error('Informe o número do capítulo'); return; }
        const t = toast.loading('Gerando… (pode levar até 60s)');
        result = await aiService.generateChapter(novelId, formData.chapter_number, formData.title, aiPrompt, providerConfig);
        toast.dismiss(t);
        if (result.content) { setFormData((p) => ({ ...p, content: result.content })); toast.success('Capítulo gerado!'); }
      } else if (action === 'improve') {
        if (!formData.content) { toast.error('Escreva conteúdo primeiro'); return; }
        result = await aiService.improveContent(novelId, formData.content, aiPrompt, providerConfig);
        if (result.content) { setFormData((p) => ({ ...p, content: result.content })); toast.success('Texto melhorado!'); }
      } else if (action === 'continue') {
        if (!formData.content) { toast.error('Escreva conteúdo primeiro'); return; }
        result = await aiService.continueText(novelId, formData.content, aiPrompt, providerConfig);
        if (result.content) { setFormData((p) => ({ ...p, content: p.content + '\n\n' + result.content })); toast.success('Texto continuado!'); }
      } else if (action === 'ideas') {
        result = await aiService.getChapterIdeas(novelId, providerConfig);
        const ideas = Array.isArray(result.ideas) ? result.ideas : [result.ideas];
        setIdeasList(ideas.filter(Boolean)); setShowIdeasModal(true);
      }
      setAiPrompt('');
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setAiError(msg);
      toast.error(msg.includes('quota') ? 'Créditos esgotados.' : 'Erro na ação de IA');
    } finally { setAiLoading(false); }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Modal isOpen onClose={onClose} title={chapter ? 'Editar Capítulo' : 'Novo Capítulo'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* IA Config */}
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Configuração de IA</h3>
          </div>
          <ProviderSelector value={providerConfig} onChange={setProviderConfig} />
          {aiError && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {aiError}
            </div>
          )}
        </Card>

        {/* Info do capítulo */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Número *" type="text" value={formData.chapter_number}
            onChange={(e) => setFormData((p) => ({ ...p, chapter_number: e.target.value }))}
            placeholder="Ex: 1, 1.5" required />
          <Input label="Título (opcional)" value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            placeholder="Ex: O Início" />
        </div>

        {/* Ferramentas de IA */}
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Ferramentas de IA</h3>
            </div>
            <button type="button" onClick={() => handleAIAction('ideas')}
              disabled={aiLoading || !providerConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-amber-300 dark:border-amber-700 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 disabled:opacity-40 transition-all">
              <Lightbulb className="w-3.5 h-3.5" />
              Gerar Ideias
            </button>
          </div>
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={2}
            placeholder="Instruções para a IA (opcional)…"
            className="w-full px-3 py-2 mb-3 text-sm border border-amber-200 dark:border-amber-800 rounded-xl bg-white/70 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-gray-900 dark:text-white placeholder-amber-400 resize-none" />
          <div className="grid grid-cols-3 gap-2">
            {[
              { action: 'generate', label: '🎭 Gerar', disabled: !providerConfig || !formData.chapter_number },
              { action: 'improve',  label: '✨ Melhorar', disabled: !providerConfig || !formData.content },
              { action: 'continue', label: '➕ Continuar', disabled: !providerConfig || !formData.content },
            ].map(({ action, label, disabled }) => (
              <button key={action} type="button" onClick={() => handleAIAction(action)}
                disabled={aiLoading || disabled}
                className="py-2 px-3 text-xs font-semibold rounded-xl border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 disabled:opacity-40 transition-all">
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">💡 Gerar um capítulo pode levar 30–60 segundos</p>
        </Card>

        {/* Worldbuilding */}
        <div>
          <button type="button" onClick={() => setShowWB(!showWorldbuilding)}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            📚 {showWorldbuilding ? 'Ocultar' : 'Mostrar'} Worldbuilding
          </button>
          {showWorldbuilding && (
            <div className="mt-3">
              <WorldbuildingPanel novelId={novelId} onSelect={(item, type) => {
                const pos = textareaRef.current?.selectionStart || formData.content.length;
                const ins = { character: `\n\n[${item.name}]\n${item.description}\n`, world: `\n\n[Mundo: ${item.name}]\n${item.description}\n`, magic: `\n\n[Magia: ${item.name}]\n${item.description}\n`, cultivation: `\n\n[Cultivo: ${item.name}]\nNíveis: ${item.levels?.join(', ')}\n` }[type] || '';
                setFormData((p) => ({ ...p, content: p.content.slice(0, pos) + ins + p.content.slice(pos) }));
                toast.success('Inserido!');
              }} />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">Conteúdo *</label>
            <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
              {wordCount.toLocaleString()} palavras · {formData.content.length.toLocaleString()} chars
            </span>
          </div>
          <textarea ref={textareaRef} value={formData.content}
            onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
            rows={16} required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 font-serif bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
            placeholder="Escreva o texto do capítulo ou use as ferramentas de IA…" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{chapter ? 'Atualizar' : 'Criar'} Capítulo</Button>
        </div>
      </form>

      {/* Ideas Modal */}
      {showIdeasModal && (
        <Modal isOpen onClose={() => setShowIdeasModal(false)} title="💡 Ideias de Capítulos">
          <div className="space-y-3">
            {ideasList.map((idea, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-1">Ideia {idx + 1}</p>
                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {typeof idea === 'string' ? idea : JSON.stringify(idea)}
                    </p>
                  </div>
                  <Button size="sm" type="button" variant="secondary"
                    onClick={() => { navigator.clipboard.writeText(typeof idea === 'string' ? idea : JSON.stringify(idea)); toast.success('Copiado!'); }}>
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