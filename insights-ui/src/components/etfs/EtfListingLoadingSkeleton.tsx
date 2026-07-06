export default function EtfListingLoadingSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="h-5 w-32 bg-surface rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-14 bg-surface-2 rounded" />
              <div className="h-4 w-12 bg-surface rounded" />
            </div>
            <div className="h-4 w-3/4 bg-surface-2 rounded mb-1" />
            <div className="h-4 w-1/2 bg-surface-2 rounded mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <div className="h-3 w-12 bg-surface rounded mb-1" />
                  <div className="h-4 w-16 bg-surface-2 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
