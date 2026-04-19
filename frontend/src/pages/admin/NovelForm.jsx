import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../../services/novelService';
import { genreService } from '../../services/genreService';
import { getImageUrl } from '../../utils/formatters';
import { STATUS_OPTIONS } from '../../utils/constants';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import WorldbuildingPanel from '../../components/admin/WorldbuildingPanel';
import { AdminFormLayout, FormSection, CoverUpload, GenreGrid } from './AdminFormHelpers';

const NovelForm = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [loading,           setLoading]           = useState(false);
  const [genres,            setGenres]            = useState([]);
  const [selectedGenres,    setSelectedGenres]    = useState([]);
  const [coverPreview,      setCoverPreview]      = useState(null);
  const [coverFile,         setCoverFile]         = useState(null);
  const [alternativeTitles, setAlternativeTitles] = useState(['']);
  const [showWorldbuilding, setShowWorldbuilding] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => { loadGenres(); if (isEdit) loadNovel(); }, [id]);
  useEffect(() => {
    if (coverFile) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(coverFile);
    }
  }, [coverFile]);

  const loadGenres = async () => {
    try { const d = await genreService.getAll(); setGenres(d.genres); }
    catch { toast.error('Erro ao carregar gêneros'); }
  };

  const loadNovel = async () => {
    setLoading(true);
    try {
      const { novel } = await novelService.getById(id);
      setValue('title', novel.title);
      setValue('description', novel.description);
      setValue('author', novel.author);
      setValue('status', novel.status);
      if (novel.cover_image) setCoverPreview(getImageUrl(novel.cover_image));
      if (novel.alternative_titles?.length > 0) setAlternativeTitles(novel.alternative_titles);
      if (novel.genres?.length > 0) setSelectedGenres(novel.genres.map((g) => g.id));
    } catch { toast.error('Erro ao carregar novel'); navigate('/admin/novels'); }
    finally { setLoading(false); }
  };

  const handleCoverChange  = (e) => { const f = e.target.files?.[0]; if (f) setCoverFile(f); };
  const clearCover         = ()  => {
    setCoverFile(null); setCoverPreview(null);
    const input = document.querySelector('input[type="file"]');
    if (input) input.value = '';
  };

  const handleGenreToggle  = (id) =>
    setSelectedGenres((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);

  const addAltTitle    = ()       => setAlternativeTitles([...alternativeTitles, '']);
  const removeAltTitle = (i)      => setAlternativeTitles(alternativeTitles.filter((_, idx) => idx !== i));
  const updateAltTitle = (i, val) => { const u = [...alternativeTitles]; u[i] = val; setAlternativeTitles(u); };

  const onSubmit = async (data) => {
    if (selectedGenres.length === 0) { toast.error('Selecione pelo menos um gênero'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('description', data.description || '');
      fd.append('author', data.author);
      fd.append('status', data.status);
      fd.append('genres', JSON.stringify(selectedGenres));
      fd.append('alternative_titles', JSON.stringify(alternativeTitles.filter((t) => t.trim())));
      if (coverFile) fd.append('cover_image', coverFile);

      if (isEdit) { await novelService.update(id, fd); toast.success('Novel atualizada!'); }
      else        { await novelService.create(fd);     toast.success('Novel criada!');     }
      navigate('/admin/novels');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar novel');
    } finally { setLoading(false); }
  };

  if (isEdit && loading) return <Loading fullScreen />;

  return (
    <AdminFormLayout
      title={isEdit ? 'Editar Novel' : 'Nova Novel'}
      subtitle={isEdit ? 'Atualize as informações da novel' : 'Preencha os dados para cadastrar uma nova novel'}
      onBack={() => navigate('/admin/novels')}
    >
      {/* Worldbuilding modal */}
      {showWorldbuilding && (
        <Modal isOpen onClose={() => setShowWorldbuilding(false)} title="Worldbuilding">
          {id ? (
            <WorldbuildingPanel novelId={id} onSuccess={() => setShowWorldbuilding(false)} />
          ) : (
            <p className="p-4 text-sm text-gray-500">Salve a novel primeiro para usar o Worldbuilding.</p>
          )}
        </Modal>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Worldbuilding button quando editando */}
        {isEdit && (
          <div>
            <button type="button" onClick={() => setShowWorldbuilding(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 transition-all">
              📚 Worldbuilding
            </button>
          </div>
        )}

        <FormSection title="Informações Básicas">
          <CoverUpload preview={coverPreview} onFileChange={handleCoverChange} onClear={clearCover} file={coverFile} />

          <Input label="Título *" placeholder="Nome da novel" error={errors.title?.message}
            {...register('title', { required: 'Título é obrigatório' })} />

          {/* Títulos alternativos */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
              Títulos Alternativos
            </label>
            <div className="space-y-2">
              {alternativeTitles.map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={t} onChange={(e) => updateAltTitle(i, e.target.value)}
                    placeholder="Título alternativo"
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-900 dark:text-white placeholder-gray-400" />
                  <button type="button" onClick={() => removeAltTitle(i)}
                    disabled={alternativeTitles.length === 1}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addAltTitle}
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                + Adicionar título alternativo
              </button>
            </div>
          </div>

          {/* Sinopse */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
              Sinopse *
            </label>
            <textarea rows={5} placeholder="Descreva a história..."
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
              {...register('description', { required: 'Sinopse é obrigatória' })} />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Autor *" placeholder="Nome do autor" error={errors.author?.message}
              {...register('author', { required: 'Autor é obrigatório' })} />
            <Select label="Status *" options={STATUS_OPTIONS} error={errors.status?.message}
              {...register('status', { required: 'Status é obrigatório' })} />
          </div>
        </FormSection>

        <FormSection title="Gêneros *">
          <GenreGrid genres={genres} selectedGenres={selectedGenres} onToggle={handleGenreToggle} />
        </FormSection>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/novels')}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Atualizar' : 'Criar'} Novel
          </Button>
        </div>
      </form>
    </AdminFormLayout>
  );
};

export default NovelForm;