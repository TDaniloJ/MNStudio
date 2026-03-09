import React, { useState, useEffect } from 'react';
import { Users, Globe, Sparkles, TrendingUp, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { worldbuildingService } from '../../services/worldbuildingService';
import { aiService } from '../../services/aiService';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import { novelService } from '../../services/novelService';
import ProviderSelector from './ProviderSelector';

const WorldbuildingPanel = ({ novelId, onSelect, mode = 'manage' }) => {
  const isManage = mode === 'manage';
  const isSelect = mode === 'select';
  const [activeTab, setActiveTab] = useState('characters');
  const [characters, setCharacters] = useState([]);
  const [worlds, setWorlds] = useState([]);
  const [magicSystems, setMagicSystems] = useState([]);
  const [cultivationSystems, setCultivationSystems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadData();
  }, [novelId, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'characters':
          const charData = await worldbuildingService.getCharacters(novelId);
          setCharacters(charData.characters || []);
          break;
        case 'worlds':
          const worldData = await worldbuildingService.getWorlds(novelId);
          setWorlds(worldData.worlds || []);
          break;
        case 'magic':
          const magicData = await worldbuildingService.getMagicSystems(novelId);
          setMagicSystems(magicData.systems || []);
          break;
        case 'cultivation':
          const cultData = await worldbuildingService.getCultivationSystems(novelId);
          setCultivationSystems(cultData.systems || []);
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'characters', icon: Users, label: 'Personagens', count: characters.length },
    { id: 'worlds', icon: Globe, label: 'Mundos', count: worlds.length },
    { id: 'magic', icon: Sparkles, label: 'Magia', count: magicSystems.length },
    { id: 'cultivation', icon: TrendingUp, label: 'Cultivo', count: cultivationSystems.length }
  ];

  const handleCreate = (type) => {
    setModalType(type);
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item, type) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Tem certeza que deseja deletar?')) return;

    try {
      switch (type) {
        case 'character':
          await worldbuildingService.deleteCharacter(id);
          break;
        case 'world':
          await worldbuildingService.deleteWorld(id);
          break;
      }
      toast.success('Item deletado com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Erro ao deletar item');
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
          <Globe className="w-5 h-5 text-primary-600 dark:text-primary-500" />
          Worldbuilding
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 mt-2 ml-1 rounded-lg whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 font-medium dark:bg-primary-700/20 dark:text-white dark:font-medium dark:outline dark:outline-1 dark:outline-primary-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:outline dark:outline-1 dark:outline-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs bg-white px-1.5 py-0.5 rounded-full dark:bg-gray-800 dark:text-gray-300 dark:outline dark:outline-1 dark:outline-gray-600">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Characters */}
        {activeTab === 'characters' && (
          <>
            <Button
              size="sm"
              onClick={() => handleCreate('character')}
              className="w-full">
              <span className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Personagem
              </span>
            </Button>

            {characters.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onEdit={() => handleEdit(char, 'character')}
                onDelete={() => handleDelete(char.id, 'character')}
                onSelect={() => onSelect?.(char, 'character')}
              />
            ))}
          </>
        )}

        {/* Worlds */}
        {activeTab === 'worlds' && (
          <>
            <Button
              size="sm"
              onClick={() => handleCreate('world')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Mundo
            </Button>

            {worlds.map((world) => (
              <WorldCard
                key={world.id}
                world={world}
                onEdit={() => handleEdit(world, 'world')}
                onDelete={() => handleDelete(world.id, 'world')}
                onSelect={() => onSelect?.(world, 'world')}
              />
            ))}
          </>
        )}

        {/* Magic Systems */}
        {activeTab === 'magic' && (
          <>
            <Button
              size="sm"
              onClick={() => handleCreate('magic')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Sistema de Magia
            </Button>

            {magicSystems.map((system) => (
              <MagicSystemCard
                key={system.id}
                system={system}
                onSelect={() => onSelect?.(system, 'magic')}
              />
            ))}
          </>
        )}

        {/* Cultivation Systems */}
        {activeTab === 'cultivation' && (
          <>
            <Button
              size="sm"
              onClick={() => handleCreate('cultivation')}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Sistema de Cultivo
            </Button>

            {cultivationSystems.map((system) => (
              <CultivationSystemCard
                key={system.id}
                system={system}
                onSelect={() => onSelect?.(system, 'cultivation')}
              />
            ))}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <WorldbuildingModal
          type={modalType}
          novelId={novelId}
          item={editingItem}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingItem(null);
            loadData();
          }}
        />
      )}
    </Card>
  );
};

