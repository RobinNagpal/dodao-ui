import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import EtfProvidersIndex from '@/components/etfs/EtfProvidersIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfProvidersIndexTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { generateEtfProvidersIndexBreadcrumbJsonLd, generateEtfProvidersIndexMetadata } from '@/utils/etf-metadata-generators';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string }>;
};

const EMPTY_PROVIDERS_INDEX: EtfProvidersIndexResponse = { providers: [], values: {}, counts: {} };

// Fail-soft so the first preview/prod build after introducing the listings
// API routes can still prerender. The 2-week tag + ISR repopulates the page
// on the first real request once the new route is live in the target env.
async function fetchProvidersIndex(country: EtfSupportedCountry): Promise<EtfProvidersIndexResponse> {
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

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = resolveEtfCountryParam(country, '/etfs/providers');
  return generateEtfProvidersIndexMetadata(decoded);
}

export default async function CountryEtfsProvidersIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs/providers');
  const data = await fetchProvidersIndex(decoded);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfProvidersIndexBreadcrumbJsonLd(decoded)) }} />
      <EtfProvidersIndex country={decoded} data={data} />
    </>
  );
}
