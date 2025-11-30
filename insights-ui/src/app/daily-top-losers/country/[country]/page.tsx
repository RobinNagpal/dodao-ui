import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TopLoserWithTicker } from '@/types/daily-stock-movers';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import StockMoversTable from '@/components/daily-stock-movers/StockMoversTable';

interface PageProps {
  params: Promise<{ country: string }>;
}

export default async function DailyTopLosersPage({ params }: PageProps) {
  const { country } = await params;

  // Fetch top losers from the API with country filter
  const response = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/daily-top-losers?country=${country}`, {
    cache: 'no-cache',
  });

  const topLosers: TopLoserWithTicker[] = await response.json();

  return (
    <PageWrapper>
      <StockMoversTable movers={topLosers} type="losers" country={country} />
    </PageWrapper>
  );
}
