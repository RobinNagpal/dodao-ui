import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfSearchParams } from '@/utils/etf-filter-utils';
import { isEtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string }>;
  searchParams: Promise<EtfSearchParams>;
};

export async function generateMetadata(props: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = decodeURIComponent(country);
  return {
    title: `${decoded} ETFs | KoalaGains`,
    description: `Browse ${decoded} exchange-traded funds with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`,
  };
}

export default async function CountryEtfsPage({ params, searchParams: searchParamsPromise }: PageProps) {
  const { country } = await params;
  const decoded = decodeURIComponent(country);
  if (decoded === SupportedCountries.US) redirect('/etfs');
  if (!isEtfSupportedCountry(decoded)) notFound();

  const searchParams = await searchParamsPromise;
  const dataPromise = fetchEtfListingData(searchParams, decoded);

  return (
    <EtfPageLayout
      title={`${decoded} ETFs`}
      description={`Explore ${decoded} exchange-traded funds with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights.`}
      currentCountry={decoded}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}
