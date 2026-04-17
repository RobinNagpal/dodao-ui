import EtfPageLayout from '@/components/etfs/EtfPageLayout';
import WithSuspenseEtfListingGrid from '@/components/etfs/WithSuspenseEtfListingGrid';
import { fetchEtfListingData } from '@/utils/etf-data-utils';
import { EtfSearchParams } from '@/utils/etf-filter-utils';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'US ETFs - Filtered Results | KoalaGains',
  description:
    'Explore US ETFs with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights. Filter by AUM, P/E ratio, payout frequency, and more.',
};

type PageProps = {
  searchParams: Promise<EtfSearchParams>;
};

export default async function EtfsFilteredPage({ searchParams: searchParamsPromise }: PageProps) {
  const searchParams = await searchParamsPromise;

  const dataPromise = (async () => {
    return fetchEtfListingData(searchParams);
  })();

  return (
    <EtfPageLayout
      title="US ETFs"
      description="Explore US exchange-traded funds with detailed financial metrics, expense ratios, dividend analysis, and AI-driven insights."
      showAppliedFilters={true}
    >
      <WithSuspenseEtfListingGrid dataPromise={dataPromise} />
    </EtfPageLayout>
  );
}
