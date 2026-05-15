import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import EtfAssetClassesIndex from '@/components/etfs/EtfAssetClassesIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfAssetClassesIndexTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const revalidate = TWO_WEEKS_IN_SECONDS;

export const metadata: Metadata = {
  title: 'US ETFs by Asset Class | KoalaGains',
  description:
    'Browse US ETFs by asset class — Equity, Fixed Income, Commodity, Alternatives, and more. Each card highlights the top-rated ETFs in that class.',
};

async function fetchAssetClassesIndex(country: SupportedCountries): Promise<EtfAssetClassesIndexResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/asset-classes-index?country=${encodeURIComponent(country)}`;
  const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfAssetClassesIndexTag(country)] } });
  if (!res.ok) {
    throw new Error(`fetchAssetClassesIndex failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfAssetClassesIndexResponse;
}

export default async function EtfsAssetClassesIndexPage() {
  const data = await fetchAssetClassesIndex(SupportedCountries.US);
  return <EtfAssetClassesIndex country={SupportedCountries.US} data={data} />;
}
