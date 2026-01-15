import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { novelService } from '../../services/novelService';
import { genreService } from '../../services/genreService';
import { getImageUrl } from '../../utils/formatters';
import { STATUS_OPTIONS } from '../../utils/constants';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import WorldbuildingPanel from '../../components/admin/WorldbuildingPanel';

const NovelForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [alternativeTitles, setAlternativeTitles] = useState(['']);
  const [coverFile, setCoverFile] = useState(null);
  const [showWorldbuilding, setShowWorldbuilding] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm();

  useEffect(() => {
    if (coverFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(coverFile);
    }
  }, [coverFile]);

  useEffect(() => {
    loadGenres();
    if (isEdit) {
      loadNovel();
    }
  }, [id]);

  const loadGenres = async () => {
    try {
      const data = await genreService.getAll();
      setGenres(data.genres);
    } catch (error) {
      toast.error('Erro ao carregar gêneros');
    }
  };

  const loadNovel = async () => {
    try {
      setLoading(true);
      const data = await novelService.getById(id);
      const novel = data.novel;

      setValue('title', novel.title);
      setValue('description', novel.description);
      setValue('author', novel.author);
      setValue('status', novel.status);

      if (novel.cover_image) {
        setCoverPreview(getImageUrl(novel.cover_image));
      }

      if (novel.alternative_titles?.length > 0) {
        setAlternativeTitles(novel.alternative_titles);
      }

      if (novel.genres?.length > 0) {
        setSelectedGenres(novel.genres.map(g => g.id));
      }
    } catch (error) {
      toast.error('Erro ao carregar novel');
      navigate('/admin/novels');
    } finally {
      setLoading(false);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('✅ Arquivo selecionado:', file.name, file.size);
      setCoverFile(file); // Armazenar o arquivo no estado
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    // Limpar o input de arquivo
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const addAlternativeTitle = () => {
    setAlternativeTitles([...alternativeTitles, '']);
  };

  const removeAlternativeTitle = (index) => {
    setAlternativeTitles(alternativeTitles.filter((_, i) => i !== index));
  };

  const updateAlternativeTitle = (index, value) => {
    const updated = [...alternativeTitles];
    updated[index] = value;
    setAlternativeTitles(updated);
  };

  const onSubmit = async (data) => {
    if (selectedGenres.length === 0) {
      toast.error('Selecione pelo menos um gênero');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('author', data.author);
      formData.append('status', data.status);
      formData.append('genres', JSON.stringify(selectedGenres));
      formData.append('alternative_titles', JSON.stringify(alternativeTitles.filter(t => t.trim() !== '')));

      // ✅ APENAS ESTA FORMA - usar o coverFile do estado
      if (coverFile) {
        formData.append('cover_image', coverFile);
        console.log('📎 Arquivo anexado via estado:', coverFile.name, coverFile.size);
      } else {
        console.log('⚠️ Nenhum arquivo selecionado');
      }

      // Debug simplificado
      console.log('📦 FormData entries:');
      let hasFile = false;
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log('📁 ARQUIVO ->', pair[0], ':', pair[1].name, `(${pair[1].size} bytes)`);
          hasFile = true;
        } else {
          console.log('📝', pair[0] + ':', pair[1]);
        }
      }

      if (!hasFile) {
        console.log('❌ ATENÇÃO: FormData não contém arquivo!');
      }

      if (isEdit) {
        await novelService.update(id, formData);
        toast.success('Novel atualizada com sucesso!');
      } else {
        const result = await novelService.create(formData); // ✅ DEFINA a variável 'result'
        console.log('✅ Resultado:', result);
        toast.success('Novel criada com sucesso!');
      }

      navigate('/admin/novels');
    } catch (error) {
      console.error('❌ Erro completo:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar novel');
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/admin/novels')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowWorldbuilding(true)}
        >
          📚 Worldbuilding
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar Novel' : 'Nova Novel'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Atualize as informações da novel' : 'Preencha os dados para cadastrar uma nova novel'}
          </p>
        </div>
      </div>

      {showWorldbuilding && (
        <Modal isOpen={true} onClose={() => setShowWorldbuilding(false)} title="Worldbuilding">
          {id ? (
            <WorldbuildingPanel
              novelId={id}
              onSuccess={() => {
                setShowWorldbuilding(false);
                loadGenres();
              }}
            />
          ) : (
            <div className="p-4">Salve a novel primeiro para usar o Worldbuilding.</div>
          )}
        </Modal>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data">
        {/* Basic Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Informações Básicas
          </h2>

          <div className="space-y-4">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capa
              </label>
              <div className="flex items-start gap-4">
                {coverPreview && (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Preview"
                      className="w-32 h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={clearCover}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <label className="flex-1 flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Clique para fazer upload da capa
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG até 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </label>
              </div>
              {/* Mostrar nome do arquivo selecionado */}
              {coverFile && (
                <p className="mt-2 text-sm text-green-600">
                  ✅ Arquivo selecionado: {coverFile.name} ({Math.round(coverFile.size / 1024)} KB)
                </p>
              )}
            </div>

            {/* Title */}
            <Input
              label="Título *"
              placeholder="Nome da novel"
              error={errors.title?.message}
              {...register('title', {
                required: 'Título é obrigatório'
              })}
            />

            {/* Alternative Titles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Títulos Alternativos
              </label>
              <div className="space-y-2">
                {alternativeTitles.map((title, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => updateAlternativeTitle(index, e.target.value)}
                      placeholder="Título alternativo"
                      className="input flex-1"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeAlternativeTitle(index)}
                      disabled={alternativeTitles.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addAlternativeTitle}
                >
                  Adicionar título alternativo
                </Button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sinopse *
              </label>
              <textarea
                rows={6}
                placeholder="Descreva a história da novel..."
                className="input"
                {...register('description', {
                  required: 'Sinopse é obrigatória'
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Author */}
            <Input
              label="Autor *"
              placeholder="Nome do autor"
              error={errors.author?.message}
              {...register('author', {
                required: 'Autor é obrigatório'
              })}
            />

            {/* Status */}
            <Select
              label="Status *"
              options={STATUS_OPTIONS}
              error={errors.status?.message}
              {...register('status', {
                required: 'Status é obrigatório'
              })}
            />
          </div>
        </Card>

        {/* Genres */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Gêneros *
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {genres.map((genre) => (
              <label
                key={genre.id}
                className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition ${
                  selectedGenres.includes(genre.id)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre.id)}
                  onChange={() => handleGenreToggle(genre.id)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{genre.name}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/novels')}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Atualizar' : 'Criar'} Novel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NovelForm;