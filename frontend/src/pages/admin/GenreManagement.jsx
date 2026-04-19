import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag, Search, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import { genreService } from '../../services/genreService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const GenreManagement = () => {
  const [genres,      setGenres]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editingGenre,setEditingGenre]= useState(null);
  const [genreName,   setGenreName]   = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [search,      setSearch]      = useState('');

  useEffect(() => { loadGenres(); }, []);

  const loadGenres = async () => {
    setLoading(true);
    try { const data = await genreService.getAll(); setGenres(data.genres); }
    catch { toast.error('Erro ao carregar gêneros'); }
    finally { setLoading(false); }
  };

  const openModal = (genre = null) => {
    setEditingGenre(genre);
    setGenreName(genre?.name || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGenre(null);
    setGenreName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!genreName.trim()) { toast.error('Nome é obrigatório'); return; }
    setSubmitting(true);
    try {
      if (editingGenre) {
        toast.info('Edição de gêneros em breve');
      } else {
        await genreService.create({ name: genreName.trim() });
        toast.success('Gênero criado!');
      }
      closeModal();
      loadGenres();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar gênero');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Deletar "${name}"?`)) return;
    try { await genreService.delete(id); toast.success('Gênero deletado'); loadGenres(); }
    catch { toast.error('Erro ao deletar gênero'); }
  };

  const filtered = genres.filter((g) =>
    !search || g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading fullScreen />;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <Tag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Gêneros</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
            {genres.length} gênero{genres.length !== 1 ? 's' : ''} cadastrado{genres.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={() => openModal()}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Novo Gênero
        </Button>
      </div>

      {/* Busca */}
      {genres.length > 8 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar gêneros…"
            className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-900 dark:text-white placeholder-gray-400" />
        </div>
      )}

      {/* Grid de gêneros */}
      <Card className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-300 dark:text-gray-700">
            <Hash className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum gênero encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map((genre) => (
              <div key={genre.id}
                className="group flex items-center justify-between gap-2 px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{genre.name}</span>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => openModal(genre)}
                    className="p-1 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    title="Editar">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(genre.id, genre.name)}
                    className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Deletar">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal */}
      {showModal && (
        <Modal isOpen onClose={closeModal} title={editingGenre ? 'Editar Gênero' : 'Novo Gênero'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Nome do Gênero *" value={genreName} onChange={(e) => setGenreName(e.target.value)}
              placeholder="Ex: Ação, Romance, Fantasia…" autoFocus />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" loading={submitting}>{editingGenre ? 'Atualizar' : 'Criar'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default GenreManagement;