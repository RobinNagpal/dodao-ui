import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import WithSuspenseCompactSubIndustriesGrid from '@/components/stocks/WithSuspenseCompactSubIndustriesGrid';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { fetchStocksData, type SearchParams } from '@/utils/stocks-data-utils';

// Dynamic page for filtered results
export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────────

export const metadata = generateCountryStocksMetadata('US');

// ────────────────────────────────────────────────────────────────────────────────

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function StocksFilteredPage({ searchParams: searchParamsPromise }: PageProps) {
  const searchParams = await searchParamsPromise;

  // Create a data promise for Suspense
  const dataPromise = (async () => {
    return fetchStocksData(SupportedCountries.US, searchParams);
  })();

  return (
    <IndustryWithStocksPageLayout
      title="US Stocks by Industry"
      description="Explore US stocks across NASDAQ, NYSE, and AMEX exchanges organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis."
      currentCountry="US"
      showAppliedFilters={true}
    >
      <WithSuspenseCompactSubIndustriesGrid dataPromise={dataPromise} />
    </IndustryWithStocksPageLayout>
  );
}
