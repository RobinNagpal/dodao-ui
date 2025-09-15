import StockActions from '@/app/stocks/StockActions';
import Filters from '@/components/public-equitiesv1/Filters';
import SubIndustryCard from '@/components/stocks/SubIndustryCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Metadata } from 'next';

// Import the FilteredTicker interface from the API route
interface FilteredTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  industryKey: string;
  subIndustryKey: string;
  industryName: string;
  subIndustryName: string;
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

  // Fetch a sample ticker to get the industry name
  let industryName = industryKey; // fallback to key
  try {
    const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1?country=US&industryKey=${encodeURIComponent(industryKey)}`);
    const tickers: any[] = await response.json();
    if (tickers.length > 0 && tickers[0].industryName) {
      industryName = tickers[0].industryName;
    }
  } catch (error) {
    console.log('Error fetching industry name for metadata:', error);
  }

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

  // We'll get the industry name from the API response
  let industryName = industryKey; // fallback to key

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
    const regularTickers: any[] = await response.json(); // This now returns TickerWithIndustryNames[]

    // Filter by main industry (already have industry names from API)
    tickers = regularTickers
      .filter((ticker) => ticker.industryKey === industryKey)
      .map((ticker) => ({
        id: ticker.id,
        name: ticker.name,
        symbol: ticker.symbol,
        exchange: ticker.exchange,
        industryKey: ticker.industryKey,
        subIndustryKey: ticker.subIndustryKey,
        industryName: ticker.industryName || ticker.industryKey,
        subIndustryName: ticker.subIndustryName || ticker.subIndustryKey,
        websiteUrl: ticker.websiteUrl,
        summary: ticker.summary,
        cachedScore: ticker.cachedScore,
        spaceId: ticker.spaceId,
        categoryScores: {}, // Empty for unfiltered case
        totalScore: 0, // Will be calculated if needed
      }));
  }

  // Extract industry name from the first ticker if available
  if (tickers.length > 0 && tickers[0].industryName) {
    industryName = tickers[0].industryName;
  }

  // Now create breadcrumbs with the correct industry name
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
    tickersBySubIndustry[subIndustry].sort();
  });

  return (
    <Tooltip.Provider delayDuration={300}>
      <PageWrapper>
        <div className="overflow-x-auto">
          <Breadcrumbs
            breadcrumbs={breadcrumbs}
            rightButton={
              <div className="flex">
                <Filters showOnlyButton={true} />
                <StockActions />
              </div>
            }
          />
        </div>
        <Filters showOnlyAppliedFilters={true} />

        <div className="w-full mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">{industryName} Stocks</h1>
          <p className="text-[#E5E7EB] text-md mb-6">
            Explore {industryName} companies listed on US exchanges (NASDAQ, NYSE, AMEX). Access detailed financial reports, performance metrics, and AI-driven
            analysis to support your investment decisions.
          </p>
        </div>

        {/* Sub-Industry Stock Cards */}
        <h2 className="text-xl font-bold text-white mb-5">{industryKey} Categories</h2>
        {Object.keys(tickersBySubIndustry).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#E5E7EB] text-lg">No {industryName} stocks match the current filters.</p>
            <p className="text-[#E5E7EB] text-sm mt-2">Try adjusting your filter criteria to see more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 auto-rows-auto">
            {Object.entries(tickersBySubIndustry).map(([subIndustry, subIndustryTickers]) => {
              // Get subIndustryName from the first ticker in this sub-industry
              const subIndustryName = subIndustryTickers[0]?.subIndustryName || subIndustry;
              return (
                <SubIndustryCard
                  key={subIndustry}
                  subIndustry={subIndustry}
                  subIndustryName={subIndustryName}
                  tickers={subIndustryTickers}
                  total={subIndustryTickers.length}
                />
              );
            })}
          </div>
        )}
      </PageWrapper>
    </Tooltip.Provider>
  );
}
