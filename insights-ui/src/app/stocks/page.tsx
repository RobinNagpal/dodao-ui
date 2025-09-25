// app/stocks/page.tsx
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Suspense } from 'react';
import StockActions from '@/app/stocks/StockActions';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import Filters from '@/components/public-equitiesv1/Filters';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import type { Metadata } from 'next';
import { FilterLoadingFallback } from '@/components/stocks/SubIndustryCardSkeleton';
import StocksGrid from '@/components/stocks/StocksGrid';

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
  alternates: {
    canonical: 'https://koalagains.com/stocks',
  },
};

const breadcrumbs: BreadcrumbsOjbect[] = [
  {
    name: 'US Stocks',
    href: `/stocks`,
    current: true,
  },
];

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// Create a stable key from searchParams so Suspense shows fallback on filter changes
function suspenseKey(sp: PageProps['searchParams']): string {
  const entries = Object.entries(sp)
    .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v ?? ''] as const)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`);
  return entries.join('&');
}

export default function StocksPage({ searchParams }: PageProps) {
  const key = suspenseKey(searchParams);

  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          rightButton={
            <div className="flex">
              <Filters showOnlyButton />
              <StockActions />
            </div>
          }
        />
      </div>

      <Filters showOnlyAppliedFilters />

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

      {/* Important: key the Suspense so fallback appears during filter (URL) changes */}
      <Suspense key={key} fallback={<FilterLoadingFallback />}>
        {/* @ts-expect-error Server Component */}
        <StocksGrid searchParams={searchParams} />
      </Suspense>
    </PageWrapper>
  );
}
