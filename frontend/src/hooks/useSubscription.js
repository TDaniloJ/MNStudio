import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useCoins } from '../contexts/CoinContext';
import { coinService } from '../services/coinService';

/**
 * Planos estáticos de assinatura.
 * Se o backend tiver um endpoint de planos, substitua por uma chamada de API.
 */
export const PLANS = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    period: null,
    description: 'Para quem está começando',
    color: 'gray',
    features: [
      'Acesso a mangás e novels gratuitos',
      '10 moedas de boas-vindas',
      'Leitura de capítulos públicos',
      'Histórico de leitura',
    ],
    limitations: [
      'Sem acesso a conteúdo premium',
      'Sem capítulos antecipados',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.90,
    period: 'mês',
    description: 'Para leitores assíduos',
    color: 'primary',
    highlight: true,
    features: [
      'Tudo do plano Grátis',
      '100 moedas por mês',
      'Acesso a todo conteúdo premium',
      'Capítulos antecipados',
      'Sem anúncios',
      'Suporte prioritário',
    ],
    limitations: [],
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: 39.90,
    period: 'mês',
    description: 'Para os fãs mais dedicados',
    color: 'purple',
    features: [
      'Tudo do plano Premium',
      '300 moedas por mês',
      'Acesso antecipado a novos títulos',
      'Badge exclusivo de perfil',
      'Download para leitura offline',
      'Acesso a conteúdo exclusivo',
    ],
    limitations: [],
  },
];

export function useSubscription() {
  const { user } = useAuthStore();
  const { coins, refreshBalance } = useCoins();

  const [packages, setPackages]           = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [purchasing, setPurchasing]       = useState(null); // pkg.id sendo comprado

  // Determina o plano atual do usuário com base no campo role/subscription
  // Adapte o campo conforme o que o seu backend retorna
  const currentPlanId = user?.subscription_plan ?? 'free';
  const currentPlan   = PLANS.find((p) => p.id === currentPlanId) ?? PLANS[0];

  /* ── Pacotes de moedas ──────────────────────────────────────────── */

  const loadPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const data = await coinService.getPackages();
      setPackages(data.packages ?? []);
    } catch {
      toast.error('Erro ao carregar pacotes de moedas');
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  /* ── Comprar pacote de moedas ───────────────────────────────────── */

  const purchasePackage = async (pkg) => {
    setPurchasing(pkg.id);
    try {
      const result = await coinService.purchasePackage(pkg.id);
      toast.success(result.message ?? 'Compra realizada com sucesso!');
      refreshBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao processar compra');
    } finally {
      setPurchasing(null);
    }
  };

  /* ── Assinar plano ──────────────────────────────────────────────── */

  const subscribePlan = async (planId) => {
    if (planId === currentPlanId) return;
    setPurchasing(`plan_${planId}`);
    try {
      // Substitua pelo endpoint real de assinatura quando disponível
      // await subscriptionService.subscribe(planId);
      toast.success('Em breve: pagamentos de planos estarão disponíveis!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao assinar plano');
    } finally {
      setPurchasing(null);
    }
  };

  return {
    user,
    coins,
    plans: PLANS,
    currentPlan,
    packages,
    loadingPackages,
    purchasing,
    purchasePackage,
    subscribePlan,
  };
}
