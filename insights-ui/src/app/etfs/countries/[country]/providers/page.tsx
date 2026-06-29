import EtfProvidersIndex from '@/components/etfs/EtfProvidersIndex';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EMPTY_ETF_PROVIDERS_INDEX, fetchEtfProvidersIndex } from '@/utils/etf-listing-fetchers';
import { providersIndexRobots } from '@/utils/etf-listing-noindex';
import { generateEtfProvidersIndexBreadcrumbJsonLd, generateEtfProvidersIndexMetadata } from '@/utils/etf-metadata-generators';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = resolveEtfCountryParam(country, '/etfs/providers');
  const data = await fetchEtfProvidersIndex(decoded);
  return { ...generateEtfProvidersIndexMetadata(decoded), ...providersIndexRobots(data) };
}

export default async function CountryEtfsProvidersIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs/providers');
  const data = (await fetchEtfProvidersIndex(decoded)) ?? EMPTY_ETF_PROVIDERS_INDEX;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfProvidersIndexBreadcrumbJsonLd(decoded)) }} />
      <EtfProvidersIndex country={decoded} data={data} />
    </>
  );
}
