// hooks/useSubscription.js
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { coinService } from '../services/coinService';
import toast from 'react-hot-toast';

const PLANS = [
  { code: 'free',     name: 'Grátis',           description: 'Acesso básico',              value: 0    },
  { code: 'monthly',  name: 'Premium Mensal',    description: 'Renovação mensal',            value: 129  },
  { code: 'annual',   name: 'Premium Anual',     description: 'Melhor custo-benefício',      value: 1199 },
  { code: 'lifetime', name: 'Premium Vitalício', description: 'Acesso ilimitado para sempre', value: 2999 },
];

export function useSubscription() {
  const { user } = useAuthStore();
  const [packages, setPackages]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [purchasing, setPurchasing]   = useState(null);
  const [balance, setBalance]         = useState(user?.coins ?? 0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await coinService.getPackages();
        if (!cancelled) setPackages(data.packages ?? []);
      } catch (err) {
        console.error('Erro ao carregar pacotes:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const purchasePackage = useCallback(async (pkg) => {
    setPurchasing(pkg.id);
    try {
      await coinService.purchasePackage(pkg.id);
      toast.success('Compra realizada com sucesso!');
      setBalance(prev => prev + (pkg.coins ?? 0));
    } catch (err) {
      console.error(err);
      toast.error('Erro ao comprar pacote. Tente novamente.');
    } finally {
      setPurchasing(null);
    }
  }, []);

  return { user, packages, loading, selectedPlan, setSelectedPlan,
           purchasing, purchasePackage, balance, plans: PLANS };
}