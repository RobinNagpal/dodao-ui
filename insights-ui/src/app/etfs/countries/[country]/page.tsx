import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
import { resolveEtfCountryParam } from '@/utils/etf-country-route-utils';
import { EMPTY_ETF_GROUPS_INDEX, fetchEtfGroupsIndex } from '@/utils/etf-listing-fetchers';
import { groupsIndexRobots } from '@/utils/etf-listing-noindex';
import { generateEtfCountryListingBreadcrumbJsonLd, generateEtfCountryListingMetadata } from '@/utils/etf-metadata-generators';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ country: string }>;
};

export async function generateMetadata(props: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await props.params;
  const decoded = resolveEtfCountryParam(country, '/etfs');
  const data = await fetchEtfGroupsIndex(decoded);
  return { ...generateEtfCountryListingMetadata(decoded), ...groupsIndexRobots(data) };
}

export default async function CountryEtfsPage({ params }: PageProps) {
  const { country } = await params;
  const decoded = resolveEtfCountryParam(country, '/etfs');
  const data = (await fetchEtfGroupsIndex(decoded)) ?? EMPTY_ETF_GROUPS_INDEX;
  return (
    <EtfGroupsIndex
      country={decoded}
      data={data}
      headSlot={<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfCountryListingBreadcrumbJsonLd(decoded)) }} />}
    />
  );
}
