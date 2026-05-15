import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateEtfListingMetadata, generateEtfListingJsonLd } from '@/utils/etf-metadata-generators';

export const dynamic = 'force-dynamic';

export const metadata = generateEtfListingMetadata();

export default async function EtfsPage() {
  return EtfGroupsIndex({
    country: SupportedCountries.US,
    title: 'US ETFs',
    headSlot: <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfListingJsonLd()) }} />,
  });
}
