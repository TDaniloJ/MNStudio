import Card from '../common/Card';
import Button from '../common/Button';

export function CurrentPlanCard({ user, balance, onNavigate }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Plano atual</p>
      <span className="inline-block bg-green-100 text-green-700 text-sm font-medium px-2 py-0.5 rounded mb-3">
        {user?.subscription_plan ?? 'Grátis'}
      </span>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-semibold">{balance}</span>
        <span className="text-sm text-gray-500">moedas</span>
      </div>
      <Button variant="secondary" onClick={onNavigate}>Ver perfil</Button>
    </Card>
  );
}