import TickersTable from '@/app/public-equities/debug/tickers/TickersTable';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Ticker } from '@prisma/client';

export default async function DebugPage() {
  const response = await fetch(`${getBaseUrl()}/api/tickers`, { cache: 'no-cache' });
  const tickers: Ticker[] = (await response.json()) as Ticker[];
  return (
    <PageWrapper>
      <h1 className="text-3xl">Ticker</h1>
      <TickersTable tickers={tickers} />
    </PageWrapper>
  );
}
