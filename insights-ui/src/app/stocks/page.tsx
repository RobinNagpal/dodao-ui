// app/stocks/page.tsx
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import StocksGridPageActions from '@/app/stocks/StocksGridPageActions';
import AppliedFilterChips from '@/components/stocks/filters/AppliedFilterChips';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import FiltersButton from '@/components/stocks/filters/FiltersButton';
import StocksGrid from '@/components/stocks/StocksGrid';
import { FilterLoadingFallback } from '@/components/stocks/SubIndustryCardSkeleton';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSession } from '@/types/auth';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import type { TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { TICKERS_TAG } from '@/utils/ticker-v1-cache-utils';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';
import { hasFiltersApplied, toSortedQueryString } from '@/components/stocks/filters/filter-utils';

// ────────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'US Stocks by Industry | KoalaGains',
  description:
    'Discover US stocks grouped by industry and sub-industry across NASDAQ, NYSE, and NYSEAMERICAN. See top tickers with detailed reports and AI insights.',
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
    description:
      'Discover US stocks grouped by industry and sub-industry across NASDAQ, NYSE, and AMEX. See top tickers with detailed reports and AI insights.',
    url: 'https://koalagains.com/stocks',
    siteName: 'KoalaGains',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Stocks by Industry | KoalaGains',
    description:
      'Discover US stocks grouped by industry and sub-industry across NASDAQ, NYSE, and AMEX. See top tickers with detailed reports and AI insights.',
  },
  alternates: { canonical: 'https://koalagains.com/stocks' },
};

const breadcrumbs: BreadcrumbsOjbect[] = [{ name: 'US Stocks', href: `/stocks`, current: true }];

// ────────────────────────────────────────────────────────────────────────────────
// Types shared with the grid

type SearchParams = { [key: string]: string | string[] | undefined };

type StocksDataPayload = {
  tickers: TickerWithIndustryNames[];
  filtersApplied: boolean;
};

// ────────────────────────────────────────────────────────────────────────────────
// Helpers

// ────────────────────────────────────────────────────────────────────────────────

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function StocksPage({ searchParams }: PageProps) {
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;

  // Build one promise that resolves to both the data and whether filters were applied.
  const dataPromise: Promise<StocksDataPayload> = (async () => {
    const sp = await searchParams;

    const filters = hasFiltersApplied(sp);
    const base = getBaseUrl() || 'https://koalagains.com';

    let url = '';
    let tags: string[] = [];

    if (filters) {
      const qs = toSortedQueryString(sp);
      url = `${base}/api/${KoalaGainsSpaceId}/tickers-v1-filtered?${qs}`;
      tags = [TICKERS_TAG, 'tickers:US:filtered:' + qs.replace(/&/g, ',')];
    } else {
      url = `${base}/api/${KoalaGainsSpaceId}/tickers-v1?country=US`;
      tags = [TICKERS_TAG];
    }

    const res = await fetch(url, { next: { tags } });
    let tickers: TickerWithIndustryNames[] = [];
    try {
      tickers = (await res.json()) as TickerWithIndustryNames[];
    } catch {
      tickers = [];
    }

    return { tickers, filtersApplied: filters };
  })();

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

      {/* Suspense shows skeletons while new filtered data streams in */}
      <Suspense fallback={<FilterLoadingFallback />}>
        <StocksGrid dataPromise={dataPromise} />
      </Suspense>
    </PageWrapper>
  );
}
