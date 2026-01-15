import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../../services/mangaService';
import { novelService } from '../../services/novelService';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const ChapterManagement = () => {
  const { type, id } = useParams(); // type: 'manga' or 'novel'
  const navigate = useNavigate();
  
  const [content, setContent] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingChapterId, setUploadingChapterId] = useState(null);

  useEffect(() => {
    loadContent();
  }, [type, id]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const service = type === 'manga' ? mangaService : novelService;
      const data = await service.getById(id);
      const item = type === 'manga' ? data.manga : data.novel;
      
      setContent(item);
      setChapters(item.chapters || []);
    } catch (error) {
      toast.error('Erro ao carregar conteúdo');
      navigate(`/admin/${type}s`);
    } finally {
      setLoading(false);
    }
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
      if (type === 'manga') {
        await mangaService.deleteChapter(chapterId);
      } else {
        await novelService.deleteChapter(chapterId);
      }
      toast.success('Capítulo deletado com sucesso');
      loadContent();
    } catch (error) {
      toast.error('Erro ao deletar capítulo');
    }
  };

  const handleUploadPages = (chapterId) => {
    setUploadingChapterId(chapterId);
    setShowUploadModal(true);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/admin/${type}s`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gerenciar Capítulos
            </h1>
            <p className="text-gray-600">{content?.title}</p>
          </div>
        </div>
        <Button onClick={handleCreateChapter}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Capítulo
        </Button>
      </div>

      {/* Chapters List */}
      <Card className="overflow-hidden">
        {chapters.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">Nenhum capítulo cadastrado</p>
            <Button onClick={handleCreateChapter}>
              Criar Primeiro Capítulo
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Capítulo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Título
                  </th>
                  {type === 'manga' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Páginas
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {chapters.map((chapter) => (
                  <tr key={chapter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Cap. {chapter.chapter_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {chapter.title || '-'}
                    </td>
                    {type === 'manga' && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {chapter.pages?.length || 0} páginas
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {chapter.views}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(chapter.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {type === 'manga' && (
                          <button
                            onClick={() => handleUploadPages(chapter.id)}
                            className="p-2 text-gray-600 hover:text-primary-600 transition"
                            title="Upload de páginas"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditChapter(chapter)}
                          className="p-2 text-gray-600 hover:text-primary-600 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Chapter Modal */}
      {showModal && (
        <ChapterModal
          type={type}
          contentId={id}
          chapter={editingChapter}
          onClose={() => {
            setShowModal(false);
            setEditingChapter(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingChapter(null);
            loadContent();
          }}
        />
      )}

      {/* Upload Pages Modal (for manga) */}
      {showUploadModal && type === 'manga' && (
        <UploadPagesModal
          chapterId={uploadingChapterId}
          onClose={() => {
            setShowUploadModal(false);
            setUploadingChapterId(null);
          }}
          onSuccess={() => {
            setShowUploadModal(false);
            setUploadingChapterId(null);
            loadContent();
          }}
        />
      )}
    </div>
  );
};

// Chapter Create/Edit Modal
const ChapterModal = ({ type, contentId, chapter, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chapter_number: chapter?.chapter_number || '',
    title: chapter?.title || '',
    content: chapter?.content || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (type === 'manga') {
        if (chapter) {
          // Update not implemented in mangaService
          toast.info('Edição de capítulos de mangá em breve');
        } else {
          await mangaService.createChapter(contentId, formData);
        }
      } else {
        if (chapter) {
          await novelService.updateChapter(chapter.id, formData);
        } else {
          await novelService.createChapter(contentId, formData);
        }
      }

      toast.success(`Capítulo ${chapter ? 'atualizado' : 'criado'} com sucesso!`);
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
      title={`${chapter ? 'Editar' : 'Novo'} Capítulo`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Número do Capítulo *"
            type="number"
            step="0.1"
            value={formData.chapter_number}
            onChange={(e) => setFormData({ ...formData, chapter_number: e.target.value })}
            required
          />
          <Input
            label="Título (opcional)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {type === 'novel' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo *
            </label>
            <textarea
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input"
              placeholder="Digite o texto do capítulo..."
              required
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {chapter ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Upload Pages Modal (for manga chapters)
const UploadPagesModal = ({ chapterId, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Generate previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Selecione pelo menos uma imagem');
      return;
    }

    try {
      setLoading(true);
      await mangaService.uploadPages(chapterId, files);
      toast.success(`${files.length} páginas enviadas com sucesso!`);
      onSuccess();
    } catch (error) {
      toast.error('Erro ao fazer upload das páginas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Upload de Páginas"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione as imagens das páginas *
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="input"
          />
          <p className="mt-1 text-sm text-gray-500">
            Você pode selecionar múltiplas imagens. Elas serão ordenadas automaticamente.
          </p>
        </div>

        {previews.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              {previews.length} página{previews.length !== 1 ? 's' : ''} selecionada{previews.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Página ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <span className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} disabled={files.length === 0}>
            Enviar Páginas
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChapterManagement;