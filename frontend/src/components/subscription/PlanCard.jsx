import React from 'react';
import { CheckCircle, XCircle, Sparkles, Crown, Star } from 'lucide-react';
import Button from '../../components/common/Button';

const PLAN_STYLES = {
  gray: {
    badge:   'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    border:  'border-gray-200 dark:border-gray-700',
    icon:    'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    button:  'secondary',
  },
  primary: {
    badge:   'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    border:  'ring-2 ring-primary-500 dark:ring-primary-400',
    icon:    'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    button:  'primary',
  },
  purple: {
    badge:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    border:  'ring-2 ring-purple-500 dark:ring-purple-400',
    icon:    'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    button:  'primary',
  },
};

const PLAN_ICONS = {
  free:     <Star className="w-6 h-6" />,
  premium:  <Sparkles className="w-6 h-6" />,
  ultimate: <Crown className="w-6 h-6" />,
};

/**
 * Card de plano de assinatura.
 * Usado tanto na página /subscription quanto no BillingTab do perfil.
 *
 * @param {object}   plan          - Objeto de plano (de PLANS em useSubscription)
 * @param {boolean}  isCurrent     - Se é o plano ativo do usuário
 * @param {boolean}  compact       - Modo compacto para o BillingTab
 * @param {string}   purchasing    - ID de compra em andamento
 * @param {function} onSubscribe   - Callback ao clicar em assinar
 */
const PlanCard = ({ plan, isCurrent, compact = false, purchasing, onSubscribe }) => {
  const style   = PLAN_STYLES[plan.color] ?? PLAN_STYLES.gray;
  const loading = purchasing === `plan_${plan.id}`;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white dark:bg-gray-900 p-6 transition-shadow hover:shadow-md
        ${style.border} ${plan.highlight ? 'shadow-lg' : ''}`}
    >
      {/* Badge "Mais popular" */}
      {plan.highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-4 py-1 bg-primary-500 text-white text-xs font-bold rounded-full shadow">
            <Sparkles className="w-3 h-3" />
            Mais popular
          </span>
        </div>
      )}

      {/* Ícone + nome */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${style.icon}`}>
          {PLAN_ICONS[plan.id] ?? <Star className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
            {plan.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{plan.description}</p>
        </div>
      </div>

      {/* Preço */}
      <div className="mb-5">
        {plan.price === 0 ? (
          <p className="text-3xl font-extrabold text-gray-900 dark:text-white">Grátis</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">R$</span>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {plan.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/{plan.period}</span>
          </div>
        )}
      </div>

      {/* Features — oculto no modo compact */}
      {!compact && (
        <ul className="space-y-2 mb-6 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
          {plan.limitations.map((l) => (
            <li key={l} className="flex items-start gap-2 text-sm text-gray-400 dark:text-gray-500">
              <XCircle className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
              {l}
            </li>
          ))}
        </ul>
      )}

      {/* Botão */}
      {isCurrent ? (
        <div className={`w-full text-center py-2 px-4 rounded-lg text-sm font-semibold ${style.badge}`}>
          ✓ Plano atual
        </div>
      ) : (
        <Button
          variant={style.button}
          className="w-full"
          loading={loading}
          disabled={!!purchasing}
          onClick={() => onSubscribe(plan.id)}
        >
          {plan.price === 0 ? 'Fazer downgrade' : `Assinar ${plan.name}`}
        </Button>
      )}
    </div>
  );
};

export default PlanCard;
