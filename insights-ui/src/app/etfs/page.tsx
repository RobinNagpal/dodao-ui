import EtfGroupsIndex from '@/components/etfs/EtfGroupsIndex';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateEtfListingMetadata, generateEtfListingJsonLd, generateEtfListingBreadcrumbJsonLd } from '@/utils/etf-metadata-generators';

export const dynamic = 'force-dynamic';

export const metadata = generateEtfListingMetadata();

export default async function EtfsPage() {
  return EtfGroupsIndex({
    country: SupportedCountries.US,
    title: 'US ETFs',
    description:
      'Browse US exchange-traded funds organized by analysis group — diversified, sector, fixed income, and alternative-strategy. Each card lists the top-rated ETFs in that category.',
    headSlot: (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfListingJsonLd()) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateEtfListingBreadcrumbJsonLd()) }} />
      </>
    ),
  });
}
