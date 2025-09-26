// components/stocks/SubIndustryCardSkeleton.tsx

export function SubIndustryCardSkeleton() {
  return (
    <div className="bg-block-bg-color rounded-lg shadow-lg border border-color overflow-hidden flex flex-col">
      <div className="px-3 py-2 sm:px-4 border-b border-color bg-gradient-to-r from-[#374151] to-[#2D3748]">
        <div className="h-4 w-40 rounded bg-[#4B5563] animate-pulse" />
      </div>
      <ul className="divide-y divide-color p-2">
        <li className="py-2">
          <div className="h-5 w-full rounded bg-[#374151] animate-pulse" />
        </li>
        <li className="py-2">
          <div className="h-5 w-11/12 rounded bg-[#374151] animate-pulse" />
        </li>
        <li className="py-2">
          <div className="h-5 w-10/12 rounded bg-[#374151] animate-pulse" />
        </li>
        <li className="py-2">
          <div className="h-5 w-9/12 rounded bg-[#374151] animate-pulse" />
        </li>
      </ul>
    </div>
  );
}

/** Three cards, three columns — generic skeleton grid */
export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <SubIndustryCardSkeleton />
      <SubIndustryCardSkeleton />
      <SubIndustryCardSkeleton />
    </div>
  );
}

/** Used inside Suspense to indicate the grid is updating due to new filters */
export function FilterLoadingFallback() {
  return (
    <div className="space-y-3">
      <SkeletonGrid />
    </div>
  );
}
