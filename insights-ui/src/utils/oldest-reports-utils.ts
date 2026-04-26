import { prisma } from '@/prisma';
import { ReportType, TickerAnalysisCategory } from '@/types/ticker-typesv1';

export interface OldestReportRow {
  tickerId: string;
  symbol: string;
  exchange: string;
  name: string;
  reportLastUpdatedAt: Date;
}

const REPORT_TYPE_TO_CATEGORY: Partial<Record<ReportType, TickerAnalysisCategory>> = {
  [ReportType.BUSINESS_AND_MOAT]: TickerAnalysisCategory.BusinessAndMoat,
  [ReportType.FINANCIAL_ANALYSIS]: TickerAnalysisCategory.FinancialStatementAnalysis,
  [ReportType.PAST_PERFORMANCE]: TickerAnalysisCategory.PastPerformance,
  [ReportType.FUTURE_GROWTH]: TickerAnalysisCategory.FutureGrowth,
  [ReportType.FAIR_VALUE]: TickerAnalysisCategory.FairValue,
};

export const SUPPORTED_OLDEST_REPORT_TYPES: ReportType[] = Object.keys(REPORT_TYPE_TO_CATEGORY) as ReportType[];

/**
 * Returns the N tickers that have the oldest saved analysis result for the given report type,
 * ordered oldest first. Tickers without any saved row for that category are excluded — the
 * caller asked for "stocks with the oldest reports", not "stocks missing reports".
 *
 * Tickers with a pending generation request (NotStarted / InProgress) are excluded so a refresh
 * batch doesn't double up on work the pipeline is already doing.
 */
export async function getOldestStocksByReportType(spaceId: string, reportType: ReportType, limit: number): Promise<OldestReportRow[]> {
  const categoryKey = REPORT_TYPE_TO_CATEGORY[reportType];
  if (!categoryKey) {
    throw new Error(`Report type "${reportType}" is not supported by the oldest-reports lookup. Supported types: ${SUPPORTED_OLDEST_REPORT_TYPES.join(', ')}`);
  }

  return prisma.$queryRaw<OldestReportRow[]>`
    SELECT
      t.id              AS "tickerId",
      t.symbol          AS "symbol",
      t.exchange        AS "exchange",
      t.name            AS "name",
      car.updated_at    AS "reportLastUpdatedAt"
    FROM ticker_v1_category_analysis_results car
    JOIN tickers_v1 t
      ON t.id = car.ticker_id
      AND t.space_id = car.space_id
    WHERE car.space_id = ${spaceId}
      AND car.category_key::text = ${categoryKey}
      AND NOT EXISTS (
        SELECT 1 FROM ticker_v1_generation_requests gr
        WHERE gr.ticker_id = t.id
          AND gr.status IN ('NotStarted', 'InProgress')
      )
    ORDER BY car.updated_at ASC
    LIMIT ${limit};
  `;
}
