import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import StocksPageLayout from '@/components/stocks/StocksPageLayout';
import WithSuspenseCompactSubIndustriesGrid from '@/components/stocks/WithSuspenseCompactSubIndustriesGrid';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateUSStocksMetadata } from '@/utils/metadata-generators';
import { fetchStocksData, type SearchParams } from '@/utils/stocks-data-utils';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { getServerSession } from 'next-auth';

// Dynamic page for filtered results
export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────────

export const metadata = generateUSStocksMetadata();

const breadcrumbs: BreadcrumbsOjbect[] = [{ name: 'US Stocks', href: `/stocks`, current: true }];

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
    <StocksPageLayout
      breadcrumbs={breadcrumbs}
      title="US Stocks by Industry"
      description="Explore US stocks across NASDAQ, NYSE, and AMEX exchanges organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis."
      currentCountry="US"
      session={session}
      showAppliedFilters={true}
    >
      <WithSuspenseCompactSubIndustriesGrid dataPromise={dataPromise} />
    </StocksPageLayout>
  );
}
