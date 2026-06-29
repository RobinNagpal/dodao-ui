import EtfAssetClassesIndex from '@/components/etfs/EtfAssetClassesIndex';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EMPTY_ETF_ASSET_CLASSES_INDEX, fetchEtfAssetClassesIndex } from '@/utils/etf-listing-fetchers';
import { assetClassesIndexRobots } from '@/utils/etf-listing-noindex';
import { generateEtfAssetClassesIndexBreadcrumbJsonLd, generateEtfAssetClassesIndexMetadata } from '@/utils/etf-metadata-generators';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = resolveEtfCountryParam(country, '/etfs/asset-classes');
  const data = await fetchEtfAssetClassesIndex(decoded);
  return { ...generateEtfAssetClassesIndexMetadata(decoded), ...assetClassesIndexRobots(data) };
}

export default async function CountryEtfsAssetClassesIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs/asset-classes');
  const data = (await fetchEtfAssetClassesIndex(decoded)) ?? EMPTY_ETF_ASSET_CLASSES_INDEX;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfAssetClassesIndexBreadcrumbJsonLd(decoded)) }} />
      <EtfAssetClassesIndex country={decoded} data={data} />
    </>
  );
}
