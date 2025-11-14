import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import CountryIndustriesGrid from '@/components/stocks/CountryIndustriesGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { fetchStocksData } from '@/utils/stocks-data-utils';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const params = await props.params;
  const countryName = decodeURIComponent(params.country);
  return generateCountryStocksMetadata(countryName);
}

type PageProps = {
  params: Promise<{ country: string }>;
};

export default async function CountryStocksPage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise;
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;

  const countryName = decodeURIComponent(params.country);
  const country = countryName as SupportedCountries;

  // Fetch data using the cached function (no filters on static pages)
  const data = await fetchStocksData(country, {});

  return (
    <IndustryWithStocksPageLayout
      title={`${countryName} Stocks by Industry`}
      description={`Explore ${countryName} stocks organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis.`}
      currentCountry={countryName}
      session={session}
    >
      <CountryIndustriesGrid data={data} countryName={countryName} />
    </IndustryWithStocksPageLayout>
  );
}
