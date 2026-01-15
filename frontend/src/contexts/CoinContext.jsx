import { createContext, useContext, useEffect, useState } from 'react';
import { coinService } from '../services/coinService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const CoinContext = createContext(null);

export function CoinProvider({ children }) {
  const { isAuthenticated } = useAuthStore();
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadBalance();
    } else {
      setCoins(0);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const data = await coinService.getBalance();
      setCoins(data.balance);
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      toast.error('Erro ao carregar saldo de moedas');
    } finally {
      setLoading(false);
    }
  };

  const canAfford = (cost) => coins >= cost;

  const spendCoins = async (cost, description, metadata = {}) => {
    if (!isAuthenticated) {
      setLastError('NOT_AUTHENTICATED');
      return false;
    }

    if (coins < cost) {
      setLastError('INSUFFICIENT_COINS');
      return false;
    }

    try {
      const result = await coinService.spendCoins(cost, description, metadata);
      setCoins(result.new_balance);
      setLastError(null);
      return true;
    } catch (error) {
      console.error('Erro ao gastar moedas:', error);
      setLastError('SPEND_ERROR');
      toast.error('Erro ao processar gasto de moedas');
      return false;
    }
  };

  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
  };

  const clearError = () => setLastError(null);

  const refreshBalance = () => {
    if (isAuthenticated) {
      loadBalance();
    }
  };

  return (
    <CoinContext.Provider
      value={{
        coins,
        loading,
        canAfford,
        spendCoins,
        addCoins,
        lastError,
        clearError,
        refreshBalance
      }}
    >
      {children}
    </CoinContext.Provider>
  );
}

export function useCoins() {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoins must be used inside CoinProvider');
  }
  return context;
}