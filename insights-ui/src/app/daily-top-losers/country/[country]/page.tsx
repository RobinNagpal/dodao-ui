import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TopLoserWithTicker } from '@/types/daily-stock-movers';
import { DailyMoverType } from '@/utils/daily-movers-generation-utils';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import StockMoversTable from '@/components/daily-stock-movers/StockMoversTable';
import { Metadata } from 'next';
import { generateDailyMoversListMetadata } from '@/utils/metadata-generators';
import { getDailyMoversByCountryTag } from '@/utils/ticker-v1-cache-utils';

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  return generateDailyMoversListMetadata(country, DailyMoverType.LOSER);
}

export default async function DailyTopLosersPage({ params }: PageProps) {
  const { country } = await params;

  // Fetch top losers from the API with country filter
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-losers?country=${country}`, {
    next: {
      revalidate: 604800, // 7 days in seconds
      tags: [getDailyMoversByCountryTag(country, DailyMoverType.LOSER)],
    },
  });

  const topLosers: TopLoserWithTicker[] = await response.json();

  return (
    <PageWrapper>
      <StockMoversTable movers={topLosers} type={DailyMoverType.LOSER} country={country} />
    </PageWrapper>
  );
}
