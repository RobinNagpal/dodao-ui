/**
 * Price chart + performance-metrics slice for the main `/etfs/[exchange]/[etf]`
 * page, split out of `/full-render`.
 *
 * Why its own endpoint: `ensureEtfPriceHistoryIsFresh` can hit Yahoo Finance
 * over the network when the stored price history is stale. Bundled into
 * `/full-render` that network call held back the whole report body (analysis,
 * holdings, competition) even though none of it needs price data. Splitting the
 * chart slice into its own fetch lets the page stream the report body as soon
 * as the DB read finishes, while the chart streams independently when the price
 * refresh completes. Carries the same `etfAndExchangeTag` umbrella cache tag as
 * `/full-render` so a single ETF invalidation still clears both.
 */
import { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { getEtfChartData } from '@/utils/etf-page-data';
import type { EtfPerformanceMetricsPayload } from '@/utils/etf-performance-metrics-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfChartDataResponse {
  priceHistory: PriceHistoryResponse | null;
  performanceMetrics: EtfPerformanceMetricsPayload | null;
}

async function getHandler(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfChartDataResponse> {
  const { spaceId, exchange, etf } = await params;
  return getEtfChartData(spaceId, exchange, etf);
}

export const GET = withErrorHandlingV2<EtfChartDataResponse>(getHandler);
