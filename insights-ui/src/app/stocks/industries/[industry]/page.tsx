// app/stocks/industry/[industry]/page.tsx
import StocksGridPageActions from '@/app/stocks/StocksGridPageActions';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import AppliedFilterChips from '@/components/stocks/filters/AppliedFilterChips';
import { hasFiltersApplied } from '@/components/stocks/filters/filter-utils';
import FiltersButton from '@/components/stocks/filters/FiltersButton';

import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import { FilterLoadingFallback } from '@/components/stocks/SubIndustryCardSkeleton';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { fetchIndustryStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { TickerV1Industry } from '@prisma/client';

import type { Metadata } from 'next';

import { Suspense } from 'react';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

// ────────────────────────────────────────────────────────────────────────────────
// Metadata

export async function generateMetadata(props: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const { industry } = await props.params;
  const industryKey = decodeURIComponent(industry);

  let industryName = industryKey;
  let industrySummary = `Browse ${industryKey} stocks and sub-industries across US exchanges. View reports, metrics, and AI-driven insights.`;

  try {
    const res = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`, { next: { revalidate: 3600 } });
    const data = (await res.json()) as TickerV1Industry;
    industryName = data.name ?? industryKey;
    industrySummary = data.summary ?? industrySummary;
  } catch {
    // fallbacks already set
  }

  const base = `${getBaseUrlForServerSidePages()}/stocks/industries/${encodeURIComponent(industryKey)}`;
  return {
    title: `${industryName} Stocks | KoalaGains`,
    description: industrySummary,
    keywords: [
      `${industryName} stocks`,
      `${industryName} companies`,
      `${industryName} sub-industries`,
      'US stocks',
      'NASDAQ',
      'NYSE',
      'AMEX',
      'Stock analysis',
      'Financial reports',
      'Investment research',
      'KoalaGains',
    ],
    openGraph: {
      title: `${industryName} Stocks | KoalaGains`,
      description: industrySummary,
      url: base,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${industryName} Stocks | KoalaGains`,
      description: industrySummary,
    },
    alternates: { canonical: base },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// ────────────────────────────────────────────────────────────────────────────────
// Types

type PageProps = {
  params: Promise<{ industry: string }>;
  searchParams: Promise<SearchParams>;
};

// ────────────────────────────────────────────────────────────────────────────────
// Page

export default async function IndustryStocksPage({ params, searchParams }: PageProps) {
  // Resolve params now because we need the key for filtering inside the data promise
  const resolvedParams = await params;
  const industryKey = decodeURIComponent(resolvedParams.industry);
  const resolvedSearchParams = await searchParams;

  // Check if filters are applied
  const filters = hasFiltersApplied(resolvedSearchParams);

  // Create a data promise for Suspense when filters are applied
  const dataPromise = filters
    ? (async () => {
        return fetchIndustryStocksData(industryKey, SupportedCountries.US, resolvedSearchParams);
      })()
    : null;

  // Fetch data using the cached function when no filters are applied
  const data = !filters ? await fetchIndustryStocksData(industryKey, SupportedCountries.US, resolvedSearchParams) : null;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'US Stocks', href: `/stocks`, current: false },
    { name: data?.name || industryKey, href: `/stocks/industries/${encodeURIComponent(industryKey)}`, current: true },
  ];

  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          rightButton={
            <div className="flex">
              <FiltersButton />
              <StocksGridPageActions />
            </div>
          }
        />
      </div>

      <AppliedFilterChips />

      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">{data?.name || industryKey} Stocks</h1>
          <CountryAlternatives currentCountry="US" industryKey={industryKey} className="flex-shrink-0" />
        </div>
        <p className="text-[#E5E7EB] text-md mb-4">
          Explore {data?.name || industryKey} companies listed on US exchanges (NASDAQ, NYSE, AMEX).{' '}
          {data?.summary || 'View detailed reports and AI-driven insights.'}{' '}
        </p>
      </div>
      {!data && !dataPromise ? (
        <>
          <p className="text-[#E5E7EB] text-lg">{`No ${industryKey} stocks found.`}</p>
          <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
        </>
      ) : (
        <>
          {filters ? (
            // Use Suspense when filters are applied
            <Suspense fallback={<FilterLoadingFallback />}>
              <IndustryStocksGrid dataPromise={dataPromise} industryName={data?.name || industryKey} />
            </Suspense>
          ) : (
            // Use cached data when no filters are applied
            <IndustryStocksGrid data={data} industryName={data?.name || industryKey} />
          )}
        </>
      )}
    </PageWrapper>
  );
}
