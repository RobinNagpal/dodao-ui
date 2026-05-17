import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import EtfProvidersIndex from '@/components/etfs/EtfProvidersIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getEtfProvidersIndexTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'US ETFs by Provider | KoalaGains',
  description: 'Browse US ETFs grouped by issuer. Each card highlights the top-rated ETFs from that provider.',
};

const EMPTY_PROVIDERS_INDEX: EtfProvidersIndexResponse = { providers: [], values: {}, counts: {} };

// Fail-soft so the first preview/prod build after introducing the listings
// API routes can still prerender. The 2-week tag + ISR repopulates the page
// on the first real request once the new route is live in the target env.
async function fetchProvidersIndex(country: SupportedCountries): Promise<EtfProvidersIndexResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/providers-index?country=${encodeURIComponent(country)}`;
  try {
    const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfProvidersIndexTag(country)] } });
    if (!res.ok) {
      console.error(`fetchProvidersIndex failed (${res.status}): ${url}`);
      return EMPTY_PROVIDERS_INDEX;
    }
    return (await res.json()) as EtfProvidersIndexResponse;
  } catch (e) {
    console.error('fetchProvidersIndex error:', e);
    return EMPTY_PROVIDERS_INDEX;
  }
}

export default async function EtfsProvidersIndexPage() {
  const data = await fetchProvidersIndex(SupportedCountries.US);
  return <EtfProvidersIndex country={SupportedCountries.US} data={data} />;
}
