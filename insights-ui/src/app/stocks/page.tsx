import CompactSubIndustriesGrid from '@/components/stocks/CompactSubIndustriesGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { getCachedCountryIndustries } from '@/utils/stocks-data-utils';

export const dynamic = 'force-dynamic';

// ────────────────────────────────────────────────────────────────────────────────

const WEEK = 60 * 60 * 24 * 7;
export const metadata = generateCountryStocksMetadata('US');

// ────────────────────────────────────────────────────────────────────────────────

export default async function StocksPage() {
  // In-process + Data-Cached (same tag + 1-week TTL as the old self-fetch); no filters on static pages.
  const data: IndustriesResponse = await getCachedCountryIndustries(SupportedCountries.US, WEEK);

  return (
    <IndustryWithStocksPageLayout
      title="US Stocks by Industry"
      description="Explore US stocks across NASDAQ, NYSE, and AMEX exchanges organized by industry. View top-performing companies in each sector with detailed financial reports and AI-driven analysis."
      currentCountry="US"
    >
      <CompactSubIndustriesGrid data={data} />
    </IndustryWithStocksPageLayout>
  );
}
