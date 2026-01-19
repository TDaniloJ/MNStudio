const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div
        key={i}
        className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
      />
    ))}
  </div>
);

export default LoadingSkeleton;
