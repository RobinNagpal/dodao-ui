import EtfProvidersIndex from '@/components/etfs/EtfProvidersIndex';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { EMPTY_ETF_PROVIDERS_INDEX, fetchEtfProvidersIndex } from '@/utils/etf-listing-fetchers';
import { providersIndexRobots } from '@/utils/etf-listing-noindex';
import { generateEtfProvidersIndexBreadcrumbJsonLd, generateEtfProvidersIndexMetadata } from '@/utils/etf-metadata-generators';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchEtfProvidersIndex(SupportedCountries.US);
  return { ...generateEtfProvidersIndexMetadata(SupportedCountries.US), ...providersIndexRobots(data) };
}

export default async function EtfsProvidersIndexPage() {
  const data = (await fetchEtfProvidersIndex(SupportedCountries.US)) ?? EMPTY_ETF_PROVIDERS_INDEX;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfProvidersIndexBreadcrumbJsonLd(SupportedCountries.US)) }}
      />
      <EtfProvidersIndex country={SupportedCountries.US} data={data} />
    </>
  );
}
