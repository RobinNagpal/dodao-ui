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
import { getEtfWhereClause } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import { ensureEtfPriceHistoryIsFresh } from '@/utils/etf-price-history-utils';
import { buildEtfPerformanceMetricsPayload, type EtfPerformanceMetricFields, type EtfPerformanceMetricsPayload } from '@/utils/etf-performance-metrics-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfChartDataResponse {
  priceHistory: PriceHistoryResponse | null;
  performanceMetrics: EtfPerformanceMetricsPayload | null;
}

const EMPTY: EtfChartDataResponse = { priceHistory: null, performanceMetrics: null };

async function getHandler(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfChartDataResponse> {
  const { spaceId, exchange, etf } = await params;
  const where = getEtfWhereClause({ spaceId, exchange, etf });
  if (!where.symbol || !where.exchange) return EMPTY;

  const etfRecord = await prisma.etf.findFirst({ where, include: { stockAnalyzerInfo: true } });
  if (!etfRecord) return EMPTY;

  const focalCategory = etfRecord.stockAnalyzerInfo?.category ?? null;

  const [priceInfo, categoryPeers] = await Promise.all([
    ensureEtfPriceHistoryIsFresh(etfRecord).catch(() => null),
    fetchCategoryPeerAnalyzerInfo(etfRecord.spaceId, focalCategory, etfRecord.id),
  ]);

  const performanceMetrics: EtfPerformanceMetricsPayload | null = etfRecord.stockAnalyzerInfo
    ? buildEtfPerformanceMetricsPayload(etfRecord.stockAnalyzerInfo, categoryPeers, focalCategory)
    : null;

  const priceHistory: PriceHistoryResponse | null =
    priceInfo &&
    (((priceInfo.dailyData as unknown as PriceHistoryPoint[] | null)?.length ?? 0) > 0 ||
      ((priceInfo.weeklyData as unknown as PriceHistoryPoint[] | null)?.length ?? 0) > 0)
      ? {
          symbol: etfRecord.symbol,
          currency: priceInfo.currency ?? null,
          daily: (priceInfo.dailyData as unknown as PriceHistoryPoint[] | null) ?? [],
          weekly: (priceInfo.weeklyData as unknown as PriceHistoryPoint[] | null) ?? [],
        }
      : null;

  return { priceHistory, performanceMetrics };
}

/**
 * Pull only the cagr/return fields for the focal ETF's category peers (same
 * `spaceId`, same `category`, excluding the focal ETF itself) so the shared
 * averaging util can build the "vs category" series. Returns `[]` when the
 * focal ETF has no category — the chart then renders the ETF-only series.
 */
async function fetchCategoryPeerAnalyzerInfo(spaceId: string, category: string | null, focalEtfId: string): Promise<EtfPerformanceMetricFields[]> {
  if (!category) return [];

  return prisma.etfStockAnalyzerInfo.findMany({
    where: {
      etf: { spaceId, NOT: { id: focalEtfId } },
      category,
    },
    select: {
      cagr1y: true,
      cagr3y: true,
      cagr5y: true,
      cagr10y: true,
      cagr15y: true,
      cagr20y: true,
      return1m: true,
      return6m: true,
      return1y: true,
      return3y: true,
      return5y: true,
      return10y: true,
      return15y: true,
      return20y: true,
    },
  });
}

export const GET = withErrorHandlingV2<EtfChartDataResponse>(getHandler);
