import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import CompactSubIndustriesGrid from '@/components/stocks/CompactSubIndustriesGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { KoalaGainsSession } from '@/types/auth';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { fetchStocksData } from '@/utils/stocks-data-utils';
import { getServerSession } from 'next-auth';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

// ────────────────────────────────────────────────────────────────────────────────

export const metadata = generateCountryStocksMetadata('US');

// ────────────────────────────────────────────────────────────────────────────────

export default async function StocksPage() {
  const session = (await getServerSession(authOptions)) as KoalaGainsSession | undefined;

  // Fetch data using the cached function (no filters on static pages)
  const data = await fetchStocksData(SupportedCountries.US);

  return (
    <IndustryWithStocksPageLayout
      title="US Stocks by Industry"
      description="Explore US stocks across NASDAQ, NYSE, and AMEX exchanges organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis."
      currentCountry="US"
      session={session}
    >
      <CompactSubIndustriesGrid data={data} />
    </IndustryWithStocksPageLayout>
  );
}
