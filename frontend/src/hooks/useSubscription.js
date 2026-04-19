import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useCoins } from '../contexts/CoinContext';
import { coinService } from '../services/coinService';
import { subscriptionService } from '../services/subscriptionService';

export function useSubscription() {
  const { user, updateUser, setUser } = useAuthStore();
  const { coins, refreshBalance } = useCoins();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState(null);

  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [purchasing, setPurchasing] = useState(null);

  // 🔥 plano atual
const currentPlanId = user?.subscription_plan ?? 'free';

const fallbackPlan = {
  id: 'free',
  name: 'Free',
  description: 'Plano gratuito',
  price: 0,
  features: [],
  limitations: [],
};

const currentPlan =
  plans?.find((p) => p?.id === currentPlanId) || fallbackPlan;

  /* ── Carregar planos ───────────────────────────────────────── */

  const loadPlans = useCallback(async () => {
    setLoadingPlans(true);
    setPlansError(null);

    try {
      const data = await subscriptionService.getAllPlans();
      setPlans(data.plans ?? []);
    } catch (error) {
      setPlansError(error);
      toast.error(
        'Erro ao carregar planos' + (error.message ? `: ${error.message}` : '')
      );
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  /* ── Pacotes de moedas ───────────────────────────────────── */

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
    loadPlans();
    loadPackages();
  }, [loadPlans, loadPackages]);

  /* ── Comprar moedas ───────────────────────────────────── */

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

  /* ── Assinar plano (REAL) ───────────────────────────────── */

  const subscribePlan = async (planId) => {
    if (planId === currentPlanId) return;

    setPurchasing(`plan_${planId}`);

    try {
      const result = await subscriptionService.subscribe(planId);

      toast.success(result.message || 'Plano ativado com sucesso!');

      // 🔥 ATUALIZA USUÁRIO NO FRONT
      setUser({
        ...user,
        subscription_plan: planId,
      });

    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao assinar plano');
    } finally {
      setPurchasing(null);
    }
  };

  return {
    user,
    coins,
    plans,
    currentPlan,
    loadingPlans,
    packages,
    loadingPackages,
    purchasing,
    purchasePackage,
    subscribePlan,
  };
}