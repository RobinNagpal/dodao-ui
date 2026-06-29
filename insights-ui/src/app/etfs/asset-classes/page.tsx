import EtfAssetClassesIndex from '@/components/etfs/EtfAssetClassesIndex';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { EMPTY_ETF_ASSET_CLASSES_INDEX, fetchEtfAssetClassesIndex } from '@/utils/etf-listing-fetchers';
import { assetClassesIndexRobots } from '@/utils/etf-listing-noindex';
import { generateEtfAssetClassesIndexBreadcrumbJsonLd, generateEtfAssetClassesIndexMetadata } from '@/utils/etf-metadata-generators';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchEtfAssetClassesIndex(SupportedCountries.US);
  return { ...generateEtfAssetClassesIndexMetadata(SupportedCountries.US), ...assetClassesIndexRobots(data) };
}

export default async function EtfsAssetClassesIndexPage() {
  const data = (await fetchEtfAssetClassesIndex(SupportedCountries.US)) ?? EMPTY_ETF_ASSET_CLASSES_INDEX;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfAssetClassesIndexBreadcrumbJsonLd(SupportedCountries.US)) }}
      />
      <EtfAssetClassesIndex country={SupportedCountries.US} data={data} />
    </>
  );
}
