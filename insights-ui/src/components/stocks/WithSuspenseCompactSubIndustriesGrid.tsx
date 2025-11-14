import { Suspense } from 'react';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import CompactSubIndustriesGrid from './CompactSubIndustriesGrid';
import { FilterLoadingFallback } from './SubIndustryCardSkeleton';

interface WithSuspenseCompactSubIndustriesGridProps {
  dataPromise: Promise<IndustriesResponse>;
}

export default function WithSuspenseCompactSubIndustriesGrid({ dataPromise }: WithSuspenseCompactSubIndustriesGridProps) {
  return (
    <Suspense fallback={<FilterLoadingFallback />}>
      <CompactSubIndustriesGrid dataPromise={dataPromise} />
    </Suspense>
  );
}
