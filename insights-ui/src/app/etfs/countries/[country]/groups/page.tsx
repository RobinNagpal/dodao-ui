import type { EtfGroupsIndexResponse } from '@/app/api/[spaceId]/etfs-v1/listings/groups-index/route';
import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getEtfGroupsIndexTag, TWO_WEEKS_IN_SECONDS } from '@/utils/etf-cache-utils';
import { etfBrowsePath, resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EtfSupportedCountry } from '@/utils/etfCountryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import type { Metadata } from 'next';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = TWO_WEEKS_IN_SECONDS;

type PageProps = {
  params: Promise<{ country: string }>;
};

async function fetchGroupsIndex(country: EtfSupportedCountry): Promise<EtfGroupsIndexResponse> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/etfs-v1/listings/groups-index?country=${encodeURIComponent(country)}`;
  const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getEtfGroupsIndexTag(country)] } });
  if (!res.ok) {
    throw new Error(`fetchGroupsIndex failed (${res.status}): ${url}`);
  }
  return (await res.json()) as EtfGroupsIndexResponse;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = decodeURIComponent(country);
  return {
    title: `${decoded} ETFs by Group | KoalaGains`,
    description: `Browse ${decoded} ETFs organized by analysis group. Each group highlights top-rated ETFs by report score and AUM.`,
  };
}

export default async function CountryEtfsGroupsIndexPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs');
  const data = await fetchGroupsIndex(decoded);
  return (
    <EtfGroupsIndex
      country={decoded}
      data={data}
      switcherSection="groups"
      extraBreadcrumbs={[{ name: 'Groups', href: etfBrowsePath(decoded, 'groups'), current: true }]}
    />
  );
}
