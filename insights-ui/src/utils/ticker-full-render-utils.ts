import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { BaseFinancialPeriod, IncomeAnnualData, IncomeQuarterlyData, PriceHistoryPoint, StockFundamentalsSummary } from '@/types/prismaTypes';
import { CompetitionResponse } from '@/types/ticker-typesv1';
import type {
  ChartMetricType,
  QuarterlyChartDataResponse,
  QuarterlyDataPoint,
} from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/quarterly-chart-data/route';
import type { FinancialInfoResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/financial-info/route';
import type { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { getMissingReportsForTicker } from '@/utils/missing-reports-utils';
import { ensurePriceHistoryIsFresh } from '@/utils/price-history-utils';
import { ensureStockAnalyzerDataIsFresh } from '@/utils/stock-analyzer-scraper-utils';
import { SimilarTicker, TickerV1FastResponse, getCompetitorTickers, tickerV1IncludeWithRelations } from '@/utils/ticker-v1-model-utils';
import { Prisma, TickerV1PriceHistory, TickerV1StockAnalyzerScrapperInfo, TickerV1VsCompetition } from '@prisma/client';

/**
 * Consolidated response payload for the main `/stocks/[exchange]/[ticker]` page.
 *
 * The main page used to call six separately-tagged `fetch()`es (ticker,
 * similar, financial-info, quarterly-chart, price-history, competition), each
 * of which became one Data Cache entry on Vercel. With the unified Cache
 * Writes meter, one rebuild cost 1 HTML ISR write + 6 Data Cache writes — a
 * ~7× multiplier on every umbrella invalidation. This consolidated shape lets
 * the page issue a single tagged fetch instead, dropping the per-rebuild
 * write cost to 1 HTML + 1 Data Cache entry.
 *
 * See `docs/insights-ui/stock-page-caching.md` for the broader topology.
 */
export interface TickerFullRenderResponse {
  ticker: TickerV1FastResponse | null;
  similar: SimilarTicker[];
  financialInfo: FinancialInfoResponse | null;
  quarterlyChart: QuarterlyChartDataResponse | null;
  priceHistory: PriceHistoryResponse | null;
  competition: CompetitionResponse | null;
}

const EMPTY_RESPONSE: TickerFullRenderResponse = {
  ticker: null,
  similar: [],
  financialInfo: null,
  quarterlyChart: null,
  priceHistory: null,
  competition: null,
};

/* ------------------------------------------------------------------ */
/*  Pure conversion helpers (mirror the per-endpoint implementations)  */
/* ------------------------------------------------------------------ */

type Num = number | null;

function num(v: unknown): Num {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const cleaned = v.replace(/,/g, '').trim();
    const x = Number(cleaned);
    return Number.isFinite(x) ? x : null;
  }
  return null;
}

function parsePercentage(v: string | undefined | null): Num {
  if (!v) return null;
  const cleaned = v.replace(/%/g, '').trim();
  return num(cleaned);
}

function buildFinancialInfoFromSummary(summary: StockFundamentalsSummary | null | undefined, symbol: string): FinancialInfoResponse | null {
  if (!summary || Object.keys(summary).length === 0) return null;

  return {
    symbol,
    currency: null,
    price: num(summary.previousClose) ?? num(summary.open),
    dayHigh: num(summary.daysRange?.high),
    dayLow: num(summary.daysRange?.low),
    yearHigh: num(summary.week52Range?.high),
    yearLow: num(summary.week52Range?.low),
    marketCap: summary.marketCap || null,
    epsDilutedTTM: num(summary.epsTtm),
    pe: num(summary.peRatio),
    avgVolume3M: num(summary.averageVolume),
    dayVolume: num(summary.volume),
    annualDividend: num(summary.dividend?.amount),
    dividendYield: parsePercentage(summary.dividend?.yieldPct),
    totalRevenue: summary.revenueTtm || null,
    netIncome: summary.netIncomeTtm || null,
    forwardPE: num(summary.forwardPE),
    beta: num(summary.beta),
  };
}

function extractNumericValue(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[,%]/g, '').trim();
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function extractMetricValue(period: BaseFinancialPeriod, metric: ChartMetricType): number | null {
  const values = period.values;
  if (!values) return null;
  switch (metric) {
    case 'revenue':
      return extractNumericValue(values.revenue) ?? extractNumericValue(values.totalRevenue);
    case 'grossMargin':
      return extractNumericValue(values.grossMargin);
    case 'ebit':
      return extractNumericValue(values.ebit);
    case 'freeCashFlow':
      return extractNumericValue(values.freeCashFlow);
    case 'eps':
      return extractNumericValue(values.eps);
    case 'sharesOutstanding':
      return extractNumericValue(values.sharesOutstanding) ?? extractNumericValue(values.basicSharesOutstanding);
    default:
      return null;
  }
}

function buildChartResponse(
  periods: BaseFinancialPeriod[],
  periodLabels: string[],
  meta: { currency?: string; unit?: string; fiscalYearNote?: string },
  dataFrequency: 'quarterly' | 'annual'
): QuarterlyChartDataResponse | null {
  const allMetrics: ChartMetricType[] = ['revenue', 'grossMargin', 'ebit', 'freeCashFlow', 'eps', 'sharesOutstanding'];
  const availableMetrics = allMetrics.filter((metric) => periods.some((period) => extractMetricValue(period, metric) !== null));
  if (availableMetrics.length === 0) return null;

  const data: Record<ChartMetricType, QuarterlyDataPoint[]> = {} as Record<ChartMetricType, QuarterlyDataPoint[]>;
  for (const metric of allMetrics) {
    data[metric] = periods.map((period, idx) => ({
      quarter: periodLabels[idx],
      value: extractMetricValue(period, metric),
    }));
  }

  return {
    meta: {
      currency: meta.currency || null,
      unit: meta.unit || null,
      fiscalYearNote: meta.fiscalYearNote || null,
    },
    availableMetrics,
    data,
    dataFrequency,
  };
}

function buildQuarterlyChartFromScraperInfo(scraperInfo: TickerV1StockAnalyzerScrapperInfo | null): QuarterlyChartDataResponse | null {
  if (!scraperInfo) return null;

  const incomeQuarterly = scraperInfo.incomeStatementQuarter as IncomeQuarterlyData | null;
  if (incomeQuarterly?.periods?.length) {
    const sorted = [...incomeQuarterly.periods].sort((a, b) => {
      const parse = (q: string): number => {
        const match = q.match(/Q(\d)\s+(\d{4})/);
        if (!match) return 0;
        return parseInt(match[2], 10) * 4 + parseInt(match[1], 10);
      };
      return parse(a.fiscalQuarter) - parse(b.fiscalQuarter);
    });
    const built = buildChartResponse(
      sorted,
      sorted.map((p) => p.fiscalQuarter),
      incomeQuarterly.meta || {},
      'quarterly'
    );
    if (built) return built;
  }

  const incomeAnnual = scraperInfo.incomeStatementAnnual as IncomeAnnualData | null;
  if (incomeAnnual?.periods?.length) {
    const sorted = [...incomeAnnual.periods].sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));
    return buildChartResponse(
      sorted,
      sorted.map((p) => p.fiscalYear),
      incomeAnnual.meta || {},
      'annual'
    );
  }

  return null;
}

