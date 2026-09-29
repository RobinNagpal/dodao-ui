import CompactSubIndustriesGrid from '@/components/stocks/CompactSubIndustriesGrid';
import ListingNotFoundShell from '@/components/ui/sections/ListingNotFoundShell';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import { getStocksPageTag } from '@/utils/ticker-v1-cache-utils';

const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60;

async function fetchIndustries(): Promise<IndustriesResponse | null> {
  const url = `${getBaseUrlForServerSidePages()}/api/${KoalaGainsSpaceId}/tickers-v1/country/${SupportedCountries.US}/tickers/industries`;
  try {
    const res = await fetch(url, { next: { revalidate: TWO_WEEKS_IN_SECONDS, tags: [getStocksPageTag(SupportedCountries.US)] } });
    if (!res.ok) return null;
    return (await res.json()) as IndustriesResponse;
  } catch {
    return null;
  }
}

interface StocksNotFoundProps {
  title: string;
  description: string;
}

/**
 * Shared 404 body for stock pages (missing ticker, empty country industry listing): a 404 header
 * with browse links, followed by the US industries grid so visitors have somewhere to go next.
 */
export default async function StocksNotFound({ title, description }: StocksNotFoundProps) {
  const industriesData = await fetchIndustries();

  return (
    <ListingNotFoundShell
      breadcrumbs={[
        { name: 'US Stocks', href: '/stocks', current: false },
        { name: 'Not Found', href: '#', current: true },
      ]}
      title={title}
      description={description}
      browseHref="/stocks"
      browseLabel="Browse All US Stocks"
      sectionTitle="Explore US Stocks by Industry"
      sectionDescription="Top companies across NASDAQ, NYSE, and AMEX organized by industry. Pick an industry to dive into detailed financial reports and AI-driven analysis."
    >
      <CompactSubIndustriesGrid data={industriesData} />
    </ListingNotFoundShell>
  );
}
