import { Suspense } from 'react';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import CountryIndustriesGrid from './CountryIndustriesGrid';
import { FilterLoadingFallback } from './SubIndustryCardSkeleton';

interface WithSuspenseCountryIndustriesGridProps {
  dataPromise: Promise<IndustriesResponse>;
  countryName: string;
}

export default function WithSuspenseCountryIndustriesGrid({ dataPromise, countryName }: WithSuspenseCountryIndustriesGridProps) {
  return (
    <Suspense fallback={<FilterLoadingFallback />}>
      <CountryIndustriesGrid dataPromise={dataPromise} countryName={countryName} />
    </Suspense>
  );
}
