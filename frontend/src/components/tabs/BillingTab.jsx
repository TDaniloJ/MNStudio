import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Crown, ExternalLink, CheckCircle, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useCoins } from '../../contexts/CoinContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/**
 * Aba de Assinatura no perfil do usuário.
 * Mostra apenas: plano atual + saldo de moedas + links para as páginas completas.
 */
const BillingTab = () => {
  const navigate = useNavigate();
  const { coins } = useCoins();
  const { currentPlan } = useSubscription();

  return (
    <div className="space-y-6">

      {/* ── Cards: plano + moedas ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Plano atual */}
        <Card className="p-6 flex flex-col gap-5 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 dark:from-primary-900/20 dark:to-primary-800/10 dark:border-primary-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-200 dark:bg-primary-900/50 rounded-2xl flex-shrink-0">
              <Crown className="w-7 h-7 text-primary-700 dark:text-primary-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                Plano atual
              </p>
              <p className="text-2xl font-extrabold text-primary-900 dark:text-white truncate">
                {currentPlan.name}
              </p>
              <p className="text-sm text-primary-700 dark:text-primary-300">
                {currentPlan.description}
              </p>
            </div>
          </div>

          {/* Features do plano */}
          <ul className="space-y-2">
            {currentPlan.features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-primary-800 dark:text-primary-200">
                <CheckCircle className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          <Button
            variant="outline"
            className="w-full border-primary-400 text-primary-700 dark:text-primary-300 dark:border-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/30"
            onClick={() => navigate('/subscription')}
          >
            Ver planos disponíveis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* Saldo de moedas */}
        <Card className="p-6 flex flex-col gap-5 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/10 dark:border-yellow-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-200 dark:bg-yellow-900/50 rounded-2xl flex-shrink-0">
              <Coins className="w-7 h-7 text-yellow-700 dark:text-yellow-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-700 dark:text-yellow-400">
                Saldo de moedas
              </p>
              <p className="text-5xl font-extrabold text-yellow-800 dark:text-yellow-200 tabular-nums">
                {coins}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                disponíveis para uso
              </p>
            </div>
          </div>

          {/* Info de uso */}
          <div className="space-y-2">
            {[
              'Use moedas para acessar capítulos antecipados',
              'Gere conteúdo e ideias com IA',
              'Compre pacotes maiores e economize mais',
            ].map((item) => (
              <p key={item} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <CheckCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                {item}
              </p>
            ))}
          </div>

          <Button
            className="w-full bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white"
            onClick={() => navigate('/coins')}
          >
            <Coins className="w-4 h-4 mr-2" />
            Comprar moedas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </div>

      {/* ── Link direto para a página de assinatura ─────────────── */}
      <button
        onClick={() => navigate('/subscription')}
        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition">
            <Crown className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              Gerenciar assinatura completa
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Veja planos, pacotes de moedas e histórico de transações
            </p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition" />
      </button>
    </div>
  );
};

export default BillingTab;