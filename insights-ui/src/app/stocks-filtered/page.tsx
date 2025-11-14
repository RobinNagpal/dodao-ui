import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import WithSuspenseCompactSubIndustriesGrid from '@/components/stocks/WithSuspenseCompactSubIndustriesGrid';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { fetchStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import { getServerSession } from 'next-auth';

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
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;

  // Create a data promise for Suspense
  const dataPromise = (async () => {
    return fetchStocksData(SupportedCountries.US, searchParams);
  })();

  return (
    <IndustryWithStocksPageLayout
      title="US Stocks by Industry"
      description="Explore US stocks across NASDAQ, NYSE, and AMEX exchanges organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis."
      currentCountry="US"
      session={session}
      showAppliedFilters={true}
    >
      <WithSuspenseCompactSubIndustriesGrid dataPromise={dataPromise} />
    </IndustryWithStocksPageLayout>
  );
}
