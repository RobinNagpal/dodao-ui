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
 * The eligibility filter the nightly auto-generation job applies when picking
 * stock candidates: the ticker must already have a generated report (`summary`
 * present) and must not have an open generation request. `exchanges`, when given,
 * restricts candidates to those venues.
 *
 * Extracted so the enqueue job (`getOldestStocksOverall`) and the admin
 * "upcoming reports" screen (`getUpcomingAutoGenerationStocks`) select from the
 * exact same population — a screen that previews the queue is only useful if it
 * cannot drift from what the job will actually pick.
 */
function autoGenCandidateWhere(spaceId: string, exchanges?: string[]) {
  return {
    spaceId,
    summary: { not: null },
    ...(exchanges ? { exchange: { in: exchanges } } : {}),
    generationRequests: {
      none: { status: { in: [GenerationRequestStatus.NotStarted, GenerationRequestStatus.InProgress] } },
    },
  };
}

/**
 * The order the nightly job generates in. "Report date" is anchored on the Final
 * Summary, which is written back onto the `TickerV1` row (see
 * `saveFinalSummaryResponse`), so the stalest report goes first.
 */
const AUTO_GEN_CANDIDATE_ORDER = { updatedAt: 'asc' } as const;

const AUTO_GEN_CANDIDATE_SELECT = { id: true, symbol: true, exchange: true, name: true, updatedAt: true } as const;

interface TickerCandidateRow {
  id: string;
  symbol: string;
  exchange: string;
  name: string;
  updatedAt: Date;
}

function toOldestReportRow(r: TickerCandidateRow): OldestReportRow {
  return {
    tickerId: r.id,
    symbol: r.symbol,
    exchange: r.exchange,
    name: r.name,
    reportLastUpdatedAt: r.updatedAt,
  };
}

/**
 * Returns the stocks whose overall report is the most stale, for the nightly
 * auto-generation job — the first `limit` entries of the queue.
 *
 * `exchanges`, when given, restricts candidates to those venues. The automated job
 * passes the US + Canada list so the Claude budget goes to the high-priority
 * markets; omit it (or pass undefined) to consider every exchange.
 */
export async function getOldestStocksOverall(spaceId: string, limit: number, exchanges?: string[]): Promise<OldestReportRow[]> {
  const rows = await prisma.tickerV1.findMany({
    where: autoGenCandidateWhere(spaceId, exchanges),
    orderBy: AUTO_GEN_CANDIDATE_ORDER,
    take: limit,
    select: AUTO_GEN_CANDIDATE_SELECT,
  });

  return rows.map(toOldestReportRow);
}

export interface UpcomingAutoGenerationPage {
  rows: OldestReportRow[];
  /** Every eligible candidate for these markets, not just the page — drives the pager. */
  totalCount: number;
}

/**
 * One page of the auto-generation queue, in the exact order the job will consume
 * it. Same population and ordering as `getOldestStocksOverall`; this one pages
 * through the whole queue and reports its total size, for the admin preview screen.
 */
export async function getUpcomingAutoGenerationStocks(
  spaceId: string,
  { exchanges, skip, take }: { exchanges?: string[]; skip: number; take: number }
): Promise<UpcomingAutoGenerationPage> {
  const where = autoGenCandidateWhere(spaceId, exchanges);

  const [rows, totalCount] = await Promise.all([
    prisma.tickerV1.findMany({ where, orderBy: AUTO_GEN_CANDIDATE_ORDER, skip, take, select: AUTO_GEN_CANDIDATE_SELECT }),
    prisma.tickerV1.count({ where }),
  ]);

  return { rows: rows.map(toOldestReportRow), totalCount };
}
