import { Coins } from 'lucide-react';
import { useCoins } from '../../contexts/CoinContext';
import { useNavigate } from 'react-router-dom';

export default function CoinNavbarBadge() {
  const { coins } = useCoins();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/coins')}
      className="flex items-center gap-1 px-3 py-1 rounded-full 
                 bg-yellow-100 text-yellow-800 
                 hover:bg-yellow-200 transition text-sm font-medium
                 dark:bg-yellow-500/20 dark:text-yellow-300 dark:hover:bg-yellow-500/30"
      title="Suas moedas"
    >
      <Coins className="w-4 h-4" />
      {coins}
    </button>
  );
}
