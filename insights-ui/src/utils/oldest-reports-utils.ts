import { prisma } from '@/prisma';
import { GenerationRequestStatus, ReportType, TickerAnalysisCategory } from '@/types/ticker-typesv1';

export interface OldestReportRow {
  tickerId: string;
  symbol: string;
  exchange: string;
  name: string;
  reportLastUpdatedAt: Date;
}

const REPORT_TYPE_TO_CATEGORY = {
  [ReportType.BUSINESS_AND_MOAT]: TickerAnalysisCategory.BusinessAndMoat,
  [ReportType.FINANCIAL_ANALYSIS]: TickerAnalysisCategory.FinancialStatementAnalysis,
  [ReportType.PAST_PERFORMANCE]: TickerAnalysisCategory.PastPerformance,
  [ReportType.FUTURE_GROWTH]: TickerAnalysisCategory.FutureGrowth,
  [ReportType.FAIR_VALUE]: TickerAnalysisCategory.FairValue,
} as const satisfies Partial<Record<ReportType, TickerAnalysisCategory>>;

export type SupportedOldestReportType = keyof typeof REPORT_TYPE_TO_CATEGORY;

export const SUPPORTED_OLDEST_REPORT_TYPES = Object.keys(REPORT_TYPE_TO_CATEGORY) as SupportedOldestReportType[];

export async function getOldestStocksByReportType(spaceId: string, reportType: SupportedOldestReportType, limit: number): Promise<OldestReportRow[]> {
  const rows = await prisma.tickerV1CategoryAnalysisResult.findMany({
    where: {
      spaceId,
      categoryKey: REPORT_TYPE_TO_CATEGORY[reportType],
      ticker: {
        generationRequests: {
          none: { status: { in: [GenerationRequestStatus.NotStarted, GenerationRequestStatus.InProgress] } },
        },
      },
    },
    orderBy: { updatedAt: 'asc' },
    take: limit,
    select: {
      updatedAt: true,
      ticker: { select: { id: true, symbol: true, exchange: true, name: true } },
    },
  });

  return rows.map((r) => ({
    tickerId: r.ticker.id,
    symbol: r.ticker.symbol,
    exchange: r.ticker.exchange,
    name: r.ticker.name,
    reportLastUpdatedAt: r.updatedAt,
  }));
}

/**
 * Returns the stocks whose overall report is the most stale, for the nightly
 * auto-generation job. "Report date" is anchored on the Final Summary, which is
 * written back onto the `TickerV1` row (see `saveFinalSummaryResponse`), so we
 * order tickers by `TickerV1.updatedAt asc`. Only tickers that already have a
 * generated report (`summary` present) and no open generation request are
 * eligible — mirroring `getOldestStocksByReportType`'s exclusion.
 */
export async function getOldestStocksOverall(spaceId: string, limit: number): Promise<OldestReportRow[]> {
  const rows = await prisma.tickerV1.findMany({
    where: {
      spaceId,
      summary: { not: null },
      generationRequests: {
        none: { status: { in: [GenerationRequestStatus.NotStarted, GenerationRequestStatus.InProgress] } },
      },
    },
    orderBy: { updatedAt: 'asc' },
    take: limit,
    select: { id: true, symbol: true, exchange: true, name: true, updatedAt: true },
  });

  return rows.map((r) => ({
    tickerId: r.id,
    symbol: r.symbol,
    exchange: r.exchange,
    name: r.name,
    reportLastUpdatedAt: r.updatedAt,
  }));
}
