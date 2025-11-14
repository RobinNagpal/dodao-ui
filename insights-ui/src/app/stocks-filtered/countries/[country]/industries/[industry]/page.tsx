import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import WithSuspenseIndustryStocksGrid from '@/components/stocks/WithSuspenseIndustryStocksGrid';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { fetchIndustryStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import { generateCountryIndustryStocksMetadata, commonViewport } from '@/utils/metadata-generators';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { TickerV1Industry } from '@prisma/client';

// Dynamic page for filtered results
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ country: string; industry: string }> }): Promise<Metadata> {
  const params = await props.params;
  const countryName = decodeURIComponent(params.country);
  const industryKey = decodeURIComponent(params.industry);
  return generateCountryIndustryStocksMetadata(countryName, industryKey);
}

// Add viewport meta tag if not already in your _document.js or layout component
export const viewport = commonViewport;

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

  return (
    <IndustryWithStocksPageLayout
      title={`${industryData?.name || industryKey} Stocks in ${countryName}`}
      description={`Explore ${industryData?.name || industryKey} companies in ${countryName}. ${
        industryData?.summary || 'View detailed reports and AI-driven insights.'
      }`}
      currentCountry={countryName}
      industryKey={industryKey}
      industryName={industryData?.name}
      session={session}
      showAppliedFilters={true}
    >
      <WithSuspenseIndustryStocksGrid dataPromise={dataPromise} industryName={industryData?.name || industryKey} />
    </IndustryWithStocksPageLayout>
  );
}
