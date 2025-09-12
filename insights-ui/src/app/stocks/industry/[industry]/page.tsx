import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Filters from '@/components/public-equitiesv1/Filters';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getScoreColorClasses } from '@/utils/score-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Metadata } from 'next';
import Link from 'next/link';
import { TickerV1 } from '@prisma/client';
import { getSubIndustryDisplayName, INDUSTRY_MAPPINGS } from '@/lib/mappingsV1';

// Import the FilteredTicker interface from the API route
interface FilteredTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  websiteUrl?: string | null;
  summary?: string | null;
  cachedScore: number;
  spaceId: string;
  categoryScores: {
    [key: string]: number;
  };
  totalScore: number;
}

export async function generateMetadata(props: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const params = await props.params;
  const industryKey = decodeURIComponent(params.industry);
  const industryName = INDUSTRY_MAPPINGS[industryKey as keyof typeof INDUSTRY_MAPPINGS] || industryKey;

  const base = `https://koalagains.com/stocks/industry/${encodeURIComponent(industryKey)}`;
  return {
    title: `${industryName} Stocks | KoalaGains`,
    description: `Explore ${industryName} companies across US exchanges (NASDAQ, NYSE, AMEX). Get detailed financial reports, performance metrics, and AI-driven analysis for investment decisions.`,
    alternates: {
      canonical: base,
    },
    keywords: [
      `${industryName} stocks`,
      `${industryName} companies`,
      'US stocks',
      'NASDAQ stocks',
      'NYSE stocks',
      'AMEX stocks',
      'KoalaGains',
      'Stock analysis',
      'Financial reports',
      'Investment research',
    ],
  };
}

