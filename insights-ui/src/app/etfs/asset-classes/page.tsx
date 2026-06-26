import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import EtfAssetClassesIndex from '@/components/etfs/EtfAssetClassesIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfAssetClassesIndexTag } from '@/utils/etf-cache-utils';
import { fetchEtfListingsIndex } from '@/utils/etf-listing-visibility';
import { generateEtfAssetClassesIndexBreadcrumbJsonLd, generateEtfAssetClassesIndexMetadata } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

export const dynamic = 'force-dynamic';

export const metadata = generateEtfAssetClassesIndexMetadata(SupportedCountries.US);

const EMPTY_ASSET_CLASSES: EtfAssetClassesIndexResponse = { values: {}, counts: {} };

// Fail-soft so the first preview/prod build after introducing the listings
// API routes can still prerender. The 1-week tag + ISR repopulates the page
// on the first real request once the new route is live in the target env.
async function fetchAssetClassesIndex(country: SupportedCountries): Promise<EtfAssetClassesIndexResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/asset-classes-index?country=${encodeURIComponent(country)}`;
  try {
    const res = await fetchEtfListingsIndex(url, getEtfAssetClassesIndexTag(country));
    if (!res.ok) {
      console.error(`fetchAssetClassesIndex failed (${res.status}): ${url}`);
      return EMPTY_ASSET_CLASSES;
    }
    return (await res.json()) as EtfAssetClassesIndexResponse;
  } catch (e) {
    console.error('fetchAssetClassesIndex error:', e);
    return EMPTY_ASSET_CLASSES;
  }
}

export default async function EtfsAssetClassesIndexPage() {
  const data = await fetchAssetClassesIndex(SupportedCountries.US);
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
