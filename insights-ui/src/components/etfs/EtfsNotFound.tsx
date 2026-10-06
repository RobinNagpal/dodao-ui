import EtfGroupingCardGrid from '@/components/etfs/EtfGroupingCardGrid';
import { buildPopulatedEtfAssetClassItems } from '@/components/home-page/TopEtfAssetClassesShowcase';
import ListingNotFoundShell from '@/components/ui/sections/ListingNotFoundShell';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { EMPTY_ETF_ASSET_CLASSES_INDEX, fetchEtfAssetClassesIndex } from '@/utils/etf-listing-fetchers';

interface EtfsNotFoundProps {
  title: string;
  description: string;
}

/**
 * Shared 404 body for ETF pages (missing ETF, empty listing): a 404 header with browse links,
 * followed by the populated US asset-class cards (same as the home page) so visitors have
 * somewhere to go next.
 */
export default async function EtfsNotFound({ title, description }: EtfsNotFoundProps) {
  const data = (await fetchEtfAssetClassesIndex(SupportedCountries.US)) ?? EMPTY_ETF_ASSET_CLASSES_INDEX;

  return (
    <ListingNotFoundShell
      breadcrumbs={[
        { name: 'US ETFs', href: '/etfs', current: false },
        { name: 'Not Found', href: '#', current: true },
      ]}
      title={title}
      description={description}
      browseHref="/etfs"
      browseLabel="Browse All US ETFs"
      sectionTitle="Explore US ETFs by Asset Class"
      sectionDescription="Top-rated US ETFs grouped by asset class. Pick an asset class to see detailed metrics, expense ratios, and AI-driven analysis."
    >
      <EtfGroupingCardGrid columns={3} items={buildPopulatedEtfAssetClassItems(SupportedCountries.US, data)} />
    </ListingNotFoundShell>
  );
}
