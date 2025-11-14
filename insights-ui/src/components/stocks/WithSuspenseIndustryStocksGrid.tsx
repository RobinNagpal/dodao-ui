import { Suspense } from 'react';
import { SubIndustriesResponse } from '@/types/api/ticker-industries';
import IndustryStocksGrid from './IndustryStocksGrid';
import { FilterLoadingFallback } from './SubIndustryCardSkeleton';

interface WithSuspenseIndustryStocksGridProps {
  dataPromise: Promise<SubIndustriesResponse | null>;
  industryName?: string;
}

export default function WithSuspenseIndustryStocksGrid({ dataPromise, industryName }: WithSuspenseIndustryStocksGridProps) {
  return (
    <Suspense fallback={<FilterLoadingFallback />}>
      <IndustryStocksGrid dataPromise={dataPromise} industryName={industryName} />
    </Suspense>
  );
}