function buildPriceHistoryFromPriceInfo(priceInfo: TickerV1PriceHistory | null, symbol: string): PriceHistoryResponse | null {
  if (!priceInfo) return null;
  const daily = (priceInfo.dailyData as unknown as PriceHistoryPoint[] | null) ?? [];
  const weekly = (priceInfo.weeklyData as unknown as PriceHistoryPoint[] | null) ?? [];
  if (daily.length === 0 && weekly.length === 0) return null;
  return {
    symbol,
    currency: priceInfo.currency ?? null,
    daily,
    weekly,
  };
}

/* ------------------------------------------------------------------ */
/*  Similar-tickers query (mirrors the per-endpoint query verbatim)    */
/* ------------------------------------------------------------------ */

async function findSimilarTickers(spaceId: string, tickerId: string, industryKey: string, subIndustryKey: string): Promise<SimilarTicker[]> {
  return prisma.tickerV1.findMany({
    where: {
      spaceId,
      industryKey,
      subIndustryKey,
      id: { not: tickerId },
    },
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      cachedScoreEntry: {
        select: { finalScore: true },
      },
    },
    orderBy: { cachedScoreEntry: { finalScore: 'desc' } },
    take: 3,
  });
}

/* ------------------------------------------------------------------ */
/*  Orchestrator: one DB load + parallel slice-building                */
/* ------------------------------------------------------------------ */

