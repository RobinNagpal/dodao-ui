import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import CompactSubIndustriesGrid from '@/components/stocks/CompactSubIndustriesGrid';
import StocksPageLayout from '@/components/stocks/StocksPageLayout';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateUSStocksMetadata } from '@/utils/metadata-generators';
import { fetchStocksData } from '@/utils/stocks-data-utils';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

// ────────────────────────────────────────────────────────────────────────────────

export const metadata = generateUSStocksMetadata();

const breadcrumbs: BreadcrumbsOjbect[] = [{ name: 'US Stocks', href: `/stocks`, current: true }];

// ────────────────────────────────────────────────────────────────────────────────

export default async function StocksPage() {
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;

  // Fetch data using the cached function (no filters on static pages)
  const data = await fetchStocksData(SupportedCountries.US, {});

  return (
    <StocksPageLayout
      breadcrumbs={breadcrumbs}
      title="US Stocks by Industry"
      description="Explore US stocks across NASDAQ, NYSE, and AMEX exchanges organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis."
      currentCountry="US"
      session={session}
    >
      <CompactSubIndustriesGrid data={data} />
    </StocksPageLayout>
  );
}
