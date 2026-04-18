import React from 'react';
import { Coins, PlusCircle, CheckCircle, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';

/**
 * Card de pacote de moedas.
 * Reutilizado na CoinsPage e na página de Assinatura.
 */
const CoinPackageCard = ({ pkg, purchasing, onPurchase }) => {
  const isLoading = purchasing === pkg.id;
  const isFree    = pkg.price === '0.00' || pkg.price === 0;
  const priceNum  = parseFloat(pkg.price);
  const total     = pkg.amount + (pkg.bonus ?? 0);
  const perCoin   = !isFree && total > 0 ? (priceNum / total).toFixed(3) : null;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-md
        ${pkg.highlight
          ? 'ring-2 ring-yellow-400 dark:ring-yellow-300 shadow-lg scale-[1.02]'
          : 'border-gray-200 dark:border-gray-700'
        }`}
    >
      {/* Badge melhor oferta */}
      {pkg.highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-4 py-1 bg-yellow-400 dark:bg-yellow-300 text-yellow-900 text-xs font-bold rounded-full shadow">
            <Sparkles className="w-3 h-3" />
            Melhor oferta
          </span>
        </div>
      )}

      {/* Ícone */}
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center">
          <Coins className="w-7 h-7 text-yellow-500 dark:text-yellow-300" />
        </div>
      </div>

      {/* Quantidade */}
      <div className="text-center mb-1">
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {pkg.amount} moedas
        </p>
      </div>

      {/* Bônus */}
      {pkg.bonus > 0 && (
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            +{pkg.bonus} bônus
          </span>
        </div>
      )}

      {/* Preço */}
      <div className="text-center mb-1">
        <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {isFree ? 'Grátis' : `R$ ${priceNum.toFixed(2).replace('.', ',')}`}
        </p>
      </div>

      {/* Custo por moeda */}
      {perCoin && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mb-5">
          R$ {perCoin.replace('.', ',')} por moeda
        </p>
      )}

      {!perCoin && <div className="mb-5" />}

      {/* Botão */}
      <Button
        onClick={() => onPurchase(pkg)}
        loading={isLoading}
        disabled={!!purchasing && !isLoading}
        className={`w-full mt-auto ${
          pkg.highlight
            ? 'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white'
            : ''
        }`}
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        {isFree ? 'Resgatar' : 'Comprar'}
      </Button>
    </div>
  );
};

export default CoinPackageCard;
