import Card from '../common/Card';
import Button from '../common/Button';

export function PackageCard({ pkg, purchasing, onPurchase }) {
  const isBuying = purchasing === pkg.id;
  return (
    <Card className={`p-4 flex flex-col h-full transition hover:shadow-md
      ${pkg.popular ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-gray-700'}`}
    >
      {pkg.popular && (
        <span className="self-start text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded mb-2">
          Popular
        </span>
      )}
      <strong className="text-base">{pkg.name}</strong>
      <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
      {pkg.features?.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">{pkg.features.join(' • ')}</p>
      )}
      <div className="mt-auto pt-4 flex items-center justify-between">
        <span className="font-semibold text-primary-600 dark:text-primary-300">
          {pkg.price_label ?? `R$ ${pkg.price ?? 0}`}
        </span>
        <Button disabled={isBuying} onClick={() => onPurchase(pkg)}>
          {isBuying ? 'Comprando...' : 'Comprar'}
        </Button>
      </div>
    </Card>
  );
}