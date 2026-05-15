import type { EtfAssetClassesIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/asset-classes-index/route';
import EtfAssetClassesIndex from '@/components/etfs/EtfAssetClassesIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfAssetClassesIndexTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
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

async function fetchAssetClassesIndex(country: EtfSupportedCountry): Promise<EtfAssetClassesIndexResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/asset-classes-index?country=${encodeURIComponent(country)}`;
  const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfAssetClassesIndexTag(country)] } });
  if (!res.ok) {
    throw new Error(`fetchAssetClassesIndex failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfAssetClassesIndexResponse;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = decodeURIComponent(country);
  return {
    title: `${decoded} ETFs by Asset Class | KoalaGains`,
    description: `Browse ${decoded} ETFs by asset class — Equity, Fixed Income, Commodity, Alternatives, and more. Each card highlights the top-rated ETFs in that class.`,
  };
}

export default async function CountryEtfsAssetClassesIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs/asset-classes');
  const data = await fetchAssetClassesIndex(decoded);
  return <EtfAssetClassesIndex country={decoded} data={data} />;
}
