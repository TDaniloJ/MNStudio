import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, Trash2, Edit, ArrowUp, ArrowDown, GripVertical, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../../services/mangaService';
import { getImageUrl, formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

/* ── Componente principal ─────────────────────────────────────────── */

const MangaChapterManager = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();

  const [manga,              setManga]              = useState(null);
  const [chapters,           setChapters]           = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [chaptersWithPages,  setChaptersWithPages]  = useState({});
  const [showModal,          setShowModal]          = useState(false);
  const [editingChapter,     setEditingChapter]     = useState(null);
  const [showUploadModal,    setShowUploadModal]    = useState(false);
  const [uploadingChapter,   setUploadingChapter]   = useState(null);

  useEffect(() => { loadManga(); }, [id]);

  const loadManga = async () => {
    setLoading(true);
    try {
      const data      = await mangaService.getById(id);
      const chaps     = data.manga.chapters || [];
      setManga(data.manga);
      setChapters(chaps);
      loadChaptersPagesCount(chaps);
    } catch { toast.error('Erro ao carregar mangá'); navigate('/admin/mangas'); }
    finally { setLoading(false); }
  };

  const loadChaptersPagesCount = async (list) => {
    const counts = {};
    for (const ch of list) {
      try {
        const d     = await mangaService.getChapterPages(ch.id);
        const pages = d.pages || d.chapter?.pages || d || [];
        counts[ch.id] = Array.isArray(pages) ? pages.length : 0;
      } catch { counts[ch.id] = 0; }
    }
    setChaptersWithPages(counts);
  };

  const getPagesCount    = (chId)    => chaptersWithPages[chId] ?? 0;
  const handleCreate     = ()        => { setEditingChapter(null);    setShowModal(true);    };
  const handleEdit       = (ch)      => { setEditingChapter(ch);      setShowModal(true);    };
  const handleUpload     = (ch)      => { setUploadingChapter(ch);    setShowUploadModal(true); };

  const handleDelete = async (chId) => {
    if (!confirm('Deletar este capítulo?')) return;
    try { await mangaService.deleteChapter(chId); toast.success('Capítulo deletado'); loadManga(); }
    catch { toast.error('Erro ao deletar capítulo'); }
  };

  if (loading) return <Loading fullScreen />;

  const sorted = [...chapters].sort((a, b) =>
    parseFloat(a.chapter_number) - parseFloat(b.chapter_number) || a.id - b.id
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/mangas')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Voltar
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{manga?.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {chapters.length} capítulo{chapters.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Novo Capítulo
        </Button>
      </div>

      {/* Lista */}
      {sorted.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhum capítulo cadastrado</p>
          <Button size="sm" onClick={handleCreate}>Criar Primeiro Capítulo</Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((chapter) => (
            <Card key={chapter.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-14 h-20 rounded-xl overflow-hidden bg-primary-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  {getPagesCount(chapter.id) > 0 && chapter.pages?.[0] ? (
                    <img src={getImageUrl(chapter.pages[0].image_url)} alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <span className="text-xl font-black text-primary-400 dark:text-primary-600">
                      {parseFloat(chapter.chapter_number)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Capítulo {parseFloat(chapter.chapter_number)}
                    {chapter.title && <span className="font-normal text-gray-500 dark:text-gray-400"> — {chapter.title}</span>}
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {getPagesCount(chapter.id)} página{getPagesCount(chapter.id) !== 1 ? 's' : ''} · {chapter.views || 0} views · {formatDate(chapter.created_at)}
                  </p>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="secondary" size="sm" onClick={() => handleUpload(chapter)}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Páginas ({getPagesCount(chapter.id)})
                  </Button>
                  <button onClick={() => handleEdit(chapter)}
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

      {/* Modais (lógica 100% preservada) */}
      {showModal && (
        <ChapterModal mangaId={id} chapter={editingChapter}
          onClose={() => { setShowModal(false); setEditingChapter(null); }}
          onSuccess={() => { setShowModal(false); setEditingChapter(null); loadManga(); }} />
      )}
      {showUploadModal && (
        <UploadPagesModal chapter={uploadingChapter}
          onClose={() => { setShowUploadModal(false); setUploadingChapter(null); }}
          onSuccess={() => loadManga()} />
      )}
    </div>
  );
};

/* ── ChapterModal ─────────────────────────────────────────────────── */

const ChapterModal = ({ mangaId, chapter, onClose, onSuccess }) => {
  const [loading,  setLoading]  = useState(false);
  const [formData, setFormData] = useState({
    chapter_number: chapter?.chapter_number || '',
    title:          chapter?.title          || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.chapter_number) { toast.error('Número do capítulo é obrigatório'); return; }
    setLoading(true);
    try {
      if (chapter) { await mangaService.updateChapter(chapter.id, formData); toast.success('Capítulo atualizado!'); }
      else         { await mangaService.createChapter(mangaId, formData);    toast.success('Capítulo criado!');     }
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao salvar capítulo'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title={chapter ? 'Editar Capítulo' : 'Novo Capítulo'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Número *" type="number" step="0.1"
            value={formData.chapter_number}
            onChange={(e) => setFormData({ ...formData, chapter_number: e.target.value })}
            placeholder="Ex: 1, 1.5" required />
          <Input label="Título (opcional)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: O Início" />
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-200">
          💡 Após criar o capítulo, faça upload das páginas clicando em "Páginas".
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{chapter ? 'Atualizar' : 'Criar'} Capítulo</Button>
        </div>
      </form>
    </Modal>
  );
};

/* ── UploadPagesModal — lógica 100% preservada do original ───────── */

const UploadPagesModal = ({ chapter, onClose, onSuccess }) => {
  const [loading,       setLoading]       = useState(false);
  const [files,         setFiles]         = useState([]);
  const [previews,      setPreviews]      = useState([]);
  const [existingPages, setExistingPages] = useState([]);
  const [loadingPages,  setLoadingPages]  = useState(true);
  const [draggedIndex,  setDraggedIndex]  = useState(null);
  const [reordering,    setReordering]    = useState(false);

  useEffect(() => { if (chapter?.id) loadExistingPages(); }, [chapter?.id]);

  const loadExistingPages = async () => {
    setLoadingPages(true);
    try {
      const data  = await mangaService.getChapterPages(chapter.id);
      const pages = data.pages || data.chapter?.pages || (Array.isArray(data) ? data : []);
      setExistingPages(pages.sort((a, b) => a.page_number - b.page_number));
    } catch { setExistingPages([]); }
    finally { setLoadingPages(false); }
  };

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files).filter((f) => {
      if (!f.type.startsWith('image/')) { toast.error(`"${f.name}" não é uma imagem`); return false; }
      return true;
    });
    if (!selected.length) return;
    setFiles(selected);
    setPreviews(selected.map((f, i) => ({
      url:   URL.createObjectURL(f), name: f.name, file: f,
      order: existingPages.length + i + 1,
      id:    `new-${Date.now()}-${i}`,
    })));
    e.target.value = '';
  };

  const handleDragStart = (e, i) => { setDraggedIndex(i); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (e, i) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === i) return;
    const arr  = [...previews];
    const item = arr.splice(draggedIndex, 1)[0];
    arr.splice(i, 0, item);
    arr.forEach((p, idx) => { p.order = existingPages.length + idx + 1; });
    setPreviews(arr);
    setDraggedIndex(i);
  };
  const handleDragEnd   = () => setDraggedIndex(null);

  const movePreview = (i, dir) => {
    const ni = dir === 'up' ? i - 1 : i + 1;
    if (ni < 0 || ni >= previews.length) return;
    const arr = [...previews];
    [arr[i], arr[ni]] = [arr[ni], arr[i]];
    arr.forEach((p, idx) => { p.order = existingPages.length + idx + 1; });
    setPreviews(arr);
  };

  const moveExistingPage = (i, dir) => {
    const ni = dir === 'up' ? i - 1 : i + 1;
    if (ni < 0 || ni >= existingPages.length) return;
    const arr = [...existingPages];
    [arr[i], arr[ni]] = [arr[ni], arr[i]];
    setExistingPages(arr);
  };

  const handleReorderExisting = async () => {
    setReordering(true);
    try {
      await mangaService.reorderPages(chapter.id, existingPages.map((p, i) => ({ id: p.id, page_number: i + 1 })));
      toast.success('Páginas reordenadas!');
      await loadExistingPages();
      onSuccess();
    } catch { toast.error('Erro ao reordenar'); }
    finally { setReordering(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) { toast.error('Selecione imagens'); return; }
    setLoading(true);
    try {
      await mangaService.uploadPages(chapter.id, previews.map((p) => p.file));
      toast.success(`${files.length} página${files.length !== 1 ? 's' : ''} enviada${files.length !== 1 ? 's' : ''}!`);
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setFiles([]); setPreviews([]);
      await loadExistingPages();
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao fazer upload'); }
    finally { setLoading(false); }
  };

  const handleDeletePage = async (pageId) => {
    if (!confirm('Deletar esta página?')) return;
    try { await mangaService.deletePage(pageId); toast.success('Página deletada'); await loadExistingPages(); onSuccess(); }
    catch { toast.error('Erro ao deletar página'); }
  };

  useEffect(() => () => previews.forEach((p) => { if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url); }), [previews]);

  return (
    <Modal isOpen onClose={onClose} title={`Cap. ${parseFloat(chapter.chapter_number)} — Páginas`} size="xl">
      <div className="space-y-6">

        {/* Páginas existentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              Páginas Atuais ({existingPages.length})
            </h3>
            {existingPages.length > 1 && (
              <Button size="sm" variant="secondary" onClick={handleReorderExisting} loading={reordering}>
                Salvar Nova Ordem
              </Button>
            )}
          </div>
          {!loadingPages && existingPages.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              <p className="text-sm text-gray-400">Nenhuma página cadastrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-80 overflow-y-auto p-2 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              {existingPages.map((page, index) => (
                <div key={page.id} className="relative group">
                  <img src={getImageUrl(page.image_url)} alt={`Pg ${page.page_number}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {page.page_number}
                  </div>
                  <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => moveExistingPage(index, 'up')} disabled={index === 0}
                      className="p-0.5 bg-blue-500 text-white rounded disabled:opacity-30" type="button">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => moveExistingPage(index, 'down')} disabled={index === existingPages.length - 1}
                      className="p-0.5 bg-blue-500 text-white rounded disabled:opacity-30" type="button">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleDeletePage(page.id)}
                      className="p-0.5 bg-red-500 text-white rounded" type="button">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload novas páginas */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
              Adicionar Páginas
            </label>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple
              onChange={handleFilesChange} disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-300 transition-all" />
            <p className="mt-1 text-xs text-gray-400">Arraste as imagens para reordenar antes de enviar</p>
          </div>

          {previews.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                Preview — {previews.length} imagem{previews.length !== 1 ? 'ns' : ''}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-80 overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-xl p-2 bg-white dark:bg-gray-900">
                {previews.map((preview, index) => (
                  <div key={preview.id} draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative cursor-move ${draggedIndex === index ? 'opacity-40' : ''}`}>
                    <div className="absolute top-1 left-1 z-10 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                      {preview.order}
                    </div>
                    <img src={preview.url} alt="" className="w-full h-24 object-cover rounded-lg border-2 border-primary-400" />
                    <div className="flex gap-0.5 mt-1">
                      <button type="button" onClick={() => movePreview(index, 'up')} disabled={index === 0}
                        className="flex-1 py-0.5 bg-blue-500 text-white rounded text-xs disabled:opacity-30">↑</button>
                      <button type="button" onClick={() => movePreview(index, 'down')} disabled={index === previews.length - 1}
                        className="flex-1 py-0.5 bg-blue-500 text-white rounded text-xs disabled:opacity-30">↓</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Fechar</Button>
            <Button type="submit" loading={loading} disabled={!files.length}>
              Enviar {files.length} Página{files.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MangaChapterManager;