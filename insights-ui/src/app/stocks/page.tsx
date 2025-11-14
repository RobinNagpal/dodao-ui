// app/stocks/page.tsx
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import StocksGridPageActions from '@/app/stocks/StocksGridPageActions';
import CompactSubIndustriesGrid from '@/components/stocks/CompactSubIndustriesGrid';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import AppliedFilterChips from '@/components/stocks/filters/AppliedFilterChips';
import { hasFiltersApplied } from '@/utils/ticker-filter-utils';
import FiltersButton from '@/components/stocks/filters/FiltersButton';
import { FilterLoadingFallback } from '@/components/stocks/SubIndustryCardSkeleton';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

// ────────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'US Stocks by Industry | KoalaGains',
  description: 'Discover US stocks grouped by industry and sub-industry across NASDAQ, NYSE, and NYSEAMERICAN. See top tickers with detailed reports.',
  keywords: [
    'US stocks',
    'stocks by industry',
    'NASDAQ',
    'NYSE',
    'AMEX',
    'NYSEAMERICAN',
    'stock analysis',
    'AI stock insights',
    'investment research',
    'top performing stocks',
    'KoalaGains',
  ],
  openGraph: {
    title: 'US Stocks by Industry | KoalaGains',
    description: 'Discover US stocks grouped by industry and sub-industry across NASDAQ, NYSE, and AMEX. See top tickers with detailed reports.',
    url: 'https://koalagains.com/stocks',
    siteName: 'KoalaGains',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Stocks by Industry | KoalaGains',
    description: 'Discover US stocks grouped by industry and sub-industry across NASDAQ, NYSE, and AMEX. See top tickers with detailed reports.',
  },
  alternates: { canonical: 'https://koalagains.com/stocks' },
};

const breadcrumbs: BreadcrumbsOjbect[] = [{ name: 'US Stocks', href: `/stocks`, current: true }];

// ────────────────────────────────────────────────────────────────────────────────

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function StocksPage({ searchParams: searchParamsPromise }: PageProps) {
  const searchParams = await searchParamsPromise;
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;
  const filters = hasFiltersApplied(searchParams);

  // Create a data promise for Suspense when filters are applied
  const dataPromise = filters
    ? (async () => {
        return fetchStocksData(SupportedCountries.US, searchParams);
      })()
    : null;

  // Fetch data using the cached function when no filters are applied
  const data = !filters ? await fetchStocksData(SupportedCountries.US, searchParams) : null;

  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          rightButton={
            <div className="flex">
              <FiltersButton />
              <StocksGridPageActions session={session} />
            </div>
          }
        />
      </div>

      <AppliedFilterChips />

      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">US Stocks by Industry</h1>
          <CountryAlternatives currentCountry="US" className="flex-shrink-0" />
        </div>
        <p className="text-[#E5E7EB] text-md mb-4">
          Explore US stocks across NASDAQ, NYSE, and AMEX exchanges organized by industry. View top-performing companies in each sector with detailed financial
          reports and AI-driven analysis.
        </p>
      </div>

      {filters ? (
        // Use Suspense when filters are applied
        <Suspense fallback={<FilterLoadingFallback />}>
          <CompactSubIndustriesGrid dataPromise={dataPromise} />
        </Suspense>
      ) : (
        // Use cached data when no filters are applied
        <CompactSubIndustriesGrid data={data} />
      )}
    </PageWrapper>
  );
}
