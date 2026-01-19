import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, Trash2, Edit, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../../services/mangaService';
import { formatDate } from '../../utils/formatters';
import { getImageUrl } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const MangaChapterManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingChapter, setUploadingChapter] = useState(null);
  const [chaptersWithPages, setChaptersWithPages] = useState({});

  useEffect(() => {
    loadManga();
  }, [id]);

  const loadManga = async () => {
    try {
      setLoading(true);
      const data = await mangaService.getById(id);
      setManga(data.manga);
      
      const chaptersData = data.manga.chapters || [];
      setChapters(chaptersData);
      
      await loadChaptersPagesCount(chaptersData);
    } catch (error) {
      toast.error('Erro ao carregar mangá');
      navigate('/admin/mangas');
    } finally {
      setLoading(false);
    }
  };

  const loadChaptersPagesCount = async (chaptersList) => {
    const pagesCount = {};
    
    for (const chapter of chaptersList) {
      try {
        const pagesData = await mangaService.getChapterPages(chapter.id);
        const pages = pagesData.pages || pagesData.chapter?.pages || pagesData || [];
        pagesCount[chapter.id] = Array.isArray(pages) ? pages.length : 0;
      } catch (error) {
        console.error(`Erro ao carregar páginas do capítulo ${chapter.id}:`, error);
        pagesCount[chapter.id] = 0;
      }
    }
    
    setChaptersWithPages(pagesCount);
  };

  const getPagesCount = (chapterId) => {
    return chaptersWithPages[chapterId] || 0;
  };

  const handleCreateChapter = () => {
    setEditingChapter(null);
    setShowModal(true);
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setShowModal(true);
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm('Tem certeza que deseja deletar este capítulo?')) {
      return;
    }

    try {
      await mangaService.deleteChapter(chapterId);
      toast.success('Capítulo deletado com sucesso');
      loadManga();
    } catch (error) {
      toast.error('Erro ao deletar capítulo');
    }
  };

  const handleUploadPages = (chapter) => {
    setUploadingChapter(chapter);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = () => {
    loadManga();
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/mangas')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Capítulos de {manga?.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {chapters.length} capítulo{chapters.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={handleCreateChapter}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Capítulo
        </Button>
      </div>

      {chapters.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4 dark:text-gray-400">Nenhum capítulo cadastrado</p>
          <Button onClick={handleCreateChapter}>
            Criar Primeiro Capítulo
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {chapters
            .sort((a, b) => parseFloat(a.chapter_number) - parseFloat(b.chapter_number) || a.id - b.id)
            .map((chapter) => (
              <Card key={chapter.id} className="p-4 hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-20 bg-primary-100 rounded flex items-center justify-center text-primary-600 font-bold dark:bg-gray-700 overflow-hidden">
                      {(() => {
                        const pagesCount = getPagesCount(chapter.id);
                        
                        if (pagesCount > 0 && chapter.pages && chapter.pages.length > 0) {
                          return (
                            <img
                              src={getImageUrl(chapter.pages[0].image_url)}
                              alt={`Capítulo ${parseFloat(chapter.chapter_number)}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<span class="text-2xl">${parseFloat(chapter.chapter_number)}</span>`;
                              }}
                            />
                          );
                        } else if (pagesCount > 0) {
                          return <span className="text-xs text-center">📄 {pagesCount}</span>;
                        } else {
                          return <span className="text-2xl">{parseFloat(chapter.chapter_number)}</span>;
                        }
                      })()}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      Capítulo {parseFloat(chapter.chapter_number)}
                      {chapter.title && ` - ${chapter.title}`}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getPagesCount(chapter.id)} página{getPagesCount(chapter.id) !== 1 ? 's' : ''} • {chapter.views || 0} visualizações
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Criado em {formatDate(chapter.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUploadPages(chapter)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Páginas ({getPagesCount(chapter.id)})
                    </Button>
                    <button
                      onClick={() => handleEditChapter(chapter)}
                      className="p-2 text-gray-600 hover:text-primary-600 transition dark:hover:text-primary-400"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition dark:hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {showModal && (
        <ChapterModal
          mangaId={id}
          chapter={editingChapter}
          onClose={() => {
            setShowModal(false);
            setEditingChapter(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingChapter(null);
            loadManga();
          }}
        />
      )}

      {showUploadModal && (
        <UploadPagesModal
          chapter={uploadingChapter}
          onClose={() => {
            setShowUploadModal(false);
            setUploadingChapter(null);
          }}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};

const ChapterModal = ({ mangaId, chapter, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chapter_number: chapter?.chapter_number || '',
    title: chapter?.title || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.chapter_number) {
      toast.error('Número do capítulo é obrigatório');
      return;
    }

    try {
      setLoading(true);

      if (chapter) {
        await mangaService.updateChapter(chapter.id, formData);
        toast.success('Capítulo atualizado com sucesso!');
      } else {
        await mangaService.createChapter(mangaId, formData);
        toast.success('Capítulo criado com sucesso!');
      }

      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar capítulo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={chapter ? 'Editar Capítulo' : 'Novo Capítulo'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Dica:</strong> Após criar o capítulo, você poderá fazer upload das páginas clicando no botão "Páginas".
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {chapter ? 'Atualizar' : 'Criar Capítulo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// ✅ MODAL COM DRAG & DROP E REORDENAÇÃO
const UploadPagesModal = ({ chapter, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingPages, setExistingPages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    if (chapter?.id) {
      loadExistingPages();
    }
  }, [chapter?.id]);

  const loadExistingPages = async () => {
    try {
      setLoadingPages(true);
      const data = await mangaService.getChapterPages(chapter.id);
      
      let pages = [];
      if (data.pages) pages = data.pages;
      else if (data.chapter?.pages) pages = data.chapter.pages;
      else if (Array.isArray(data)) pages = data;
      
      setExistingPages(pages.sort((a, b) => a.page_number - b.page_number));
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
      setExistingPages([]);
    } finally {
      setLoadingPages(false);
    }
  };

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`Arquivo "${file.name}" não é uma imagem válida`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setFiles(validFiles);

    const newPreviews = validFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      order: existingPages.length + index + 1,
      file: file,
      id: `new-${Date.now()}-${index}`
    }));
    
    setPreviews(newPreviews);
    e.target.value = '';
  };

  // ✅ DRAG & DROP PARA NOVAS PÁGINAS
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPreviews = [...previews];
    const draggedItem = newPreviews[draggedIndex];
    
    newPreviews.splice(draggedIndex, 1);
    newPreviews.splice(index, 0, draggedItem);
    
    // Atualiza ordem
    newPreviews.forEach((preview, idx) => {
      preview.order = existingPages.length + idx + 1;
    });

    setPreviews(newPreviews);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // ✅ MOVER COM BOTÕES
  const movePreview = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= previews.length) return;

    const newPreviews = [...previews];
    [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];
    
    newPreviews.forEach((preview, idx) => {
      preview.order = existingPages.length + idx + 1;
    });

    setPreviews(newPreviews);
  };

  // ✅ REORDENAR PÁGINAS EXISTENTES
  const handleReorderExisting = async () => {
    try {
      setReordering(true);
      
      const updates = existingPages.map((page, index) => ({
        id: page.id,
        page_number: index + 1
      }));

      await mangaService.reorderPages(chapter.id, updates);
      toast.success('Páginas reordenadas com sucesso!');
      await loadExistingPages();
      onSuccess();
    } catch (error) {
      toast.error('Erro ao reordenar páginas');
    } finally {
      setReordering(false);
    }
  };

  const moveExistingPage = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= existingPages.length) return;

    const newPages = [...existingPages];
    [newPages[index], newPages[newIndex]] = [newPages[newIndex], newPages[index]];
    
    setExistingPages(newPages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Selecione pelo menos uma imagem');
      return;
    }

    try {
      setLoading(true);
      
      // Envia na ordem dos previews
      const orderedFiles = previews.map(p => p.file);
      await mangaService.uploadPages(chapter.id, orderedFiles);
      
      toast.success(`${files.length} página${files.length !== 1 ? 's' : ''} enviada${files.length !== 1 ? 's' : ''} com sucesso!`);
      
      previews.forEach(preview => URL.revokeObjectURL(preview.url));
      setFiles([]);
      setPreviews([]);
      
      await loadExistingPages();
      onSuccess();
      
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao fazer upload das páginas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageId) => {
    if (!confirm('Tem certeza que deseja deletar esta página?')) return;

    try {
      await mangaService.deletePage(pageId);
      toast.success('Página deletada com sucesso');
      await loadExistingPages();
      onSuccess();
    } catch (error) {
      toast.error('Erro ao deletar página');
    }
  };

  useEffect(() => {
    return () => {
      previews.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previews]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Páginas do Capítulo ${parseFloat(chapter.chapter_number)}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Páginas Existentes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Páginas Atuais ({existingPages.length})
            </h3>
            {existingPages.length > 1 && (
              <Button
                type="button"
                size="sm"
                onClick={handleReorderExisting}
                loading={reordering}
                variant="outline"
              >
                💾 Salvar Nova Ordem
              </Button>
            )}
          </div>
          
          {!loadingPages && existingPages.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400">Nenhuma página cadastrada ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-96 overflow-y-auto p-2 border rounded bg-gray-50 dark:bg-gray-800">
              {existingPages.map((page, index) => (
                <div key={page.id} className="relative group">
                  <img
                    src={getImageUrl(page.image_url)}
                    alt={`Página ${page.page_number}`}
                    className="w-full h-32 object-cover rounded border hover:shadow-md transition"
                  />
                  <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {page.page_number}
                  </div>
                  
                  {/* Botões de Reordenação */}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => moveExistingPage(index, 'up')}
                      disabled={index === 0}
                      className="p-1 bg-blue-500 text-white rounded disabled:opacity-30"
                      type="button"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveExistingPage(index, 'down')}
                      disabled={index === existingPages.length - 1}
                      className="p-1 bg-blue-500 text-white rounded disabled:opacity-30"
                      type="button"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="p-1 bg-red-500 text-white rounded"
                      type="button"
                      title="Deletar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload de Novas Páginas */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
              Adicionar Novas Páginas *
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleFilesChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 hover:file:cursor-pointer dark:file:bg-primary-900 dark:file:text-primary-200 dark:hover:file:bg-primary-800"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              📌 Arraste as imagens para reordenar antes de enviar
            </p>
          </div>

          {/* Preview com Drag & Drop */}
          {previews.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 dark:text-white">
                Preview - Arraste para Reordenar ({previews.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-96 overflow-y-auto border rounded p-2 bg-white dark:bg-gray-800">
                {previews.map((preview, index) => (
                  <div
                    key={preview.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
                  >
                    <div className="absolute top-1 left-1 bg-primary-600 text-white text-xs px-2 py-1 rounded font-bold z-10">
                      {preview.order}
                    </div>
                    <div className="absolute top-1 right-1 bg-gray-800 bg-opacity-75 p-1 rounded opacity-0 group-hover:opacity-100 transition z-10">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded border-2 border-primary-400 hover:shadow-md transition"
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => movePreview(index, 'up')}
                        disabled={index === 0}
                        className="flex-1 p-1 bg-blue-500 text-white rounded text-xs disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => movePreview(index, 'down')}
                        disabled={index === previews.length - 1}
                        className="flex-1 p-1 bg-blue-500 text-white rounded text-xs disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Fechar
            </Button>
            <Button 
              type="submit" 
              loading={loading} 
              disabled={files.length === 0 || loading}
            >
              {`Enviar ${files.length} Página${files.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MangaChapterManager;