// Character Card Component
const CharacterCard = ({ character, onEdit, onDelete, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary-300 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-white">{character.name}</h4>
            {character.role && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900 dark:text-blue-400">
                {character.role}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">{character.description}</p>
          
          {showDetails && character.traits && (
            <div className="mt-2 text-xs text-gray-500 space-y-1 dark:text-gray-400">
              {character.traits.split('\n').map((trait, i) => (
                <p key={i}>• {trait}</p>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 text-gray-600 hover:text-primary-600 transition dark:text-white dark:hover:text-primary-500"
            title={showDetails ? 'Ocultar' : 'Ver detalhes'}
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="p-1 text-gray-600 hover:text-primary-600 transition dark:text-white dark:hover:text-primary-500"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-600 hover:text-red-600 transition dark:text-red-400 dark:hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(character)}
        className="mt-2 w-full text-xs text-primary-600 hover:text-primary-700 font-medium dark:text-primary-500 dark:hover:text-primary-400"
      >
        Inserir no capítulo
      </button>
    </div>
  );
};

// World Card Component
const WorldCard = ({ world, onEdit, onDelete, onSelect }) => {
  return (
    <div className="p-3 border-2 border-gray-200 rounded-lg hover:border-primary-300 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{world.name}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{world.description}</p>
        </div>

        <div className="flex gap-1">
          <button type="button" onClick={onEdit} className="p-1 text-gray-600 hover:text-primary-600 transition">
            <Edit className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDelete} className="p-1 text-gray-600 hover:text-red-600 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(world)}
        className="mt-2 w-full text-xs text-primary-600 hover:text-primary-700 font-medium"
      >
        Inserir no capítulo
      </button>
    </div>
  );
};

// Magic System Card
const MagicSystemCard = ({ system, onSelect }) => (
  <div className="p-3 border-2 border-purple-200 rounded-lg bg-purple-50">
    <h4 className="font-semibold text-purple-900">{system.name}</h4>
    <p className="text-sm text-purple-700 line-clamp-2">{system.description}</p>
    <button
      type="button"
      onClick={() => onSelect(system)}
      className="mt-2 w-full text-xs text-purple-600 hover:text-purple-700 font-medium"
    >
      Inserir no capítulo
    </button>
  </div>
);

// Cultivation System Card
const CultivationSystemCard = ({ system, onSelect }) => (
  <div className="p-3 border-2 border-orange-200 rounded-lg bg-orange-50">
    <h4 className="font-semibold text-orange-900">{system.name}</h4>
    <div className="text-xs text-orange-700 mt-1 space-y-0.5">
      {system.levels?.map((level, i) => (
        <p key={i}>• {level}</p>
      ))}
    </div>
    <button
      type="button"
      onClick={() => onSelect(system)}
      className="mt-2 w-full text-xs text-orange-600 hover:text-orange-700 font-medium"
    >
      Inserir no capítulo
    </button>
  </div>
);

// Modal Component
const WorldbuildingModal = ({ type, novelId, item, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [providerConfig, setProviderConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    role: item?.role || '',
    traits: item?.traits || '',
    type: item?.type || '',
    elements: item?.elements || '',
    rules: item?.rules || '',
    levels: item?.levels || [],
    novel_id: item?.novel_id || novelId || ''
  });

  const [novelOptions, setNovelOptions] = useState([]);

  useEffect(() => {
    const loadNovels = async () => {
      try {
        const data = await novelService.getAll({ limit: 200 });
        const opts = (data.novels || []).map(n => ({ value: n.id, label: n.title }));
        setNovelOptions(opts);
      } catch (err) {
        console.warn('Não foi possível carregar novels para associação', err);
      }
    };

    loadNovels();
  }, []);

  const handleAIGenerate = async () => {
    try {
      setAiLoading(true);
      let result;

      switch (type) {
        case 'character':
          result = await aiService.generateCharacter(
            novelId,
            formData.role,
            formData.traits,
            providerConfig
          );
          setFormData({
            ...formData,
            name: result.character.name,
            description: result.character.description,
            traits: result.character.traits
          });
          break;

        case 'world':
          result = await aiService.generateWorld(
            novelId,
            formData.type,
            formData.elements,
            providerConfig
          );
          setFormData({
            ...formData,
            name: result.world.name,
            description: result.world.description
          });
          break;

        case 'magic':
          result = await aiService.generateMagicSystem(
            novelId,
            formData.type,
            formData.rules,
            providerConfig
          );
          setFormData({
            ...formData,
            name: result.system.name,
            description: result.system.description,
            rules: result.system.rules
          });
          break;

        case 'cultivation':
          result = await aiService.generateCultivationSystem(
            novelId,
            formData.levels,
            providerConfig
          );
          setFormData({
            ...formData,
            name: result.system.name,
            description: result.system.description,
            levels: result.system.levels
          });
          break;
      }

      toast.success(`${getTypeLabel(type)} gerado com IA!`);
    } catch (error) {
      toast.error('Erro ao gerar com IA');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const targetNovelId = formData.novel_id || novelId || null;

      switch (type) {
        case 'character':
          if (item) {
            await worldbuildingService.updateCharacter(item.id, formData);
          } else {
            await worldbuildingService.createCharacter(targetNovelId, formData);
          }
          break;

        case 'world':
          if (item) {
            await worldbuildingService.updateWorld(item.id, formData);
          } else {
            await worldbuildingService.createWorld(targetNovelId, formData);
          }
          break;

        case 'magic':
          await worldbuildingService.createMagicSystem(targetNovelId, formData);
          break;

        case 'cultivation':
            if (!formData.name?.trim()) {
              toast.error('O nome do sistema de cultivo é obrigatório');
              return;
            }
          await worldbuildingService.createCultivationSystem(targetNovelId, formData);
          break;
      }

      toast.success(`${getTypeLabel(type)} ${item ? 'atualizado' : 'criado'} com sucesso!`);
      onSuccess();
    } catch (error) {
      toast.error(`Erro ao salvar ${getTypeLabel(type)}`);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      character: 'Personagem',
      world: 'Mundo',
      magic: 'Sistema de Magia',
      cultivation: 'Sistema de Cultivo'
    };
    return labels[type] || type;
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${item ? 'Editar' : 'Criar'} ${getTypeLabel(type)}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* AI Generator Section */}
        <Card className="p-4 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center dark:text-white">
            <Sparkles className="w-5 h-5 mr-2" />
            Gerar com IA
          </h4>

          <ProviderSelector
            value={providerConfig}
            onChange={setProviderConfig}
            className="mb-3"
          />

          {/* Character specific */}
          {type === 'character' && (
            <>
              <Input
                label="Tipo de Personagem"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Ex: Protagonista, Antagonista, Mentor..."
              />
              <textarea
                value={formData.traits}
                onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
                placeholder="Características do personagem (opcional)... Ex: Corajoso, inteligente, reservado"
                className="w-full px-3 py-2 mt-3 border rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500"
                rows={2}
              />
            </>
          )}

          {/* World specific */}
          {type === 'world' && (
            <>
              <Input
                label="Tipo de Mundo"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Ex: Medieval, Futurista, Fantasia..."
              />
              <textarea
                value={formData.elements}
                onChange={(e) => setFormData({ ...formData, elements: e.target.value })}
                placeholder="Elementos do mundo (opcional)... Ex: Magia, tecnologia avançada, dragões"
                className="w-full px-3 py-2 mt-3 border rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500"
                rows={2}
              />
            </>
          )}

          {/* Magic System specific */}
          {type === 'magic' && (
            <>
              <Input
                label="Tipo de Magia"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Ex: Elemental, Runas, Invocação..."
              />
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                placeholder="Regras do sistema (opcional)..."
                className="w-full px-3 py-2 mt-3 border rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500"
                rows={2}
              />
            </>
          )}

          {/* Cultivation System specific */}
          {type === 'cultivation' && (
            <Input
              label="Número de Níveis"
              type="number"
              min="3"
              max="20"
              value={formData.levels?.length || 10}
              onChange={(e) => {
                const count = parseInt(e.target.value);
                setFormData({ 
                  ...formData, 
                  levels: Array(count).fill('').map((_, i) => `Nível ${i + 1}`)
                });
              }}
              placeholder="Ex: 10"
            />
          )}

          <Button
            type="button"
            onClick={handleAIGenerate}
            loading={aiLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white mt-3"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar com IA
          </Button>
        </Card>

        {/* Manual Form Fields */}
        <Input
          label="Nome *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={`Nome do ${getTypeLabel(type).toLowerCase()}`}
          required
        />

        {/* Associate to Novel */}
        {novelId ? (
          <div className="text-sm text-gray-700 dark:text-white">
            Associado a: <span className="font-medium text-gray-900 dark:text-white">{novelOptions.find(o => String(o.value) === String(novelId))?.label || `Novel ${novelId}`}</span>
          </div>
        ) : (
          <div>
            <Select
              label="Associar à Novel (opcional)"
              options={novelOptions}
              value={formData.novel_id}
              onChange={(e) => setFormData({ ...formData, novel_id: e.target.value })}
              className="mb-2"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
            Descrição *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-primary-500"
            placeholder={`Descreva o ${getTypeLabel(type).toLowerCase()}...`}
            required
          />
        </div>

        {/* Character specific fields */}
        {type === 'character' && (
          <>
            <Input
              label="Papel"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Ex: Protagonista, Vilão, Mentor..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                Características
              </label>
              <textarea
                value={formData.traits}
                onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-500"
                placeholder="Uma característica por linha..."
              />
            </div>
          </>
        )}

        {/* Cultivation levels */}
        {type === 'cultivation' && formData.levels?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
              Níveis de Cultivo
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {formData.levels.map((level, index) => (
                <Input
                  key={index}
                  value={level}
                  onChange={(e) => {
                    const newLevels = [...formData.levels];
                    newLevels[index] = e.target.value;
                    setFormData({ ...formData, levels: newLevels });
                  }}
                  placeholder={`Nível ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {item ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WorldbuildingPanel;