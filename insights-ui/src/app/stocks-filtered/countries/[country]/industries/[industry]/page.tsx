import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import StocksGridPageActions from '@/app/stocks/StocksGridPageActions';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import AppliedFilterChips from '@/components/stocks/filters/AppliedFilterChips';
import { hasFiltersApplied } from '@/utils/ticker-filter-utils';
import FiltersButton from '@/components/stocks/filters/FiltersButton';
import IndustryStocksGrid from '@/components/stocks/IndustryStocksGrid';
import { FilterLoadingFallback } from '@/components/stocks/SubIndustryCardSkeleton';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchIndustryStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry } from '@prisma/client';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { Suspense } from 'react';

// Dynamic page for filtered results
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ country: string; industry: string }> }): Promise<Metadata> {
  const params = await props.params;
  const countryName = decodeURIComponent(params.country);
  const industryKey = decodeURIComponent(params.industry);

  // Fetch industry data to get name and summary
  let industryName = industryKey; // fallback to key
  let industrySummary = `Browse ${industryKey} stocks and sub-industries across ${countryName} exchanges. View reports, metrics, and AI-driven insights to guide your investments.`; // fallback description

  try {
    const response = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`);
    const industryData: TickerV1Industry = await response.json();
    industryName = industryData.name;
    industrySummary = industryData.summary;
  } catch (error) {
    console.log('Error fetching industry data for metadata:', error);
  }

  const base = `https://koalagains.com/stocks/countries/${encodeURIComponent(countryName)}/industries/${industryKey}`;
  return {
    title: `${industryName} Stocks in ${countryName} | KoalaGains`,
    description: industrySummary,
    alternates: {
      canonical: base,
    },
    keywords: [
      `${industryName} stocks`,
      `${industryName} companies`,
      `${industryName} sub-industries`,
      `${countryName} stocks`,
      'KoalaGains',
      'Stock analysis',
      'Financial reports',
      'Investment research',
    ],
    openGraph: {
      title: `${industryName} Stocks in ${countryName} | KoalaGains`,
      description: industrySummary,
      url: base,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${industryName} Stocks in ${countryName} | KoalaGains`,
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

type PageProps = {
  params: Promise<{ country: string; industry: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function CountryIndustryStocksFilteredPage({ params, searchParams }: PageProps) {
  // Resolve params now because we need the key for filtering inside the data promise
  const resolvedParams = await params;
  const countryName = decodeURIComponent(resolvedParams.country);
  const industryKey = decodeURIComponent(resolvedParams.industry);
  const resolvedSearchParams = await searchParams;
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;

  // Convert countryName to SupportedCountries type
  const country = countryName as SupportedCountries;

  // Create a data promise for Suspense
  const dataPromise = (async () => {
    return fetchIndustryStocksData(industryKey, country, resolvedSearchParams);
  })();

  // Try to get industry data for metadata and display
  let industryData: TickerV1Industry | null = null;
  try {
    const res = await fetch(`${getBaseUrl()}/api/industries/${industryKey}`, { next: { revalidate: 3600 } });
    industryData = (await res.json()) as TickerV1Industry;
  } catch {
    // fallback will be handled below
  }

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: `${countryName} Stocks`, href: `/stocks/countries/${encodeURIComponent(countryName)}`, current: false },
    {
      name: industryData?.name || industryKey,
      href: `/stocks/countries/${encodeURIComponent(countryName)}/industries/${encodeURIComponent(industryKey)}`,
      current: true,
    },
  ];

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

      <AppliedFilterChips showClearAll={true} />

      <div className="w-full mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
          <h1 className="text-2xl font-bold text-white mb-2 sm:mb-0">
            {industryData?.name || industryKey} Stocks in {countryName}
          </h1>
          <CountryAlternatives currentCountry={countryName} industryKey={industryKey} className="flex-shrink-0" />
        </div>
        <p className="text-[#E5E7EB] text-md mb-4">
          Explore {industryData?.name || industryKey} companies in {countryName}. {industryData?.summary || 'View detailed reports and AI-driven insights.'}
        </p>
      </div>

      <Suspense fallback={<FilterLoadingFallback />}>
        <IndustryStocksGrid dataPromise={dataPromise} industryName={industryData?.name || industryKey} />
      </Suspense>
    </PageWrapper>
  );
}