// Add viewport meta tag if not already in your _document.js or layout component
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function IndustryStocksPage(props: {
  params: Promise<{ industry: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const industryKey = decodeURIComponent(params.industry);
  const industryName = INDUSTRY_MAPPINGS[industryKey as keyof typeof INDUSTRY_MAPPINGS] || industryKey;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'US Stocks',
      href: `/stocks`,
      current: false,
    },
    {
      name: industryName,
      href: `/stocks/industry/${encodeURIComponent(industryKey)}`,
      current: true,
    },
  ];

  // Check if any filters are applied
  const hasFilters = Object.keys(searchParams).some((key) => key.includes('Threshold'));

  let tickers: FilteredTicker[] = [];

  if (hasFilters) {
    // Build URL with filter params for the filtered API
    const urlParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') urlParams.set(key, value);
    });

    // Add country and industry filters
    urlParams.set('country', 'US');

    const apiUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1-filtered?${urlParams.toString()}`;
    const response = await fetch(apiUrl);
    const allTickers = await response.json();

    // Filter by main industry
    tickers = allTickers.filter((ticker: FilteredTicker) => ticker.industryKey === industryKey);
  } else {
    // Use regular tickers API when no filters are applied
    const apiUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1?country=US`;
    const response = await fetch(apiUrl);
    const regularTickers: TickerV1[] = await response.json();

    // Filter by main industry and transform to FilteredTicker format
    tickers = regularTickers
      .filter((ticker) => ticker.industryKey === industryKey)
      .map((ticker) => ({
        id: ticker.id,
        name: ticker.name,
        symbol: ticker.symbol,
        exchange: ticker.exchange,
        industryKey: ticker.industryKey,
        subIndustryKey: ticker.subIndustryKey,
        websiteUrl: ticker.websiteUrl,
        summary: ticker.summary,
        cachedScore: ticker.cachedScore,
        spaceId: ticker.spaceId,
        categoryScores: {}, // Empty for unfiltered case
        totalScore: 0, // Will be calculated if needed
      }));
  }

  // Group tickers by sub-industry for display
  const tickersBySubIndustry: Record<string, FilteredTicker[]> = {};

  tickers.forEach((ticker) => {
    const subIndustry = ticker.subIndustryKey || 'Other';
    if (!tickersBySubIndustry[subIndustry]) {
      tickersBySubIndustry[subIndustry] = [];
    }
    tickersBySubIndustry[subIndustry].push(ticker);
  });

  // Sort tickers by score within each sub-industry
  Object.keys(tickersBySubIndustry).forEach((subIndustry) => {
    tickersBySubIndustry[subIndustry].sort((a, b) => b.cachedScore - a.cachedScore);
  });

  return (
    <Tooltip.Provider delayDuration={300}>
      <PageWrapper className="px-4 sm:px-6">
        <div className="overflow-x-auto">
          <Breadcrumbs breadcrumbs={breadcrumbs} rightButton={<Filters showOnlyButton={true} />} />
        </div>
        <Filters showOnlyAppliedFilters={true} />

        <PrivateWrapper>
          <div className="flex flex-wrap justify-end gap-3 mb-6">
            <Link
              href={'/public-equities-v1/create-reports-v1'}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium rounded-lg px-4 py-2.5 text-sm sm:text-base whitespace-nowrap transition-colors duration-200 shadow-md"
            >
              Create Stock Reports
            </Link>
            <Link
              href={'/public-equities-v1/analysis-factors'}
              className="bg-[#374151] hover:bg-[#4B5563] text-white font-medium border border-[#4F46E5] rounded-lg px-4 py-2.5 text-sm sm:text-base whitespace-nowrap transition-colors duration-200 shadow-md"
            >
              View Analysis Factors
            </Link>
          </div>
        </PrivateWrapper>

        <div className="w-full mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">{industryName} Stocks</h1>
          <p className="text-[#E5E7EB] text-md mb-6">
            Explore {industryName} companies listed on US exchanges (NASDAQ, NYSE, AMEX). Access detailed financial reports, performance metrics, and AI-driven
            analysis to support your investment decisions.
          </p>
        </div>

        {/* Sub-Industry Stock Cards */}
        <h2 className="text-xl font-bold text-white mb-6">{industryKey} Categories</h2>
        {Object.keys(tickersBySubIndustry).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#E5E7EB] text-lg">No {industryName} stocks match the current filters.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Try adjusting your filter criteria to see more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 auto-rows-auto">
            {Object.entries(tickersBySubIndustry).map(([subIndustry, subIndustryTickers]) => (
              <div
                key={subIndustry}
                className="bg-block-bg-color rounded-lg shadow-lg border border-color overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300"
              >
                <div className="px-4 py-3 sm:px-6 border-b border-color flex items-center bg-gradient-to-r from-[#374151] to-[#2D3748]">
                  <h3 className="text-lg font-semibold heading-color">{getSubIndustryDisplayName(subIndustry)}</h3>
                  <p className="mt-1 text-sm text-white ml-2 bg-[#4F46E5] px-2 py-0.5 rounded-full">
                    {subIndustryTickers.length} {subIndustryTickers.length === 1 ? 'company' : 'companies'}
                  </p>
                </div>
                <ul className="divide-y divide-color flex-grow">
                  {subIndustryTickers.map((ticker) => (
                    <li
                      key={ticker.symbol}
                      className="px-2 py-2 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#2D3748] transition-colors duration-200"
                    >
                      <div className="min-w-0 w-full">
                        <div className="flex items-center justify-between">
                          <Link href={`/stocks/${ticker.exchange}/${ticker.symbol}`} className="w-full">
                            <div className="flex gap-2 items-center">
                              {(() => {
                                const score = ticker.cachedScore || 0;
                                let { textColorClass, bgColorClass, scoreLabel } = getScoreColorClasses(score);

                                return (
                                  <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                      <p className={`${textColorClass} px-1 rounded-md ${bgColorClass} bg-opacity-15 hover:bg-opacity-25 w-[50px] text-right`}>
                                        <span className="font-mono tabular-nums text-right text-xs w-[50px]">{score}/25</span>
                                      </p>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                      <Tooltip.Content className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm shadow-lg z-50" sideOffset={5}>
                                        {scoreLabel} Score: {score}/25
                                        <Tooltip.Arrow className="fill-gray-900" />
                                      </Tooltip.Content>
                                    </Tooltip.Portal>
                                  </Tooltip.Root>
                                );
                              })()}
                              <p className="whitespace-nowrap rounded-md px-2 py-.5 text-sm font-medium bg-[#4F46E5] text-white self-center shadow-sm">
                                {ticker.symbol}
                              </p>
                              <p className="text-sm font-medium text-break break-words text-white">{ticker.name}</p>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </PageWrapper>
    </Tooltip.Provider>
  );
}
