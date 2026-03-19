import CompactSubIndustriesGrid from '@/components/stocks/CompactSubIndustriesGrid';
import IndustryWithStocksPageLayout from '@/components/stocks/IndustryWithStocksPageLayout';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { generateCountryStocksMetadata } from '@/utils/metadata-generators';
import { getStocksPageTag } from '@/utils/ticker-v1-cache-utils';

export const dynamic = 'force-static';
export const dynamicParams = true;
export const revalidate = 86400; // 24 hours

// ────────────────────────────────────────────────────────────────────────────────

const WEEK = 60 * 60 * 24 * 7;
export const metadata = generateCountryStocksMetadata('US');

// ────────────────────────────────────────────────────────────────────────────────

export default async function StocksPage() {
  const baseUrl = getBaseUrlForServerSidePages();
  // Fetch data using the cached function (no filters on static pages)
  const res = await fetch(`${baseUrl}/api/${KoalaGainsSpaceId}/tickers-v1/country/${SupportedCountries.US}/tickers/industries`, {
    next: { revalidate: WEEK, tags: [getStocksPageTag(SupportedCountries.US)] },
  });

  const data = (await res.json()) as IndustriesResponse;

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
