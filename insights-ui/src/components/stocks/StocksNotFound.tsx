import CompactSubIndustriesGrid from '@/components/stocks/CompactSubIndustriesGrid';
import ListingNotFoundShell from '@/components/ui/sections/ListingNotFoundShell';
import { IndustriesResponse } from '@/types/api/ticker-industries';
import { SupportedCountries } from '@/utils/countryExchangeUtils';
import { getCachedCountryIndustries } from '@/utils/stocks-data-utils';

const TWO_WEEKS_IN_SECONDS = 14 * 24 * 60 * 60;

/** US industries grid data, in-process + Data-Cached (same tag + 2-week TTL as the old self-fetch). */
async function fetchIndustries(): Promise<IndustriesResponse | null> {
  try {
    return await getCachedCountryIndustries(SupportedCountries.US, TWO_WEEKS_IN_SECONDS);
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
