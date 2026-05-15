import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import EtfProvidersIndex from '@/components/etfs/EtfProvidersIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfProvidersIndexTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const revalidate = 1209600; // 14 days — must be a literal for Next.js segment config

export const metadata: Metadata = {
  title: 'US ETFs by Provider | KoalaGains',
  description: 'Browse US ETFs grouped by issuer. Each card highlights the top-rated ETFs from that provider.',
};

async function fetchProvidersIndex(country: SupportedCountries): Promise<EtfProvidersIndexResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/providers-index?country=${encodeURIComponent(country)}`;
  const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfProvidersIndexTag(country)] } });
  if (!res.ok) {
    throw new Error(`fetchProvidersIndex failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfProvidersIndexResponse;
}

export default async function EtfsProvidersIndexPage() {
  const data = await fetchProvidersIndex(SupportedCountries.US);
  return <EtfProvidersIndex country={SupportedCountries.US} data={data} />;
}
