import StockActions from '@/app/stocks/StockActions';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import Filters from '@/components/public-equitiesv1/Filters';
import SubIndustryCard from '@/components/stocks/SubIndustryCard';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { FilteredTicker, TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import type { Metadata } from 'next';
import Link from 'next/link';

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

export default async function StocksPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  // Check if any filters are applied (including search)
  const hasFilters = Object.keys(resolvedSearchParams).some((key) => key.includes('Threshold')) || resolvedSearchParams.search;

  let tickers: TickerWithIndustryNames[] | FilteredTicker[] = [];

  if (hasFilters) {
    // Build URL with filter params for the filtered API
    const urlParams = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
      if (value && key !== 'page') urlParams.set(key, value);
    });

    // Add country filter
    urlParams.set('country', 'US');

    const apiUrl = `${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1-filtered?${urlParams.toString()}`;
    const response = await fetch(apiUrl);
    try {
      tickers = await response.json();
    } catch (e) {
      console.log('Error fetching filtered tickers: ', e);
    }
  } else {
    // Use regular tickers API when no filters are applied
    const response = await fetch(`${getBaseUrl() || 'https://koalagains.com'}/api/${KoalaGainsSpaceId}/tickers-v1?country=US`, { cache: 'no-cache' });
    try {
      tickers = await response.json();
    } catch (e) {
      console.log('Error fetching tickers: ', e);
    }
  }

  if (!tickers) {
    return (
      <PageWrapper className="px-4 sm:px-6">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <div className="text-center py-12">
          <p className="text-[#E5E7EB] text-lg">No US stocks found.</p>
        </div>
      </PageWrapper>
    );
  }

  // Group tickers by main industry first, then by sub-industry
  const tickersByMainIndustry: Record<string, Record<string, { tickers: any[]; total: number }>> = {};

  tickers.forEach((ticker) => {
    const mainIndustry = ticker.industryKey || 'Other';
    const subIndustry = ticker.subIndustryKey || 'Other';

    if (!tickersByMainIndustry[mainIndustry]) {
      tickersByMainIndustry[mainIndustry] = {};
    }

    if (!tickersByMainIndustry[mainIndustry][subIndustry]) {
      tickersByMainIndustry[mainIndustry][subIndustry] = { tickers: [], total: 0 };
    }

    tickersByMainIndustry[mainIndustry][subIndustry].tickers.push(ticker);
    tickersByMainIndustry[mainIndustry][subIndustry].total++;
  });

  // Sort tickers by score and take top 4 for display in each sub-industry
  Object.keys(tickersByMainIndustry).forEach((mainIndustry) => {
    Object.keys(tickersByMainIndustry[mainIndustry]).forEach((subIndustry) => {
      tickersByMainIndustry[mainIndustry][subIndustry].tickers = tickersByMainIndustry[mainIndustry][subIndustry].tickers
        .sort((a, b) => b.cachedScore - a.cachedScore)
        .slice(0, 4);
    });
  });

  return (
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">US Stocks by Industry</h1>
            <CountryAlternatives currentCountry="US" className="flex-shrink-0" />
          </div>
          <p className="text-[#E5E7EB] text-md mb-4">
          Explore US stocks across NASDAQ, NYSE, and AMEX exchanges organized by industry. View top-performing companies in each sector with detailed financial
          reports and AI-driven analysis.
        </p>
      </div>

      {/* Main Industries */}
      {Object.keys(tickersByMainIndustry).length === 0 ? (
        <div className="text-center py-12">
          {hasFilters ? (
            <>
              <p className="text-[#E5E7EB] text-lg">No US stocks match the current filters.</p>
              <p className="text-[#E5E7EB] text-sm mt-2">Try adjusting your filter criteria to see more results.</p>
            </>
          ) : (
            <>
              <p className="text-[#E5E7EB] text-lg">No US stocks found.</p>
              <p className="text-[#E5E7EB] text-sm mt-2">Please try again later.</p>
            </>
          )}
        </div>
      ) : (
        Object.entries(tickersByMainIndustry).map(([mainIndustry, subIndustries]) => {
          const totalCompaniesInIndustry = Object.values(subIndustries).reduce((sum, sub) => sum + sub.total, 0);
          // Use the industryName from the first ticker in this industry, fallback to industryKey
          const sampleTicker = Object.values(subIndustries)[0]?.tickers[0];
          const industryDisplayName = sampleTicker?.industryName || sampleTicker?.industryKey || mainIndustry;

          return (
            <div key={mainIndustry} className="mb-12">
              {/* Industry Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">{industryDisplayName}</h2>
                <Link
                    href={`/stocks/industries/${encodeURIComponent(mainIndustry)}`}
                  className="text-md bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-medium px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center"
                >
                  View All {totalCompaniesInIndustry} Companies
                  <span className="ml-1">→</span>
                </Link>
              </div>

              {/* Sub-Industry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {Object.entries(subIndustries).map(([subIndustry, { tickers: subIndustryTickers, total }]) => {
                  // Get subIndustryName from the first ticker in this sub-industry
                  const subIndustryName = subIndustryTickers[0]?.subIndustryName || subIndustry;
                  return (
                    <SubIndustryCard key={subIndustry} subIndustry={subIndustry} subIndustryName={subIndustryName} tickers={subIndustryTickers} total={total} />
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </PageWrapper>
  );
}
