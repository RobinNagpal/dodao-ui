import { TickerV1ReportResponse } from '@/app/api/[spaceId]/tickers-v1/[ticker]/route';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import TickerDetailsClient from './TickerDetailsClient';

export default async function TickerDetailsPage({ params }: { params: Promise<{ ticker: string; exchange: string }> }) {
  const { ticker, exchange } = await params;
  const tickerResponse = await fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/tickers-v1/${ticker}`, { cache: 'no-cache' });

  const tickerData: TickerV1ReportResponse = (await tickerResponse.json()) as TickerV1ReportResponse;

  return <TickerDetailsClient tickerData={tickerData} exchange={exchange} ticker={ticker} />;
}
