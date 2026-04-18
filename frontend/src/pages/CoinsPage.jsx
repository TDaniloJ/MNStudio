import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Coins, History, CheckCircle, Sparkles,
  PlusCircle, Crown, TrendingUp, Zap, Award,
} from 'lucide-react';
import { useCoins } from '../contexts/CoinContext';
import { coinService } from '../services/coinService';
import { useAuthStore } from '../store/authStore';
import { useSubscription } from '../hooks/useSubscription';
import CoinPackageCard from '../components/subscription/CoinPackageCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function CoinsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { coins, lastError, clearError, refreshBalance } = useCoins();
  const { packages, loadingPackages, currentPlan } = useSubscription();

  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx]       = useState(false);
  const [showHistory, setShowHistory]   = useState(false);
  const [buyingId, setBuyingId]         = useState(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const loadTransactions = async () => {
    if (showHistory) { setShowHistory(false); return; }
    setLoadingTx(true);
    try {
      const data = await coinService.getTransactions(20);
      setTransactions(data.transactions ?? []);
      setShowHistory(true);
    } catch {
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoadingTx(false);
    }
  };

  const handleBuy = async (pkg) => {
    setBuyingId(pkg.id);
    try {
      const result = await coinService.purchasePackage(pkg.id);
      toast.success(result.message ?? 'Compra realizada!');
      refreshBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao processar compra');
    } finally {
      setBuyingId(null);
    }
  };

  const txIcon = (type) => ({
    purchase: <PlusCircle className="w-4 h-4 text-green-500" />,
    spend:    <Sparkles   className="w-4 h-4 text-purple-500" />,
    bonus:    <Award      className="w-4 h-4 text-yellow-500" />,
  }[type] ?? <Coins className="w-4 h-4 text-gray-400" />);

  const txColor = (type) => ({
    purchase: 'text-green-600 dark:text-green-400',
    spend:    'text-red-500  dark:text-red-400',
    bonus:    'text-yellow-600 dark:text-yellow-400',
  }[type] ?? 'text-gray-600 dark:text-gray-400');

  if (loadingPackages) return <Loading fullScreen />;

  return (
    <div className="container-custom py-10 max-w-5xl">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
            <Coins className="w-8 h-8 text-yellow-500 dark:text-yellow-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Moedas</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Compre moedas e veja seu histórico
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadTransactions} loading={loadingTx}>
          <History className="w-4 h-4 mr-2" />
          {showHistory ? 'Ocultar' : 'Histórico'}
        </Button>
      </div>

      {/* ── Saldo + plano atual ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        <Card className="md:col-span-2 p-6 flex items-center gap-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/10 dark:border-yellow-800">
          <Coins className="w-14 h-14 text-yellow-500 dark:text-yellow-300 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-700 dark:text-yellow-400 mb-1">
              Saldo atual
            </p>
            <p className="text-5xl font-extrabold text-yellow-800 dark:text-yellow-200">
              {coins}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Use para acessar conteúdo premium e recursos de IA
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-200 dark:bg-yellow-800/40 rounded-full text-yellow-800 dark:text-yellow-300 text-sm font-semibold flex-shrink-0">
            <Zap className="w-4 h-4" />
            Ativo
          </div>
        </Card>

        {/* Plano atual → link para /subscription */}
        <Link to="/subscription">
          <Card className="h-full p-6 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 dark:from-primary-900/20 dark:to-primary-800/10 dark:border-primary-800 hover:shadow-md transition cursor-pointer">
            <Crown className="w-8 h-8 text-primary-500 dark:text-primary-300" />
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                Seu plano
              </p>
              <p className="text-xl font-extrabold text-primary-800 dark:text-primary-200 mt-0.5">
                {currentPlan.name}
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                Ver planos →
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* ── Pacotes ────────────────────────────────────────────────── */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comprar Moedas</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            Economize até 40% nos pacotes maiores
          </div>
        </div>

        {packages.length === 0 ? (
          <p className="text-center py-12 text-gray-400">Nenhum pacote disponível.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <CoinPackageCard
                key={pkg.id}
                pkg={pkg}
                purchasing={buyingId}
                onPurchase={handleBuy}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Histórico ──────────────────────────────────────────────── */}
      {showHistory && (
        <Card className="p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
            Histórico de Transações
          </h2>
          {transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Nenhuma transação ainda.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      {txIcon(tx.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tx.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-base font-bold ${txColor(tx.type)}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Info ───────────────────────────────────────────────────── */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
          ℹ️ Como funcionam as moedas?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          {[
            'Use moedas para gerar capítulos, obter ideias e melhorar textos com IA.',
            'O custo é sempre exibido antes de qualquer ação.',
            'Pacotes maiores oferecem melhor custo-benefício.',
            'Pagamentos são processados de forma segura.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      {/* ── Alert: moedas insuficientes ────────────────────────────── */}
      <InsufficientCoinsAlert lastError={lastError} clearError={clearError} />
    </div>
  );
}

/* ── Alert de moedas insuficientes ──────────────────────────────── */

export function InsufficientCoinsAlert({ lastError, clearError }) {
  const navigate = useNavigate();
  if (lastError !== 'INSUFFICIENT_COINS') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-xl flex-shrink-0">
            <Coins className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">
              Moedas Insuficientes
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400 mb-3">
              Você não tem moedas suficientes para esta ação.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={clearError}>
                Fechar
              </Button>
              <Button size="sm" onClick={() => { clearError(); navigate('/coins'); }}>
                Comprar Moedas
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
