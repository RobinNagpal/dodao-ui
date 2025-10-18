import { RouteParams } from '@/app/stocks/[exchange]/[ticker]/page';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import TickerCreationPage from './TickerCreationPage';

export default async function CreateTickerPage({ params }: { params: RouteParams }) {
  const routeParams: Readonly<{ exchange: string; ticker: string }> = await params;
  const { exchange, ticker } = { exchange: routeParams.exchange.toUpperCase(), ticker: routeParams.ticker.toUpperCase() };

  return (
    <PageWrapper>
      <TickerCreationPage symbol={ticker} exchange={exchange} />
    </PageWrapper>
  );
}
