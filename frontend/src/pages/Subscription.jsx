import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';
import { CurrentPlanCard } from '../components/subscription/CurrentPlanCard';
import { PlanSelector } from '../components/subscription/PlanSelector';
import { PackageCard } from '../components/subscription/PackageCard';

export default function Subscription() {
  const navigate = useNavigate();
  const { user, packages, loading, selectedPlan, setSelectedPlan,
          purchasing, purchasePackage, balance, plans } = useSubscription();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-1">Assinatura</h1>
      <p className="text-gray-500 mb-6">Gerencie seu plano e veja opções de upgrade.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <CurrentPlanCard user={user} balance={balance} onNavigate={() => navigate('/profile')} />
        <PlanSelector
          plans={plans}
          selectedPlan={selectedPlan}
          onSelect={setSelectedPlan}
          onConfirm={() => navigate('/coins')}
        />
      </div>

      <h2 className="text-lg font-semibold mb-3">Pacotes disponíveis</h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">Nenhum pacote disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <PackageCard key={pkg.id} pkg={pkg} purchasing={purchasing} onPurchase={purchasePackage} />
          ))}
        </div>
      )}
    </div>
  );
}