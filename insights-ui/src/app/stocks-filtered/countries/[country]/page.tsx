import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import CountryStocksPageLayout from '@/components/stocks/CountryStocksPageLayout';
import WithSuspenseCountryIndustriesGrid from '@/components/stocks/WithSuspenseCountryIndustriesGrid';
import { KoalaGainsSession } from '@/types/auth';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { fetchStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';

// Dynamic page for filtered results
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const params = await props.params;
  const countryName = decodeURIComponent(params.country);
  return generateCountryStocksMetadata(countryName);
}

type PageProps = {
  params: Promise<{ country: string }>;
  searchParams: Promise<SearchParams>;
};

export default async function CountryStocksFilteredPage({ params: paramsPromise, searchParams: searchParamsPromise }: PageProps) {
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

  // Create a data promise for Suspense
  const dataPromise = (async () => {
    return fetchStocksData(country, searchParams);
  })();

  return (
    <CountryStocksPageLayout
      breadcrumbs={breadcrumbs}
      title={`${countryName} Stocks by Industry`}
      description={`Explore ${countryName} stocks organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis.`}
      currentCountry={countryName}
      session={session}
      showAppliedFilters={true}
    >
      <WithSuspenseCountryIndustriesGrid dataPromise={dataPromise} countryName={countryName} />
    </CountryStocksPageLayout>
  );
}
