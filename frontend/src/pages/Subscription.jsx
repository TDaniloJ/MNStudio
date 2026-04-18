import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins, Crown, History, CheckCircle, Sparkles,
  PlusCircle, TrendingUp, Zap,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { coinService } from '../services/coinService';
import { useSubscription } from '../hooks/useSubscription';
import PlanCard from '../components/subscription/PlanCard';
import CoinPackageCard from '../components/subscription/CoinPackageCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function Subscription() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    user, coins, plans, currentPlan,
    packages, loadingPackages,
    purchasing, purchasePackage, subscribePlan,
  } = useSubscription();

  const [transactions, setTransactions]     = useState([]);
  const [loadingTx, setLoadingTx]           = useState(false);
  const [showHistory, setShowHistory]       = useState(false);

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

  const txIcon = (type) => {
    const map = {
      purchase: <PlusCircle className="w-4 h-4 text-green-500" />,
      spend:    <Sparkles   className="w-4 h-4 text-purple-500" />,
      bonus:    <Zap        className="w-4 h-4 text-yellow-500" />,
    };
    return map[type] ?? <Coins className="w-4 h-4 text-gray-400" />;
  };

  const txColor = (type) => ({
    purchase: 'text-green-600 dark:text-green-400',
    spend:    'text-red-500 dark:text-red-400',
    bonus:    'text-yellow-600 dark:text-yellow-400',
  }[type] ?? 'text-gray-600 dark:text-gray-400');

  if (loadingPackages) return <Loading fullScreen />;

  return (
    <div className="container-custom py-10 max-w-6xl">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
            <Crown className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assinatura</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Gerencie seu plano e compre moedas
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={loadTransactions} loading={loadingTx}>
          <History className="w-4 h-4 mr-2" />
          {showHistory ? 'Ocultar histórico' : 'Histórico de moedas'}
        </Button>
      </div>

      {/* ── Resumo: plano atual + saldo ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {/* Plano */}
        <Card className="md:col-span-2 p-6 flex items-center gap-5 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 dark:from-primary-900/20 dark:to-primary-800/10 dark:border-primary-800">
          <div className="p-3 bg-primary-200 dark:bg-primary-900/50 rounded-2xl flex-shrink-0">
            <Crown className="w-8 h-8 text-primary-700 dark:text-primary-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-1">
              Plano atual
            </p>
            <p className="text-2xl font-extrabold text-primary-900 dark:text-white">
              {currentPlan.name}
            </p>
            <p className="text-sm text-primary-700 dark:text-primary-300 mt-0.5">
              {currentPlan.description}
            </p>
          </div>
          {currentPlan.id === 'free' && (
            <Button size="sm" onClick={() => document.getElementById('plans-section').scrollIntoView({ behavior: 'smooth' })}>
              Fazer upgrade
            </Button>
          )}
        </Card>

        {/* Saldo de moedas */}
        <Card className="p-6 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/10 dark:border-yellow-800">
          <Coins className="w-10 h-10 text-yellow-500 dark:text-yellow-300" />
          <p className="text-xs font-semibold uppercase tracking-widest text-yellow-700 dark:text-yellow-400">
            Saldo de moedas
          </p>
          <p className="text-4xl font-extrabold text-yellow-800 dark:text-yellow-200">{coins}</p>
          <Button
            size="sm"
            variant="outline"
            className="mt-1 border-yellow-400 text-yellow-700 dark:text-yellow-300 dark:border-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
            onClick={() => navigate('/coins')}
          >
            Ver página de moedas
          </Button>
        </Card>
      </div>

      {/* ── Planos ─────────────────────────────────────────────────── */}
      <section id="plans-section" className="mb-14">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-5 h-5 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Planos</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-7">
          Escolha o plano ideal para a sua experiência de leitura.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={currentPlan.id === plan.id}
              purchasing={purchasing}
              onSubscribe={subscribePlan}
            />
          ))}
        </div>
      </section>

      {/* ── Pacotes de moedas ──────────────────────────────────────── */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comprar Moedas</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-4 h-4" />
            Pacotes maiores = mais economia
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mb-7">
          Use moedas para acessar conteúdo premium, capítulos antecipados e recursos de IA.
        </p>

        {packages.length === 0 ? (
          <p className="text-center py-12 text-gray-400 dark:text-gray-500">
            Nenhum pacote disponível no momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <CoinPackageCard
                key={pkg.id}
                pkg={pkg}
                purchasing={purchasing}
                onPurchase={purchasePackage}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Histórico de transações ────────────────────────────────── */}
      {showHistory && (
        <Card className="p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
            Histórico de Transações
          </h2>

          {transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-400 dark:text-gray-500">
              Nenhuma transação encontrada.
            </p>
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
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
          <span>ℹ️</span> Como funcionam os planos e moedas?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          {[
            'Planos dão acesso contínuo a conteúdos premium durante a vigência.',
            'Moedas são gastas por ação: capítulos antecipados, recursos de IA, etc.',
            'Cada ação mostra o custo antes de confirmar.',
            'Pacotes maiores de moedas oferecem melhor custo-benefício.',
            'Pagamentos são processados de forma segura.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
