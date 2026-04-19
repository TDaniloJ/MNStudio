import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Sparkles, Eye, FileText,
  Wand2, RotateCcw, Copy, Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../../services/novelService';
import { aiService } from '../../services/aiService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import WorldbuildingPanel from '../../components/admin/WorldbuildingPanel';
import ProviderSelector from '../../components/admin/ProviderSelector';

const NovelChapterEditor = () => {
  const { novelId, chapterId } = useParams();
  const navigate  = useNavigate();
  const isEdit    = !!chapterId;
  const textareaRef = useRef(null);

  const [novel,            setNovel]           = useState(null);
  const [loading,          setLoading]         = useState(true);
  const [saving,           setSaving]          = useState(false);
  const [aiLoading,        setAiLoading]       = useState(false);
  const [showPreview,      setShowPreview]     = useState(false);
  const [showAIPanel,      setShowAIPanel]     = useState(false);
  const [showWorldbuilding,setShowWorldbuilding]= useState(false);
  const [providerConfig,   setProviderConfig]  = useState({ provider: 'anthropic' });
  const [aiPrompt,         setAiPrompt]        = useState('');
  const [history,          setHistory]         = useState([]);
  const [historyIndex,     setHistoryIndex]    = useState(-1);

  const [formData, setFormData] = useState({ chapter_number: '', title: '', content: '' });

  // Stats
  const stats = (() => {
    const c = formData.content;
    const words    = c.trim().split(/\s+/).filter((w) => w.length > 0).length;
    const paragraphs = c.split('\n\n').filter((p) => p.trim()).length;
    return { words, characters: c.length, paragraphs, readingTime: Math.ceil(words / 200) };
  })();

  useEffect(() => { loadNovel(); if (isEdit) loadChapter(); }, [novelId, chapterId]);

  const loadNovel = async () => {
    try { const d = await novelService.getById(novelId); setNovel(d.novel); }
    catch { toast.error('Erro ao carregar novel'); navigate('/admin/novels'); }
  };

  const loadChapter = async () => {
    setLoading(true);
    try {
      const d = await novelService.getChapter(chapterId);
      setFormData({ chapter_number: d.chapter.chapter_number, title: d.chapter.title || '', content: d.chapter.content || '' });
      addToHistory(d.chapter.content || '');
    } catch { toast.error('Erro ao carregar capítulo'); navigate(`/admin/novels/${novelId}/chapters`); }
    finally { setLoading(false); }
  };

  const addToHistory = (content) => {
    const newH = history.slice(0, historyIndex + 1);
    newH.push(content);
    setHistory(newH);
    setHistoryIndex(newH.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) { const i = historyIndex - 1; setHistoryIndex(i); setFormData((p) => ({ ...p, content: history[i] })); }
  };
  const redo = () => {
    if (historyIndex < history.length - 1) { const i = historyIndex + 1; setHistoryIndex(i); setFormData((p) => ({ ...p, content: history[i] })); }
  };

  const handleSave = async () => {
    if (!formData.chapter_number?.toString().trim()) { toast.error('Número do capítulo é obrigatório'); return; }
    setSaving(true);
    try {
      if (isEdit) { await novelService.updateChapter(chapterId, formData); toast.success('Capítulo atualizado!'); }
      else        { await novelService.createChapter(novelId, formData);   toast.success('Capítulo criado!');     }
      navigate(`/admin/novels/${novelId}/chapters`);
    } catch { toast.error('Erro ao salvar capítulo'); }
    finally { setSaving(false); }
  };

  const handleAIAction = async (action) => {
    setAiLoading(true);
    try {
      let result;
      if (action === 'generate') {
        result = await aiService.generateChapter(novelId, formData.chapter_number, formData.title, aiPrompt, providerConfig);
        setFormData((p) => ({ ...p, content: result.content })); addToHistory(result.content);
      } else if (action === 'improve') {
        result = await aiService.improveContent(formData.content, aiPrompt, providerConfig);
        setFormData((p) => ({ ...p, content: result.content })); addToHistory(result.content);
      } else if (action === 'continue') {
        result = await aiService.continueText(novelId, formData.content, aiPrompt, providerConfig);
        const newContent = formData.content + '\n\n' + result.content;
        setFormData((p) => ({ ...p, content: newContent })); addToHistory(newContent);
      }
      toast.success('Ação concluída!');
      setShowAIPanel(false); setAiPrompt('');
    } catch { toast.error('Erro ao executar ação de IA'); }
    finally { setAiLoading(false); }
  };

  const handleWorldbuildingSelect = (item, type) => {
    const pos = textareaRef.current?.selectionStart || formData.content.length;
    const ins = { character: `\n\n[${item.name}]\n${item.description}\n`, world: `\n\n[Mundo: ${item.name}]\n${item.description}\n`, magic: `\n\n[Magia: ${item.name}]\n${item.description}\n`, cultivation: `\n\n[Cultivo: ${item.name}]\nNíveis: ${item.levels?.join(', ')}\n` }[type] || '';
    const newContent = formData.content.slice(0, pos) + ins + formData.content.slice(pos);
    setFormData((p) => ({ ...p, content: newContent })); addToHistory(newContent);
    toast.success('Inserido!');
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(formData.content); toast.success('Copiado!'); };
  const downloadAsText  = () => {
    const blob = new Blob([formData.content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `capitulo-${formData.chapter_number}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">

      {/* Header fixo */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => navigate(`/admin/novels/${novelId}/chapters`)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0 group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {isEdit ? 'Editar' : 'Novo'} Capítulo
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{novel?.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <HeaderBtn onClick={() => setShowPreview(!showPreview)} active={showPreview}>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">{showPreview ? 'Editar' : 'Preview'}</span>
              </HeaderBtn>
              <HeaderBtn onClick={() => setShowAIPanel(!showAIPanel)} active={showAIPanel}>
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">IA</span>
              </HeaderBtn>
              <HeaderBtn onClick={() => setShowWorldbuilding(!showWorldbuilding)} active={showWorldbuilding}>
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Worldbuilding</span>
              </HeaderBtn>
              <Button onClick={handleSave} loading={saving} size="sm">
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Editor principal ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Número + título */}
            <Card className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Número do Capítulo *" type="number" step="0.1"
                  value={formData.chapter_number}
                  onChange={(e) => setFormData((p) => ({ ...p, chapter_number: e.target.value }))}
                  placeholder="Ex: 1, 1.5" required />
                <Input label="Título (opcional)"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: O Início" />
              </div>
            </Card>

            {/* Stats bar */}
            <Card className="px-4 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex gap-5 text-sm">
                  {[
                    { label: 'palavras',   value: stats.words.toLocaleString()      },
                    { label: 'chars',      value: stats.characters.toLocaleString() },
                    { label: 'parágrafos', value: stats.paragraphs                  },
                    { label: 'min leitura',value: stats.readingTime                 },
                  ].map(({ label, value }) => (
                    <span key={label} className="text-gray-500 dark:text-gray-400">
                      <strong className="text-gray-900 dark:text-white tabular-nums">{value}</strong> {label}
                    </span>
                  ))}
                </div>
                <div className="flex gap-1">
                  {[
                    { fn: undo,             title: 'Desfazer',  disabled: historyIndex <= 0,                       icon: <RotateCcw className="w-3.5 h-3.5" /> },
                    { fn: redo,             title: 'Refazer',   disabled: historyIndex >= history.length - 1,      icon: <RotateCcw className="w-3.5 h-3.5 scale-x-[-1]" /> },
                    { fn: copyToClipboard,  title: 'Copiar',    disabled: false,                                   icon: <Copy className="w-3.5 h-3.5" /> },
                    { fn: downloadAsText,   title: 'Download',  disabled: false,                                   icon: <Download className="w-3.5 h-3.5" /> },
                  ].map(({ fn, title, disabled, icon }) => (
                    <button key={title} onClick={fn} disabled={disabled} title={title}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors">
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Editor / Preview */}
            <Card className="p-6 min-h-[560px] flex flex-col">
              {showPreview ? (
                <div className="prose prose-lg dark:prose-invert max-w-none flex-1">
                  <h2>Capítulo {formData.chapter_number}{formData.title && ` — ${formData.title}`}</h2>
                  <div className="whitespace-pre-wrap font-serif leading-relaxed text-gray-800 dark:text-gray-200">
                    {formData.content}
                  </div>
                </div>
              ) : (
                <textarea ref={textareaRef} value={formData.content}
                  onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                  onBlur={() => { if (formData.content !== history[historyIndex]) addToHistory(formData.content); }}
                  className="flex-1 w-full px-0 py-0 border-0 focus:outline-none focus:ring-0 font-serif text-lg leading-relaxed resize-none bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                  placeholder="Comece a escrever seu capítulo aqui ou use as ferramentas de IA…" />
              )}
            </Card>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Painel IA */}
            {showAIPanel && (
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Assistente IA</h3>
                </div>
                <ProviderSelector value={providerConfig} onChange={setProviderConfig} />
                <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={3}
                  placeholder="Instruções para a IA…"
                  className="w-full mt-3 px-3 py-2 text-sm border border-purple-200 dark:border-purple-800 rounded-xl bg-white/60 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-gray-900 dark:text-white placeholder-purple-300 resize-none" />
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { action: 'generate', label: '🎭 Gerar',   disabled: !formData.chapter_number },
                    { action: 'improve',  label: '✨ Melhorar', disabled: !formData.content },
                    { action: 'continue', label: '➕ Continuar', disabled: !formData.content },
                    { action: 'ideas',    label: '💡 Ideias',   disabled: false },
                  ].map(({ action, label, disabled }) => (
                    <button key={action} type="button"
                      onClick={() => handleAIAction(action)} disabled={aiLoading || disabled}
                      className="py-2 px-3 text-xs font-semibold rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-40 transition-all">
                      {label}
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* Worldbuilding */}
            {showWorldbuilding && (
              <WorldbuildingPanel novelId={novelId} onSelect={handleWorldbuildingSelect} />
            )}

            {/* Dicas */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">💡 Dicas</h3>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Use Ctrl+Z / Cmd+Z para desfazer</li>
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

const HeaderBtn = ({ onClick, active, children }) => (
  <button onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}>
    {children}
  </button>
);

export default NovelChapterEditor;