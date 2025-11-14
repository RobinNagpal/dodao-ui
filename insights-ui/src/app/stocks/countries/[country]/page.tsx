import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import StocksGridPageActions from '@/app/stocks/StocksGridPageActions';
import AppliedFilterChips from '@/components/stocks/filters/AppliedFilterChips';
import { hasFiltersApplied } from '@/components/stocks/filters/filter-utils';
import FiltersButton from '@/components/stocks/filters/FiltersButton';
import { FilterLoadingFallback } from '@/components/stocks/SubIndustryCardSkeleton';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import CountryIndustriesGrid from '@/components/stocks/CountryIndustriesGrid';
import { KoalaGainsSession } from '@/types/auth';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import * as Tooltip from '@radix-ui/react-tooltip';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';
import type { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const params = await props.params;
  const countryName = decodeURIComponent(params.country);

  return {
    title: `${countryName} Stocks by Industry | KoalaGains`,
    description: `Discover ${countryName} stocks grouped by industry and sub-industry. See top tickers with detailed reports and AI insights.`,
    keywords: [
      `${countryName} stocks`,
      'stocks by industry',
      'stock analysis',
      'AI stock insights',
      'investment research',
      'top performing stocks',
      'KoalaGains',
    ],
    openGraph: {
      title: `${countryName} Stocks by Industry | KoalaGains`,
      description: `Discover ${countryName} stocks grouped by industry and sub-industry. See top tickers with detailed reports and AI insights.`,
      url: `https://koalagains.com/stocks/countries/${encodeURIComponent(countryName)}`,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${countryName} Stocks by Industry | KoalaGains`,
      description: `Discover ${countryName} stocks grouped by industry and sub-industry. See top tickers with detailed reports and AI insights.`,
    },
    alternates: {
      canonical: `https://koalagains.com/stocks/countries/${encodeURIComponent(countryName)}`,
    },
  };
}

type PageProps = {
  params: Promise<{ country: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function CountryStocksPage({ params: paramsPromise, searchParams: searchParamsPromise }: PageProps) {
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;

  const countryName = decodeURIComponent(params.country);
  const country = countryName as SupportedCountries;

  // Create breadcrumbs with dynamic country name
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: `${countryName} Stocks`,
      href: `/stocks/countries/${encodeURIComponent(countryName)}`,
      current: true,
    },
  ];

  const filters = hasFiltersApplied(searchParams);

  // Create a data promise for Suspense when filters are applied
  const dataPromise = filters
    ? (async () => {
        return fetchStocksData(country, searchParams);
      })()
    : null;

  // Fetch data using the cached function when no filters are applied
  const data = !filters ? await fetchStocksData(country, searchParams) : null;

  return (
    <Tooltip.Provider delayDuration={300}>
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
            <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">{countryName} Stocks by Industry</h1>
            <CountryAlternatives currentCountry={countryName} className="flex-shrink-0" />
          </div>
          <p className="text-[#E5E7EB] text-md mb-4">
            Explore {countryName} stocks organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven
            analysis.
          </p>
        </div>

        {filters ? (
          // Use Suspense when filters are applied
          <Suspense fallback={<FilterLoadingFallback />}>
            <CountryIndustriesGrid dataPromise={dataPromise} countryName={countryName} />
          </Suspense>
        ) : (
          // Use cached data when no filters are applied
          <CountryIndustriesGrid data={data} countryName={countryName} />
        )}
      </PageWrapper>
    </Tooltip.Provider>
  );
}
