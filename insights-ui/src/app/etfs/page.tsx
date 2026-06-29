import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { EMPTY_ETF_GROUPS_INDEX, fetchEtfGroupsIndex } from '@/utils/etf-listing-fetchers';
import { groupsIndexRobots } from '@/utils/etf-listing-noindex';
import { generateEtfListingBreadcrumbJsonLd, generateEtfListingJsonLd, generateEtfListingMetadata } from '@/utils/etf-metadata-generators';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchEtfGroupsIndex(SupportedCountries.US);
  return { ...generateEtfListingMetadata(), ...groupsIndexRobots(data) };
}

export default async function EtfsPage() {
  const data = (await fetchEtfGroupsIndex(SupportedCountries.US)) ?? EMPTY_ETF_GROUPS_INDEX;
  return (
    <EtfGroupsIndex
      country={SupportedCountries.US}
      data={data}
      title="US ETFs"
      headSlot={
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfListingJsonLd()) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfListingBreadcrumbJsonLd()) }} />
        </>
      }
    />
  );
}
