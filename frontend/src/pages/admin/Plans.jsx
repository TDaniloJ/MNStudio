import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Crown, Check, Coins } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscriptionService as planService } from '../../services/subscriptionService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

const PLAN_COLORS = ['blue', 'purple', 'amber', 'green'];
const COLOR_MAP = {
  blue:   { icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',   badge: 'bg-blue-600 text-white' },
  purple: { icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400', badge: 'bg-purple-600 text-white' },
  amber:  { icon: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', badge: 'bg-amber-500 text-white' },
  green:  { icon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', badge: 'bg-green-600 text-white' },
};

const EMPTY_PLAN = { name: '', description: '', price: '', duration_days: 30, coins_reward: 0, features: '', highlight: false };

const Plans = () => {
  const [plans,         setPlans]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [selectedPlan,  setSelectedPlan]  = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [formData,      setFormData]      = useState(EMPTY_PLAN);
  const navigate = useNavigate();

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await planService.getAllPlans();
      setPlans(Array.isArray(data) ? data : data.plans || []);
    } catch { toast.error('Erro ao carregar planos'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setSelectedPlan(null);
    setFormData(EMPTY_PLAN);
    setIsModalOpen(true);
  };

  const openEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name:          plan.name          || '',
      description:   plan.description   || '',
      price:         plan.price         || '',
      duration_days: plan.duration_days || 30,
      coins_reward:  plan.coins_reward  || 0,
      features:      Array.isArray(plan.features) ? plan.features.join('\n') : (plan.features || ''),
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        features: formData.features.split('\n').map((f) => f.trim()).filter(Boolean),
        price: parseFloat(formData.price) || 0,
        duration_days: parseInt(formData.duration_days) || 0,
        coins_reward: parseInt(formData.coins_reward) || 0,
        highlight: formData.highlight || false,
      };
      if (selectedPlan) {
        await planService.updatePlan(selectedPlan.id, payload);
        toast.success('Plano atualizado!');
      } else {
        await planService.createPlan(payload);
        toast.success('Plano criado!');
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch { toast.error('Erro ao salvar plano'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (planId, name) => {
    if (!confirm(`Excluir o plano "${name}"?`)) return;
    try { await planService.deletePlan(planId); toast.success('Plano excluído!'); fetchPlans(); }
    catch { toast.error('Erro ao excluir plano'); }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Planos e Preços</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
            Gerencie os planos de assinatura disponíveis na plataforma
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Novo Plano
        </Button>
      </div>


      {/* Cards de planos */}
      {plans.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-gray-300 dark:text-gray-700">
          <Crown className="w-12 h-12 mb-3" />
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Nenhum plano cadastrado</p>
          <button onClick={openCreate} className="mt-3 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
            Criar primeiro plano
          </button>
        </Card>
      ) : (
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan, idx) => {
            const colorKey = PLAN_COLORS[idx % PLAN_COLORS.length];
            const c        = COLOR_MAP[colorKey];
            const features = Array.isArray(plan.features) ? plan.features : [];
            return (
              <Card key={plan.id} className="relative p-6 flex flex-col group hover:shadow-lg transition-shadow">

                {plans.highlight && (
                  <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-purple-600 text-white">
                    MAIS POPULAR
                  </span>
                )}

                {/* Top */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${c.icon}`}>
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-black text-gray-900 dark:text-white">{plan.name}</h2>
                      {plan.duration_days && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">{plan.duration_days ? `${plan.duration_days} dias` : 'Vitalício'}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {plan.price > 0 ? `R$ ${Number(plan.price).toFixed(2)}` : 'Grátis'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">por período</p>
                  </div>
                </div>

                {/* Descrição */}
                {plan.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{plan.description}</p>
                )}

                {/* Coins reward */}
                {plan.coins_reward > 0 && (
                  <div className="flex items-center gap-2 mb-4 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                      {plan.coins_reward} coins de bônus
                    </span>
                  </div>
                )}

                {/* Features */}
                {features.length > 0 && (
                  <ul className="space-y-1.5 mb-5 flex-1">
                    {features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 mt-auto">
                  Criado em {formatDate(plan.createdAt || plan.created_at)}
                </p>

                {/* Ações */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(plan)}>
                    <Edit className="w-3.5 h-3.5 mr-1.5" />
                    Editar
                  </Button>
                  <button onClick={() => handleDelete(plan.id, plan.name)}
                    className="px-3 py-1.5 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal criar/editar */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md"
        title={selectedPlan ? 'Editar Plano' : 'Novo Plano'}>
        <div className="space-y-4">
          <Input label="Nome do Plano *" placeholder="Ex: Premium" value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
              Descrição
            </label>
            <textarea rows={2} value={formData.description} placeholder="Descreva o plano..."
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Preço (R$)" type="number" step="0.01" placeholder="9.90"
              value={formData.price}
              onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))} />
            <Input label="Duração (dias)" type="number" placeholder="30 (ou vazio = vitalício)"
              value={formData.duration_days}
              onChange={(e) => setFormData((p) => ({ ...p, duration_days: e.target.value }))} />
            <Input label="Coins de Bônus" type="number" placeholder="0"
              value={formData.coins_reward}
              onChange={(e) => setFormData((p) => ({ ...p, coins_reward: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
              Benefícios (um por linha)
            </label>
            <textarea rows={5} value={formData.features}
              placeholder={"Acesso ilimitado\nSem anúncios\nCapítulos antecipados"}
              onChange={(e) => setFormData((p) => ({ ...p, features: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none" />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.highlight || false}
              onChange={(e) =>
                setFormData((p) => ({ ...p, highlight: e.target.checked }))
              }
            />
            <label className="text-sm text-gray-600 dark:text-gray-300">
              Destacar como mais popular
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={saving}>
              {selectedPlan ? 'Atualizar' : 'Criar'} Plano
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Plans;