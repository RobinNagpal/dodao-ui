import type { EtfGroupsIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/groups-index/route';
import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfGroupsIndexTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { generateEtfListingMetadata, generateEtfListingJsonLd } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';

export const dynamic = 'force-static';
export const revalidate = 1209600; // 14 days — must be a literal for Next.js segment config

export const metadata = generateEtfListingMetadata();

async function fetchGroupsIndex(country: SupportedCountries): Promise<EtfGroupsIndexResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/groups-index?country=${encodeURIComponent(country)}`;
  const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfGroupsIndexTag(country)] } });
  if (!res.ok) {
    throw new Error(`fetchGroupsIndex failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfGroupsIndexResponse;
}

export default async function EtfsPage() {
  const data = await fetchGroupsIndex(SupportedCountries.US);
  return (
    <EtfGroupsIndex
      country={SupportedCountries.US}
      data={data}
      title="US ETFs"
      headSlot={<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfListingJsonLd()) }} />}
    />
  );
}
