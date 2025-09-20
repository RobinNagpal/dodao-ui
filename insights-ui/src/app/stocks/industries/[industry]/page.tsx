import StockActions from '@/app/stocks/StockActions';
import Filters from '@/components/public-equitiesv1/Filters';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import SubIndustryCard from '@/components/stocks/SubIndustryCard';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { FilteredTicker, TickerWithIndustryNames } from '@/types/ticker-typesv1';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry } from '@prisma/client';
import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ industry: string }> }): Promise<Metadata> {
  const params = await props.params;
  const industryKey = decodeURIComponent(params.industry);

  // Fetch industry data to get name and summary
  let industryName = industryKey; // fallback to key
  let industrySummary = `Browse ${industryKey} stocks and sub-industries across US exchanges. View reports, metrics, and AI-driven insights to guide your investments.`; // fallback description

  try {
    const response = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`);
    const industryData: TickerV1Industry = await response.json();
    industryName = industryData.name;
    industrySummary = industryData.summary;
  } catch (error) {
    console.log('Error fetching industry data for metadata:', error);
  }

  const base = `https://koalagains.com/stocks/industry/${industryKey}`;
  return {
    title: `${industryName} Stocks | KoalaGains`,
    description: industrySummary,
    alternates: {
      canonical: base,
    },
    keywords: [
      `${industryName} stocks`,
      `${industryName} companies`,
      `${industryName} sub-industries`,
      'US stocks',
      'NASDAQ stocks',
      'NYSE stocks',
      'AMEX stocks',
      'KoalaGains',
      'Stock analysis',
      'Financial reports',
      'Investment research',
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
  };
}

// Add viewport meta tag if not already in your _document.js or layout component
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

type CardSpec = {
  key: string;
  subIndustry: string;
  subIndustryName: string;
  tickers: any[];
  total: number;
  estH: number; // estimated height in px
};

// tune these to your actual CSS
const CARD_HEADER_PX = 41; // header, padding, badge, etc.
const ROW_PX = 36; // per <li> row (StockTickerItem + paddings)

function estimateCardHeight(rowCount: number) {
  return CARD_HEADER_PX + rowCount * ROW_PX;
}

/** First row: seed one per column (preserve order).
 *  Then always place the next card into the column with the minimum height. */
function packIntoColumns<T extends { estH: number }>(items: T[], cols: number): T[][] {
  const buckets: { items: T[]; h: number }[] = Array.from({ length: cols }, () => ({ items: [], h: 0 }));

  items.forEach((item, i) => {
    if (i < cols) {
      buckets[i].items.push(item);
      buckets[i].h += item.estH;
    } else {
      let min = 0;
      for (let c = 1; c < cols; c++) if (buckets[c].h < buckets[min].h) min = c;
      buckets[min].items.push(item);
      buckets[min].h += item.estH;
    }
  });

  return buckets.map((b) => b.items);
}

export default async function IndustryStocksPage(props: {
  params: Promise<{ industry: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const industryKey = decodeURIComponent(params.industry);

  const industry = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`);
  const industryData: TickerV1Industry = await industry.json();

  // We'll get the industry name from the API response
  const industryName = industryData.name; // fallback to key

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
    const regularTickers: TickerWithIndustryNames[] = await response.json(); // This now returns TickerWithIndustryNames[]

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
          <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">{industryName} Stocks</h1>
          <CountryAlternatives currentCountry="US" industryKey={industryKey} className="flex-shrink-0" />
        </div>
        <p className="text-[#E5E7EB] text-md mb-4">
          Explore {industryName} companies listed on US exchanges (NASDAQ, NYSE, AMEX). {industryData.summary}
        </p>
      </div>
      {Object.keys(tickersBySubIndustry).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#E5E7EB] text-lg">No {industryName} stocks match the current filters.</p>
          <p className="text-[#E5E7EB] text-sm mt-2">Try adjusting your filter criteria to see more results.</p>
        </div>
      ) : (
        (() => {
          // Build card specs with estimated heights
          const cards: CardSpec[] = Object.entries(tickersBySubIndustry).map(([subIndustry, subIndustryTickers]) => {
            const subIndustryName = subIndustryTickers[0]?.subIndustryName || subIndustry;
            const total = subIndustryTickers.length;
            return {
              key: subIndustry,
              subIndustry,
              subIndustryName,
              tickers: subIndustryTickers,
              total,
              estH: estimateCardHeight(total),
            };
          });

          const cols1 = [cards];
          const cols2 = packIntoColumns(cards, 2);
          const cols3 = packIntoColumns(cards, 3);

          const renderCard = (c: CardSpec) => (
            <SubIndustryCard key={c.key} subIndustry={c.subIndustry} subIndustryName={c.subIndustryName} tickers={c.tickers} total={c.total} />
          );

          return (
            <>
              {/* Mobile: 1 column */}
              <div className="grid grid-cols-1 gap-6 mb-10 md:hidden">
                <div className="flex flex-col gap-6">{cols1[0].map(renderCard)}</div>
              </div>

              {/* Tablet: 2 columns */}
              <div className="hidden md:grid lg:hidden grid-cols-2 gap-6 mb-10">
                {cols2.map((col, i) => (
                  <div key={`md-col-${i}`} className="flex flex-col gap-6">
                    {col.map(renderCard)}
                  </div>
                ))}
              </div>

              {/* Desktop: 3 columns */}
              <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {cols3.map((col, i) => (
                  <div key={`lg-col-${i}`} className="flex flex-col gap-6">
                    {col.map(renderCard)}
                  </div>
                ))}
              </div>
            </>
          );
        })()
      )}
    </PageWrapper>
  );
}
