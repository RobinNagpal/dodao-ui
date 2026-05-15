import type { EtfProvidersIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/providers-index/route';
import EtfProvidersIndex from '@/components/etfs/EtfProvidersIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfProvidersIndexTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = TWO_WEEKS_IN_SECONDS;

type PageProps = {
  params: Promise<{ country: string }>;
};

async function fetchProvidersIndex(country: EtfSupportedCountry): Promise<EtfProvidersIndexResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/providers-index?country=${encodeURIComponent(country)}`;
  const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfProvidersIndexTag(country)] } });
  if (!res.ok) {
    throw new Error(`fetchProvidersIndex failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfProvidersIndexResponse;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = decodeURIComponent(country);
  return {
    title: `${decoded} ETFs by Provider | KoalaGains`,
    description: `Browse ${decoded} ETFs grouped by issuer. Each card highlights the top-rated ETFs from that provider.`,
  };
}

export default async function CountryEtfsProvidersIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs/providers');
  const data = await fetchProvidersIndex(decoded);
  return <EtfProvidersIndex country={decoded} data={data} />;
}
