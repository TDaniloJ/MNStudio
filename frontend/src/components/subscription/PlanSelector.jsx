import Card from '../common/Card';
import Button from '../common/Button';

export function PlanSelector({ plans, selectedPlan, onSelect, onConfirm }) {
  return (
    <Card className="p-4">
      <h3 className="text-base font-semibold mb-3">Planos disponíveis</h3>
      <div className="space-y-2">
        {plans.map((plan) => (
          <button
            key={plan.code}
            type="button"
            onClick={() => onSelect(plan.code)}
            className={`w-full text-left p-3 rounded border transition
              ${selectedPlan === plan.code
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/40'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">{plan.name}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                R$ {plan.value.toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
          </button>
        ))}
      </div>
      <div className="mt-4">
        <Button disabled={!selectedPlan} onClick={onConfirm} className="w-full">
          {selectedPlan ? 'Ir para pagamento' : 'Selecione um plano'}
        </Button>
      </div>
    </Card>
  );
}