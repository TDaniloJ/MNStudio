import React, { useState, useEffect } from 'react';
import {
  Users, Globe, Sparkles, TrendingUp, Plus, Edit, Trash2,
  Eye, EyeOff, ChevronDown,
} from 'lucide-react';
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

/* ── Tabs ─────────────────────────────────────────────────────────── */

const TABS = [
  { id: 'characters',  icon: Users,      label: 'Personagens' },
  { id: 'worlds',      icon: Globe,      label: 'Mundos'      },
  { id: 'magic',       icon: Sparkles,   label: 'Magia'       },
  { id: 'cultivation', icon: TrendingUp, label: 'Cultivo'     },
];

/* ── Estilos comuns ──────────────────────────────────────────────── */

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none';

/* ── Componente principal ─────────────────────────────────────────── */

const WorldbuildingPanel = ({ novelId, onSelect, mode = 'manage' }) => {
  const [activeTab,          setActiveTab]          = useState('characters');
  const [characters,         setCharacters]         = useState([]);
  const [worlds,             setWorlds]             = useState([]);
  const [magicSystems,       setMagicSystems]       = useState([]);
  const [cultivationSystems, setCultivationSystems] = useState([]);
  const [loading,            setLoading]            = useState(false);
  const [showModal,          setShowModal]          = useState(false);
  const [modalType,          setModalType]          = useState('');
  const [editingItem,        setEditingItem]        = useState(null);

  useEffect(() => { loadData(); }, [novelId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'characters': { const d = await worldbuildingService.getCharacters(novelId);       setCharacters(d.characters || []);         break; }
        case 'worlds':     { const d = await worldbuildingService.getWorlds(novelId);           setWorlds(d.worlds || []);                 break; }
        case 'magic':      { const d = await worldbuildingService.getMagicSystems(novelId);     setMagicSystems(d.systems || []);          break; }
        case 'cultivation':{ const d = await worldbuildingService.getCultivationSystems(novelId); setCultivationSystems(d.systems || []); break; }
      }
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  };

  const handleCreate = (type) => { setModalType(type); setEditingItem(null); setShowModal(true); };
  const handleEdit   = (item, type) => { setModalType(type); setEditingItem(item); setShowModal(true); };

  const handleDelete = async (id, type) => {
    if (!confirm('Deletar este item?')) return;
    try {
      if (type === 'character') await worldbuildingService.deleteCharacter(id);
      else if (type === 'world') await worldbuildingService.deleteWorld(id);
      toast.success('Item deletado!');
      loadData();
    } catch { toast.error('Erro ao deletar'); }
  };

  const counts = {
    characters: characters.length, worlds: worlds.length,
    magic: magicSystems.length, cultivation: cultivationSystems.length,
  };

  const tabItems = { characters, worlds, magic: magicSystems, cultivation: cultivationSystems }[activeTab] || [];

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-primary-500" />
        <h3 className="text-sm font-black text-gray-900 dark:text-white">Worldbuilding</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
              activeTab === id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span className={`text-[10px] px-1 rounded font-bold ${activeTab === id ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              {counts[id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="space-y-2">
        {/* Botão de adicionar */}
        <button type="button"
          onClick={() => handleCreate(activeTab === 'characters' ? 'character' : activeTab === 'worlds' ? 'world' : activeTab === 'magic' ? 'magic' : 'cultivation')}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-primary-600 dark:text-primary-400 border border-dashed border-primary-200 dark:border-primary-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Adicionar {TABS.find((t) => t.id === activeTab)?.label.slice(0, -1)}
        </button>

        {/* Items */}
        {loading ? (
          <div className="h-12 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tabItems.length === 0 ? (
          <p className="text-xs text-center text-gray-400 dark:text-gray-600 py-6">Nenhum item cadastrado</p>
        ) : (
          tabItems.map((item) => {
            const itemType = activeTab === 'characters' ? 'character' : activeTab === 'worlds' ? 'world' : activeTab === 'magic' ? 'magic' : 'cultivation';
            return (
              <WorldbuildingItem
                key={item.id}
                item={item}
                type={itemType}
                onEdit={() => handleEdit(item, itemType)}
                onDelete={() => handleDelete(item.id, itemType)}
                onSelect={() => onSelect?.(item, itemType)}
              />
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <WorldbuildingModal type={modalType} novelId={novelId} item={editingItem}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSuccess={() => { setShowModal(false); setEditingItem(null); loadData(); }} />
      )}
    </Card>
  );
};

/* ── WorldbuildingItem ────────────────────────────────────────────── */

const WorldbuildingItem = ({ item, type, onEdit, onDelete, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);

  const colorMap = {
    character: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10',
    world:     'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10',
    magic:     'border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10',
    cultivation: 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10',
  };

  return (
    <div className={`rounded-xl border p-3 transition-all ${colorMap[type]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
            {item.role && (
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-semibold flex-shrink-0">
                {item.role}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          {showDetails && item.traits && (
            <div className="mt-1.5 space-y-0.5">
              {String(item.traits).split('\n').map((t, i) => (
                <p key={i} className="text-[10px] text-gray-500 dark:text-gray-400">· {t}</p>
              ))}
            </div>
          )}
          {type === 'cultivation' && item.levels?.length > 0 && showDetails && (
            <div className="mt-1.5 space-y-0.5">
              {item.levels.map((l, i) => <p key={i} className="text-[10px] text-orange-600 dark:text-orange-400">· {l}</p>)}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-0.5 flex-shrink-0">
          {(item.traits || item.description) && (
            <button type="button" onClick={() => setShowDetails((v) => !v)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              {showDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
          {(type === 'character' || type === 'world') && (
            <button type="button" onClick={onEdit}
              className="p-1 rounded-lg text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          {(type === 'character' || type === 'world') && (
            <button type="button" onClick={onDelete}
              className="p-1 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Inserir no capítulo */}
      {onSelect && (
        <button type="button" onClick={() => onSelect(item)}
          className="mt-2 w-full text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
          + Inserir no capítulo
        </button>
      )}
    </div>
  );
};

/* ── WorldbuildingModal ───────────────────────────────────────────── */

const WorldbuildingModal = ({ type, novelId, item, onClose, onSuccess }) => {
  const [loading,        setLoading]       = useState(false);
  const [aiLoading,      setAiLoading]     = useState(false);
  const [providerConfig, setProviderConfig]= useState(null);
  const [novelOptions,   setNovelOptions]  = useState([]);
  const [formData,       setFormData]      = useState({
    name: item?.name || '', description: item?.description || '', role: item?.role || '',
    traits: item?.traits || '', type: item?.type || '', elements: item?.elements || '',
    rules: item?.rules || '', levels: item?.levels || [], novel_id: item?.novel_id || novelId || '',
  });

  useEffect(() => {
    novelService.getAll({ limit: 200 }).then((d) => setNovelOptions((d.novels || []).map((n) => ({ value: n.id, label: n.title })))).catch(() => {});
  }, []);

  const set = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const TYPE_LABEL = { character: 'Personagem', world: 'Mundo', magic: 'Sistema de Magia', cultivation: 'Sistema de Cultivo' };

  const handleAIGenerate = async () => {
    if (!providerConfig?.provider || !providerConfig?.model) { toast.error('Selecione um provedor de IA'); return; }
    setAiLoading(true);
    try {
      let result;
      if (type === 'character') { result = await aiService.generateCharacter(novelId, formData.role, formData.traits, providerConfig); if (result.character) { set('name', result.character.name); set('description', result.character.description); set('traits', result.character.traits); } }
      else if (type === 'world') { result = await aiService.generateWorld(novelId, formData.type, formData.elements, providerConfig); if (result.world) { set('name', result.world.name); set('description', result.world.description); } }
      else if (type === 'magic') { result = await aiService.generateMagicSystem(novelId, formData.type, formData.rules, providerConfig); if (result.system) { set('name', result.system.name); set('description', result.system.description); set('rules', result.system.rules); } }
      else if (type === 'cultivation') { result = await aiService.generateCultivationSystem(novelId, formData.levels, providerConfig); if (result.system) { set('name', result.system.name); set('description', result.system.description); set('levels', result.system.levels); } }
      toast.success(`${TYPE_LABEL[type]} gerado com IA!`);
    } catch { toast.error('Erro ao gerar com IA'); }
    finally { setAiLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const target = formData.novel_id || novelId || null;
      if (type === 'character') { item ? await worldbuildingService.updateCharacter(item.id, formData) : await worldbuildingService.createCharacter(target, formData); }
      else if (type === 'world') { item ? await worldbuildingService.updateWorld(item.id, formData) : await worldbuildingService.createWorld(target, formData); }
      else if (type === 'magic') { await worldbuildingService.createMagicSystem(target, formData); }
      else if (type === 'cultivation') {
        if (!formData.name?.trim()) { toast.error('Nome é obrigatório'); setLoading(false); return; }
        await worldbuildingService.createCultivationSystem(target, formData);
      }
      toast.success(`${TYPE_LABEL[type]} ${item ? 'atualizado' : 'criado'}!`);
      onSuccess();
    } catch { toast.error(`Erro ao salvar ${TYPE_LABEL[type]}`); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen onClose={onClose} title={`${item ? 'Editar' : 'Criar'} ${TYPE_LABEL[type]}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* IA */}
        <Card className="p-4 bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Gerar com IA</h4>
          </div>
          <ProviderSelector value={providerConfig} onChange={setProviderConfig} />

          {type === 'character' && (
            <div className="mt-3 space-y-2">
              <Input label="Tipo de Personagem" value={formData.role} onChange={(e) => set('role', e.target.value)} placeholder="Ex: Protagonista, Antagonista…" />
              <textarea value={formData.traits} onChange={(e) => set('traits', e.target.value)} rows={2} placeholder="Características (opcional)…" className={inputCls + ' mt-0'} />
            </div>
          )}
          {type === 'world' && (
            <div className="mt-3 space-y-2">
              <Input label="Tipo de Mundo" value={formData.type} onChange={(e) => set('type', e.target.value)} placeholder="Ex: Medieval, Futurista…" />
              <textarea value={formData.elements} onChange={(e) => set('elements', e.target.value)} rows={2} placeholder="Elementos (opcional)…" className={inputCls + ' mt-0'} />
            </div>
          )}
          {type === 'magic' && (
            <div className="mt-3 space-y-2">
              <Input label="Tipo de Magia" value={formData.type} onChange={(e) => set('type', e.target.value)} placeholder="Ex: Elemental, Runas…" />
              <textarea value={formData.rules} onChange={(e) => set('rules', e.target.value)} rows={2} placeholder="Regras (opcional)…" className={inputCls + ' mt-0'} />
            </div>
          )}
          {type === 'cultivation' && (
            <div className="mt-3">
              <Input label="Número de Níveis" type="number" min="3" max="20"
                value={formData.levels?.length || 10}
                onChange={(e) => { const n = parseInt(e.target.value); set('levels', Array.from({ length: n }, (_, i) => `Nível ${i + 1}`)); }}
                placeholder="10" />
            </div>
          )}
          <button type="button" onClick={handleAIGenerate} disabled={aiLoading || !providerConfig}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl transition-colors">
            <Sparkles className="w-4 h-4" />
            {aiLoading ? 'Gerando…' : 'Gerar com IA'}
          </button>
        </Card>

        {/* Campos manuais */}
        <Input label="Nome *" value={formData.name} onChange={(e) => set('name', e.target.value)}
          placeholder={`Nome do ${TYPE_LABEL[type]?.toLowerCase()}`} required />

        {novelId ? (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Associado à novel: <strong className="text-gray-900 dark:text-white">{novelOptions.find((o) => String(o.value) === String(novelId))?.label || `Novel ${novelId}`}</strong>
          </p>
        ) : (
          <Select label="Associar à Novel (opcional)" options={novelOptions} value={formData.novel_id}
            onChange={(e) => set('novel_id', e.target.value)} />
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Descrição *</label>
          <textarea value={formData.description} onChange={(e) => set('description', e.target.value)} rows={5} required
            className={inputCls} placeholder={`Descreva o ${TYPE_LABEL[type]?.toLowerCase()}…`} />
        </div>

        {type === 'character' && (
          <>
            <Input label="Papel" value={formData.role} onChange={(e) => set('role', e.target.value)} placeholder="Ex: Protagonista, Vilão…" />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Características</label>
              <textarea value={formData.traits} onChange={(e) => set('traits', e.target.value)} rows={3}
                className={inputCls} placeholder="Uma característica por linha…" />
            </div>
          </>
        )}

        {type === 'cultivation' && formData.levels?.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Níveis de Cultivo</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {formData.levels.map((level, i) => (
                <Input key={i} value={level} placeholder={`Nível ${i + 1}`}
                  onChange={(e) => { const l = [...formData.levels]; l[i] = e.target.value; set('levels', l); }} />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>{item ? 'Atualizar' : 'Criar'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default WorldbuildingPanel;