/**
 * Loads everything the main ticker page needs in one go.
 *
 * - One Prisma read for the ticker row + all relations + vsCompetition.
 * - Parallel: similar-tickers query, scraper freshness (used by financial-info
 *   + quarterly chart), price-history freshness, competitor-ticker enrichment,
 *   missing-reports calculation.
 * - Scraper/price freshness functions may upsert their respective DB rows when
 *   stale; their `revalidateTag` calls were already removed in PR #1472 so
 *   running them here doesn't evict the cache entry we're about to fill.
 */
export async function fetchTickerFullRenderData(rawSpaceId: string | undefined, rawExchange: string, rawTicker: string): Promise<TickerFullRenderResponse> {
  const spaceId = rawSpaceId || KoalaGainsSpaceId;
  const exchange = rawExchange?.toUpperCase()?.trim();
  const symbol = rawTicker?.toUpperCase()?.trim();
  if (!exchange || !symbol) return EMPTY_RESPONSE;

  const whereClause: Prisma.TickerV1WhereInput = { spaceId, symbol, exchange };

  const tickerRecord = await prisma.tickerV1.findFirst({
    where: whereClause,
    include: {
      ...tickerV1IncludeWithRelations,
      vsCompetition: true,
    },
  });

  if (!tickerRecord) return EMPTY_RESPONSE;

  const [missingReports, similar, scraperInfo, priceInfo, competitorTickers] = await Promise.all([
    getMissingReportsForTicker(spaceId, tickerRecord.id),
    findSimilarTickers(spaceId, tickerRecord.id, tickerRecord.industryKey, tickerRecord.subIndustryKey),
    ensureStockAnalyzerDataIsFresh(tickerRecord).catch((err: unknown) => {
      console.error(`fetchTickerFullRenderData: scraper data fetch failed for ${symbol}:`, err);
      return null;
    }),
    ensurePriceHistoryIsFresh(tickerRecord).catch((err: unknown) => {
      console.error(`fetchTickerFullRenderData: price history fetch failed for ${symbol}:`, err);
      return null;
    }),
    getCompetitorTickers(tickerRecord as Parameters<typeof getCompetitorTickers>[0]),
  ]);

  if (!missingReports) {
    throw new Error(`fetchTickerFullRenderData: failed to get missing reports for ${symbol}`);
  }

  const tickerResponse: TickerV1FastResponse = { ...tickerRecord, ...missingReports };

  const summary = scraperInfo?.summary as StockFundamentalsSummary | null | undefined;
  const financialInfo = buildFinancialInfoFromSummary(summary, tickerRecord.symbol);
  const quarterlyChart = buildQuarterlyChartFromScraperInfo(scraperInfo);
  const priceHistory = buildPriceHistoryFromPriceInfo(priceInfo, tickerRecord.symbol);

  const competition: CompetitionResponse = {
    vsCompetition: (tickerRecord.vsCompetition as TickerV1VsCompetition | null) || null,
    competitorTickers,
    ticker: tickerRecord,
  };

  return {
    ticker: tickerResponse,
    similar,
    financialInfo,
    quarterlyChart,
    priceHistory,
    competition,
  };
}
