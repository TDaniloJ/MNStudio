import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../../services/mangaService';
import { genreService } from '../../services/genreService';
import { getImageUrl } from '../../utils/formatters';
import { STATUS_OPTIONS, TYPE_OPTIONS, AGE_RATING_OPTIONS } from '../../utils/constants';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import { AdminFormLayout, FormSection, CoverUpload, GenreGrid } from './AdminFormHelpers';

const MangaForm = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEdit    = !!id;

  const [loading,            setLoading]            = useState(false);
  const [genres,             setGenres]             = useState([]);
  const [selectedGenres,     setSelectedGenres]     = useState([]);
  const [coverPreview,       setCoverPreview]       = useState(null);
  const [coverFile,          setCoverFile]          = useState(null);
  const [alternativeTitles,  setAlternativeTitles]  = useState(['']);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => { loadGenres(); if (isEdit) loadManga(); }, [id]);
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

  const loadManga = async () => {
    setLoading(true);
    try {
      const { manga } = await mangaService.getById(id);
      setValue('title', manga.title);
      setValue('description', manga.description);
      setValue('author', manga.author);
      setValue('artist', manga.artist);
      setValue('status', manga.status);
      setValue('type', manga.type);
      setValue('ageRating', manga.age_rating ? String(manga.age_rating) : '0');
      if (manga.cover_image) setCoverPreview(getImageUrl(manga.cover_image));
      if (manga.alternative_titles?.length > 0) setAlternativeTitles(manga.alternative_titles);
      if (manga.genres?.length > 0) setSelectedGenres(manga.genres.map((g) => g.id));
    } catch { toast.error('Erro ao carregar mangá'); navigate('/admin/mangas'); }
    finally { setLoading(false); }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setCoverFile(file);
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    const input = document.querySelector('input[type="file"]');
    if (input) input.value = '';
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  const addAltTitle    = ()            => setAlternativeTitles([...alternativeTitles, '']);
  const removeAltTitle = (i)           => setAlternativeTitles(alternativeTitles.filter((_, idx) => idx !== i));
  const updateAltTitle = (i, val)      => { const u = [...alternativeTitles]; u[i] = val; setAlternativeTitles(u); };

  const onSubmit = async (data) => {
    if (selectedGenres.length === 0) { toast.error('Selecione pelo menos um gênero'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('description', data.description || '');
      fd.append('author', data.author);
      fd.append('artist', data.artist || '');
      fd.append('status', data.status);
      fd.append('type', data.type);
      fd.append('age_rating', data.ageRating || '0');
      fd.append('genres', JSON.stringify(selectedGenres));
      fd.append('alternative_titles', JSON.stringify(alternativeTitles.filter((t) => t.trim())));
      if (coverFile) fd.append('cover_image', coverFile);

      if (isEdit) { await mangaService.update(id, fd); toast.success('Mangá atualizado!'); }
      else        { await mangaService.create(fd);     toast.success('Mangá criado!');     }
      navigate('/admin/mangas');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar mangá');
    } finally { setLoading(false); }
  };

  if (isEdit && loading) return <Loading fullScreen />;

  return (
    <AdminFormLayout
      title={isEdit ? 'Editar Mangá' : 'Novo Mangá'}
      subtitle={isEdit ? 'Atualize as informações do mangá' : 'Preencha os dados para cadastrar um novo mangá'}
      onBack={() => navigate('/admin/mangas')}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <FormSection title="Informações Básicas">
          {/* Capa */}
          <CoverUpload preview={coverPreview} onFileChange={handleCoverChange} onClear={clearCover} file={coverFile} />

          {/* Título */}
          <Input label="Título *" placeholder="Nome do mangá" error={errors.title?.message}
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

          {/* Classificação etária */}
          <Select label="Classificação Etária *" options={AGE_RATING_OPTIONS}
            error={errors.ageRating?.message}
            {...register('ageRating', { required: 'Classificação é obrigatória' })} />

          {/* Autor / Artista */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Autor *" placeholder="Nome do autor" error={errors.author?.message}
              {...register('author', { required: 'Autor é obrigatório' })} />
            <Input label="Artista" placeholder="Nome do artista" {...register('artist')} />
          </div>

          {/* Status / Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Status *" options={STATUS_OPTIONS} error={errors.status?.message}
              {...register('status', { required: 'Status é obrigatório' })} />
            <Select label="Tipo *" options={TYPE_OPTIONS} error={errors.type?.message}
              {...register('type', { required: 'Tipo é obrigatório' })} />
          </div>
        </FormSection>

        {/* Gêneros */}
        <FormSection title="Gêneros *">
          <GenreGrid genres={genres} selectedGenres={selectedGenres} onToggle={handleGenreToggle} />
        </FormSection>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/mangas')}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Atualizar' : 'Criar'} Mangá
          </Button>
        </div>
      </form>
    </AdminFormLayout>
  );
};

export default MangaForm;