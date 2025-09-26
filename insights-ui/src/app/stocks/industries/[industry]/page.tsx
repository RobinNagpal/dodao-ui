// app/stocks/industry/[industry]/page.tsx
import StockActions from '@/app/stocks/StockActions';
import AppliedFilterChips from '@/components/stocks/filters/AppliedFilterChips';
import FiltersButton from '@/components/stocks/filters/FiltersButton';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

import { Suspense } from 'react';
import { hasFiltersApplied, toSortedQueryString } from '@/components/stocks/filters/filter-utils';
import { FilterLoadingFallback } from '@/components/stocks/SubIndustryCardSkeleton';

import IndustryStocksGrid, { type IndustryStocksDataPayload } from '@/components/stocks/IndustryStocksGrid';

import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import type { TickerWithIndustryNames, FilteredTicker } from '@/types/ticker-typesv1';
import { TICKERS_TAG } from '@/utils/ticker-v1-cache-utils';
import type { Metadata } from 'next';
import type { TickerV1Industry } from '@prisma/client';

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

  const base = `https://koalagains.com/stocks/industry/${encodeURIComponent(industryKey)}`;
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

type SearchParams = { [key: string]: string | string[] | undefined };

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

  // Fetch industry display name for header (not part of Suspense)
  let industryName = industryKey;
  let industrySummary: string | undefined;
  try {
    const res = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`, { next: { revalidate: 3600 } });
    const data = (await res.json()) as TickerV1Industry;
    industryName = data.name ?? industryKey;
    industrySummary = data.summary ?? undefined;
  } catch {
    // Fallbacks remain
  }

  // Build data promise used by Suspense grid
  const dataPromise: Promise<IndustryStocksDataPayload> = (async () => {
    const sp = await searchParams;

    const filters = hasFiltersApplied(sp);
    const base = getBaseUrl() || 'https://koalagains.com';

    let url = '';
    let tags: string[] = [];

    if (filters) {
      const qs = toSortedQueryString(sp);
      url = `${base}/api/${KoalaGainsSpaceId}/tickers-v1-filtered?${qs}`;
      tags = [TICKERS_TAG, `tickers:US:filtered:${qs.replace(/&/g, ',')}`];
    } else {
      url = `${base}/api/${KoalaGainsSpaceId}/tickers-v1?country=US`;
      tags = [TICKERS_TAG];
    }

    const res = await fetch(url, { next: { tags } });

    let raw: unknown;
    try {
      raw = await res.json();
    } catch {
      raw = [];
    }

    // Normalize to TickerWithIndustryNames[]
    let allTickers: TickerWithIndustryNames[] = [];
    if (Array.isArray(raw)) {
      const first = raw[0];
      const isFiltered = first && typeof first === 'object' && 'categoryScores' in (first as Record<string, unknown>);
      if (isFiltered) {
        // Map FilteredTicker -> TickerWithIndustryNames
        allTickers = (raw as FilteredTicker[]).map((t) => ({
          id: t.id,
          name: t.name,
          symbol: t.symbol,
          exchange: t.exchange,
          industryKey: t.industryKey,
          subIndustryKey: t.subIndustryKey,
          industryName: (t as unknown as Partial<TickerWithIndustryNames>).industryName ?? t.industryKey,
          subIndustryName: (t as unknown as Partial<TickerWithIndustryNames>).subIndustryName ?? t.subIndustryKey,
          websiteUrl: t.websiteUrl,
          summary: t.summary,
          cachedScore: t.cachedScore,
          spaceId: t.spaceId,
        }));
      } else {
        allTickers = raw as TickerWithIndustryNames[];
      }
    }

    // Restrict to this industry
    const tickers = allTickers.filter((t) => t.industryKey === industryKey);

    return { tickers, filtersApplied: filters };
  })();

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'US Stocks', href: `/stocks`, current: false },
    { name: industryName, href: `/stocks/industry/${encodeURIComponent(industryKey)}`, current: true },
  ];

  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs
          breadcrumbs={breadcrumbs}
          rightButton={
            <div className="flex">
              <FiltersButton />
              <StockActions />
            </div>
          }
        />
      </div>

      <AppliedFilterChips />

      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">{industryName} Stocks</h1>
          <CountryAlternatives currentCountry="US" industryKey={industryKey} className="flex-shrink-0" />
        </div>
        <p className="text-[#E5E7EB] text-md mb-4">
          Explore {industryName} companies listed on US exchanges (NASDAQ, NYSE, AMEX). {industrySummary}
        </p>
      </div>

      {/* Suspense shows skeletons while the (filtered) data streams in */}
      <Suspense fallback={<FilterLoadingFallback />}>
        <IndustryStocksGrid dataPromise={dataPromise} industryName={industryName} />
      </Suspense>
    </PageWrapper>
  );
}
