import React, { useEffect, useState } from 'react';
import {
  Coins,
  PlusCircle,
  Sparkles,
  CheckCircle,
  TrendingUp,
  History,
  Award,
  Zap
} from 'lucide-react';
import { useCoins } from '../contexts/CoinContext';
import { coinService } from '../services/coinService';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { formatDate } from '../utils/formatters';

export default function CoinsPage() {
  const { coins, refreshBalance } = useCoins();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [buyingId, setBuyingId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPackages();
  }, [isAuthenticated]);

  const loadPackages = async () => {
    try {
      setLoadingPackages(true);
      const data = await coinService.getPackages();
      setPackages(data.packages);
    } catch (error) {
      toast.error('Erro ao carregar pacotes');
    } finally {
      setLoadingPackages(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const data = await coinService.getTransactions(20);
      setTransactions(data.transactions);
      setShowHistory(true);
    } catch (error) {
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleBuy = async (pkg) => {
    setBuyingId(pkg.id);

    try {
      const result = await coinService.purchasePackage(pkg.id);
      toast.success(result.message);
      refreshBalance();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao processar compra');
    } finally {
      setBuyingId(null);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <PlusCircle className="w-4 h-4 text-green-600" />;
      case 'spend':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'bonus':
        return <Award className="w-4 h-4 text-yellow-600" />;
      default:
        return <Coins className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600';
      case 'spend':
        return 'text-red-600';
      case 'bonus':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loadingPackages) {
    return <Loading fullScreen />;
  }

  return (
    <div className="container-custom py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-xl dark:bg-yellow-900/20">
            <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Moedas</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie suas moedas e faça compras</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={loadTransactions}
          loading={loadingTransactions}
        >
          <History className="w-4 h-4 mr-2" />
          Histórico
        </Button>
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 md:col-span-2 dark:bg-yellow-900/10 dark:border-yellow-700 dark:from-yellow-900/10 dark:to-yellow-800/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium mb-1 dark:text-yellow-400">Saldo Atual</p>
              <div className="text-5xl font-extrabold text-yellow-800 flex items-center gap-3 dark:text-yellow-300">
                <Coins className="w-12 h-12" />
                {coins}
              </div>
              <p className="text-xs text-yellow-600 mt-2 dark:text-yellow-400">
                Use para ações de IA e recursos premium
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-200 rounded-full text-yellow-800 font-semibold dark:bg-yellow-800/30 dark:text-yellow-300">
                <Zap className="w-4 h-4" />
                Ativo
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:bg-purple-900/10 dark:border-purple-700 dark:from-purple-900/10 dark:to-purple-800/10">
          <div className="text-center">
            <TrendingUp className="w-10 h-10 text-purple-600 mx-auto mb-3 dark:text-purple-300" />
            <p className="text-sm text-purple-700 font-medium mb-1 dark:text-purple-400">Economize até</p>
            <div className="text-3xl font-bold text-purple-800 dark:text-purple-300">40%</div>
            <p className="text-xs text-purple-600 mt-2 dark:text-purple-400">
              Comprando pacotes maiores
            </p>
          </div>
        </Card>
      </div>

      {/* Packages */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-white">
          Comprar Moedas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <Card
              key={pkg.id}
              className={`relative p-6 transition-all hover:shadow-lg ${pkg.highlight
                  ? 'ring-2 ring-yellow-400 shadow-lg scale-105 dark:ring-yellow-300'
                  : ''
                }`}
            >
              {pkg.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md dark:bg-yellow-300 dark:text-yellow-900">
                    <Sparkles className="w-3 h-3" />
                    MELHOR OFERTA
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4 dark:bg-yellow-900/20">
                  <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-1 dark:text-white">
                  {pkg.amount} moedas
                </h3>

                {pkg.bonus > 0 && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-3 dark:bg-green-900/20 dark:text-green-300">
                    <CheckCircle className="w-4 h-4" />
                    +{pkg.bonus} bônus
                  </div>
                )}

                <div className="text-3xl font-bold text-gray-900 mb-1 dark:text-white">
                  {pkg.price === '0.00' ? 'Grátis' : `R$ ${parseFloat(pkg.price).toFixed(2)}`}
                </div>

                {pkg.price !== '0.00' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    R$ {(parseFloat(pkg.price) / (pkg.amount + pkg.bonus)).toFixed(2)} por moeda
                  </p>
                )}
              </div>

              <Button
                onClick={() => handleBuy(pkg)}
                loading={buyingId === pkg.id}
                disabled={buyingId && buyingId !== pkg.id}
                className={`w-full ${pkg.highlight
                    ? 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700'
                    : ''
                  }`}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                {pkg.price === '0.00' ? 'Resgatar' : 'Comprar'}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      {showHistory && (
        <Card className="p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Histórico de Transações
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowHistory(false)}
            >
              Ocultar
            </Button>
          </div>

          {transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8 dark:text-gray-400">
              Nenhuma transação ainda
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tx.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(tx.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getTransactionColor(tx.type)}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Info */}
      <Card className="p-6 bg-blue-50 border-blue-200 mt-8 dark:bg-blue-900/20 dark:border-blue-700">
        <h3 className="font-semibold text-blue-900 mb-3 dark:text-blue-200">ℹ️ Como funcionam as moedas?</h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Use moedas para gerar capítulos, obter ideias e melhorar textos com IA</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>O custo é sempre exibido antes de qualquer ação</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Pacotes maiores oferecem melhor custo-benefício</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Pagamentos são processados de forma segura</span>
          </li>
        </ul>
      </Card>

      {/* Insufficient Coins Alert */}
      <InsufficientCoinsAlert />
    </div>
  );
}

// Alert Component
export function InsufficientCoinsAlert() {
  const { lastError, clearError } = useCoins();
  const navigate = useNavigate();

  if (lastError !== 'INSUFFICIENT_COINS') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fadeIn">
      <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg dark:bg-red-900">
            <Coins className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1 dark:text-red-200">
              Moedas Insuficientes
            </h4>
            <p className="text-sm text-red-700 mb-3 dark:text-red-400">
              Você não tem moedas suficientes para esta ação.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={clearError}
              >
                Fechar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  clearError();
                  navigate('/coins');
                }}
              >
                Comprar Moedas
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}