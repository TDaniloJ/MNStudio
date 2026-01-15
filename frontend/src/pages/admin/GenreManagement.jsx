import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { genreService } from '../../services/genreService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [genreName, setGenreName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const data = await genreService.getAll();
      setGenres(data.genres);
    } catch (error) {
      toast.error('Erro ao carregar gêneros');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (genre = null) => {
    setEditingGenre(genre);
    setGenreName(genre?.name || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGenre(null);
    setGenreName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!genreName.trim()) {
      toast.error('Nome do gênero é obrigatório');
      return;
    }

    try {
      setSubmitting(true);

      if (editingGenre) {
        // Atualização não implementada no backend
        toast.info('Edição de gêneros em breve');
      } else {
        await genreService.create({ name: genreName.trim() });
        toast.success('Gênero criado com sucesso!');
      }

      handleCloseModal();
      loadGenres();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar gênero');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja deletar o gênero "${name}"?`)) {
      return;
    }

    try {
      await genreService.delete(id);
      toast.success('Gênero deletado com sucesso');
      loadGenres();
    } catch (error) {
      toast.error('Erro ao deletar gênero');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Gêneros</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {genres.length} gênero{genres.length !== 1 ? 's' : ''} cadastrado{genres.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Gênero
        </Button>
      </div>

      {/* Genres Grid */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition group dark:border-gray-700 dark:hover:border-primary-400"
            >
              <span className="font-medium text-gray-900 dark:text-white">{genre.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition dark:text-gray-300">
                <button
                  onClick={() => handleOpenModal(genre)}
                  className="p-1 text-gray-600 hover:text-primary-600 transition dark:hover:text-primary-400"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(genre.id, genre.name)}
                  className="p-1 text-gray-600 hover:text-red-600 transition dark:hover:text-red-400"
                  title="Deletar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title={editingGenre ? 'Editar Gênero' : 'Novo Gênero'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do Gênero *"
              value={genreName}
              onChange={(e) => setGenreName(e.target.value)}
              placeholder="Ex: Ação, Romance, Fantasia..."
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" loading={submitting}>
                {editingGenre ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GenreManagement;