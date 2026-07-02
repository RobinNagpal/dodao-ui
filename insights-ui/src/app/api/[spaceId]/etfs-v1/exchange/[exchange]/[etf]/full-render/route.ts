/**
 * Consolidated payload for the main `/etfs/[exchange]/[etf]` page.
 *
 * The page used to issue 8 separately-tagged fetches (etf, financial-info,
 * analysis, scores, similar-etfs, portfolio-holdings, competition,
 * price-history) — each became one Vercel Data Cache entry, so a single
 * umbrella invalidation cost 1 HTML ISR write + 8 Data Cache writes per
 * rebuild. Routing the page through this endpoint collapses the per-rebuild
 * cost to 1 HTML + 1 Data Cache entry. Mirrors
 * `tickers-v1/.../full-render` on the stocks side.
 */
import { EtfAnalysisResponse, EtfCategoryAnalysisResultResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import { EtfPortfolioHoldingsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/portfolio-holdings/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import type { EtfFinancialInfoResponse, EtfScoresResponse, SimilarEtf } from '@/types/etf/etf-detail-response-types';
import { getEtfWhereClause, serializeBigIntFields } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import type { EtfApplicableInvestorGoals, EtfCompetitionResponse, EtfCompetitor, EtfKeyFactsFlagAssessment } from '@/types/etf/etf-analysis-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { CompetitionAnalysis } from '@/types/public-equity/analysis-factors-types';
import { parsePercentString } from '@/utils/etf-performance-metrics-utils';
import { hydrateSimilarEtfs } from '@/utils/etf-similar-etfs-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfKeyFactsReportResponse {
  keyFacts: string | null;
  greenFlags: EtfKeyFactsFlagAssessment[];
  redFlags: EtfKeyFactsFlagAssessment[];
  applicableInvestorGoals: EtfApplicableInvestorGoals[];
}

/**
 * Compact risk/return figures surfaced as a tight row under the financial-info
 * + radar block on the main ETF page. Sharpe/Sortino/beta come from the
 * screener (`stockAnalyzerInfo`), max drawdown from the Morningstar risk JSON,
 * and the expected forward returns from the key-facts report. All nullable —
 * the row renders only the figures that exist.
 */
export interface EtfKeyMetricsResponse {
  sharpe: number | null;
  sortino: number | null;
  beta5y: number | null;
  /** Worst peak-to-trough loss as a percent (negative, e.g. -18.4). */
  maxDrawdown: number | null;
  expectedNext1YrReturns: number | null;
  expectedNext1YrReturnsReason: string | null;
  expectedNext3YrReturns: number | null;
  expectedNext3YrReturnsReason: string | null;
  expectedNext5YrReturns: number | null;
  expectedNext5YrReturnsReason: string | null;
}

export interface EtfFullRenderResponse {
  etf: EtfFastResponse | null;
  financialInfo: EtfFinancialInfoResponse | null;
  analysis: EtfAnalysisResponse;
  scores: EtfScoresResponse | null;
  similarEtfs: SimilarEtf[];
  portfolioHoldings: EtfPortfolioHoldingsResponse;
  competition: EtfCompetitionResponse | null;
  keyFacts: EtfKeyFactsReportResponse | null;
  keyMetrics: EtfKeyMetricsResponse;
}

const EMPTY_KEY_METRICS: EtfKeyMetricsResponse = {
  sharpe: null,
  sortino: null,
  beta5y: null,
  maxDrawdown: null,
  expectedNext1YrReturns: null,
  expectedNext1YrReturnsReason: null,
  expectedNext3YrReturns: null,
  expectedNext3YrReturnsReason: null,
  expectedNext5YrReturns: null,
  expectedNext5YrReturnsReason: null,
};

const EMPTY: EtfFullRenderResponse = {
  etf: null,
  financialInfo: null,
  analysis: { categories: [] },
  scores: null,
  similarEtfs: [],
  portfolioHoldings: { holdings: null, updatedAt: null },
  competition: null,
  keyFacts: null,
  keyMetrics: EMPTY_KEY_METRICS,
};

async function getHandler(
  _req: NextRequest,
  { params }: { params: Promise<{ spaceId: string; exchange: string; etf: string }> }
): Promise<EtfFullRenderResponse> {
  const { spaceId, exchange, etf } = await params;
  const where = getEtfWhereClause({ spaceId, exchange, etf });
  if (!where.symbol || !where.exchange) return EMPTY;

  // One umbrella query for everything we can fetch via the Etf row + includes.
  // Saves 7 round-trips vs each of the original endpoints calling findFirst
  // independently. Anything not reachable via include (analysis factors,
  // similar-etfs hydration, competition hydration) is loaded in parallel below.
  const etfRecord = await prisma.etf.findFirst({
    where,
    include: {
      financialInfo: true,
      stockAnalyzerInfo: true,
      cachedScore: true,
      morPortfolioInfo: { select: { holdings: true, updatedAt: true } },
      morRiskInfo: { select: { riskPeriods: true } },
      vsCompetition: true,
      similarEtfs: { orderBy: { sortOrder: 'asc' }, take: 6 },
      keyFactsReport: true,
      futureReturns: true,
    },
  });
  if (!etfRecord) return EMPTY;

  const etfId = etfRecord.id;

  const [analysisRows, similarHydrated, competitorHydrated] = await Promise.all([
    prisma.etfCategoryAnalysisResult.findMany({
      where: { etfId, spaceId: where.spaceId },
      include: {
        factorResults: {
          select: { factorKey: true, oneLineExplanation: true, detailedExplanation: true, result: true },
        },
      },
    }),
    hydrateSimilarEtfs(etfRecord.spaceId, etfRecord.similarEtfs),
    hydrateCompetitors(etfRecord.vsCompetition?.competitionAnalysisArray as unknown as CompetitionAnalysis[] | undefined),
  ]);

  // Shape responses to match the original per-route payloads so the main page
  // can keep its existing component contracts.
  const etfRaw: EtfFastResponse = serializeBigIntFields({
    ...etfRecord,
    // Strip relations not in the original EtfFastResponse shape so the
    // serialized blob is leaner; the main page only reads financialInfo /
    // stockAnalyzerInfo / top-level fields from this slot.
    morPortfolioInfo: undefined,
    morRiskInfo: undefined,
    vsCompetition: undefined,
    similarEtfs: undefined,
    cachedScore: undefined,
    keyFactsReport: undefined,
    futureReturns: undefined,
  });

  const keyFacts: EtfKeyFactsReportResponse | null = etfRecord.keyFactsReport
    ? {
        keyFacts: etfRecord.keyFactsReport.keyFacts,
        greenFlags: (etfRecord.keyFactsReport.greenFlags as unknown as EtfKeyFactsFlagAssessment[] | null) ?? [],
        redFlags: (etfRecord.keyFactsReport.redFlags as unknown as EtfKeyFactsFlagAssessment[] | null) ?? [],
        applicableInvestorGoals: (etfRecord.keyFactsReport.applicableInvestorGoals as unknown as EtfApplicableInvestorGoals[] | null) ?? [],
      }
    : null;

  const sa = etfRecord.stockAnalyzerInfo;
  const fr = etfRecord.futureReturns;
  const keyMetrics: EtfKeyMetricsResponse = {
    sharpe: sa?.sharpe ?? null,
    sortino: sa?.sortino ?? null,
    beta5y: sa?.beta5y ?? null,
    maxDrawdown: extractMaxDrawdown(etfRecord.morRiskInfo?.riskPeriods),
    expectedNext1YrReturns: fr?.expectedNext1YrReturns ?? null,
    expectedNext1YrReturnsReason: fr?.expectedNext1YrReturnsReason ?? null,
    expectedNext3YrReturns: fr?.expectedNext3YrReturns ?? null,
    expectedNext3YrReturnsReason: fr?.expectedNext3YrReturnsReason ?? null,
    expectedNext5YrReturns: fr?.expectedNext5YrReturns ?? null,
    expectedNext5YrReturnsReason: fr?.expectedNext5YrReturnsReason ?? null,
  };

  const financialInfo: EtfFinancialInfoResponse | null = etfRecord.financialInfo
    ? {
        symbol: etfRecord.symbol,
        aum: etfRecord.financialInfo.aum,
        expenseRatio: etfRecord.financialInfo.expenseRatio,
        pe: etfRecord.financialInfo.pe,
        sharesOut: etfRecord.financialInfo.sharesOut,
        dividendTtm: etfRecord.financialInfo.dividendTtm,
        dividendYield: etfRecord.financialInfo.dividendYield,
        payoutFrequency: etfRecord.financialInfo.payoutFrequency,
        payoutRatio: etfRecord.financialInfo.payoutRatio,
        volume: etfRecord.financialInfo.volume,
        yearHigh: etfRecord.financialInfo.yearHigh,
        yearLow: etfRecord.financialInfo.yearLow,
        beta: etfRecord.financialInfo.beta,
        holdings: etfRecord.financialInfo.holdings,
      }
    : null;

  const scores: EtfScoresResponse | null = etfRecord.cachedScore
    ? {
        performanceAndReturnsScore: etfRecord.cachedScore.performanceAndReturnsScore,
        costEfficiencyAndTeamScore: etfRecord.cachedScore.costEfficiencyAndTeamScore,
        riskAnalysisScore: etfRecord.cachedScore.riskAnalysisScore,
        futurePerformanceOutlookScore: etfRecord.cachedScore.futurePerformanceOutlookScore,
        finalScore: etfRecord.cachedScore.finalScore,
      }
    : null;

  const analysis: EtfAnalysisResponse = serializeBigIntFields({
    categories: analysisRows.map(
      (r): EtfCategoryAnalysisResultResponse => ({
        categoryKey: r.categoryKey,
        summary: r.summary,
        overallAnalysisDetails: r.overallAnalysisDetails,
        factorResults: r.factorResults,
        updatedAt: r.updatedAt.toISOString(),
      })
    ),
  });

  const portfolioHoldings: EtfPortfolioHoldingsResponse = {
    holdings: (etfRecord.morPortfolioInfo?.holdings ?? null) as EtfPortfolioHoldingsResponse['holdings'],
    updatedAt: etfRecord.morPortfolioInfo?.updatedAt?.toISOString() ?? null,
  };

  const competition: EtfCompetitionResponse | null = etfRecord.vsCompetition
    ? {
        vsCompetition: {
          overallAnalysisDetails: etfRecord.vsCompetition.overallAnalysisDetails,
          createdAt: etfRecord.vsCompetition.createdAt,
          updatedAt: etfRecord.vsCompetition.updatedAt,
        },
        competitors: competitorHydrated,
        etf: {
          id: etfRecord.id,
          name: etfRecord.name,
          symbol: etfRecord.symbol,
          exchange: etfRecord.exchange,
          cachedScoreEntry: scores,
          createdAt: etfRecord.createdAt,
          updatedAt: etfRecord.updatedAt,
        },
      }
    : null;

  return {
    etf: etfRaw,
    financialInfo,
    analysis,
    scores,
    similarEtfs: similarHydrated,
    portfolioHoldings,
    competition,
    keyFacts,
    keyMetrics,
  };
}

/**
 * Pull the fund's worst peak-to-trough loss from the Morningstar risk JSON.
 * Prefers the 5-Yr window (falling back to 3-Yr then 10-Yr), reads the
 * "Max Drawdown" row, and takes the fund's own column ("Investment") rather
 * than the category/index columns. Returns a negative percent or null.
 */
function extractMaxDrawdown(riskPeriods: unknown): number | null {
  if (!riskPeriods || typeof riskPeriods !== 'object') return null;
  const periods = riskPeriods as Record<string, any>;

  for (const period of ['5-Yr', '3-Yr', '10-Yr']) {
    const table = periods[period]?.marketVolatilityMeasures?.drawdown;
    const rows: any[] = Array.isArray(table?.rows) ? table.rows : [];
    if (!rows.length) continue;

    const row = rows.find((r) => typeof r?.label === 'string' && r.label.toLowerCase().includes('max drawdown')) ?? rows[0];
    const values: Record<string, unknown> = row?.values ?? {};
    const columns: string[] = Array.isArray(table?.columns) ? table.columns : Object.keys(values);

    const preferredColumn = columns.find((c) => c.toLowerCase() === 'investment') ?? columns.find((c) => c.toLowerCase() !== 'index') ?? columns[0];
    const raw = preferredColumn ? values[preferredColumn] : Object.values(values)[0];
    const parsed = parsePercentString(typeof raw === 'string' ? raw : null);
    if (parsed !== null) return parsed;
  }
  return null;
}

async function hydrateCompetitors(competitionArray: CompetitionAnalysis[] | undefined): Promise<EtfCompetitor[]> {
  if (!competitionArray?.length) return [];

  const symbolsToCheck = competitionArray.map((c) => c.companySymbol?.toUpperCase()).filter((s): s is string => !!s);

  const existing =
    symbolsToCheck.length > 0
      ? await prisma.etf.findMany({
          where: { spaceId: KoalaGainsSpaceId, symbol: { in: symbolsToCheck } },
          select: {
            id: true,
            name: true,
            symbol: true,
            exchange: true,
            cachedScore: {
              select: {
                performanceAndReturnsScore: true,
                costEfficiencyAndTeamScore: true,
                riskAnalysisScore: true,
                futurePerformanceOutlookScore: true,
                finalScore: true,
              },
            },
          },
        })
      : [];

  const etfMap = new Map(existing.map((e) => [e.symbol.toUpperCase(), e]));

  return competitionArray.map((entry) => {
    const symbolUpper = entry.companySymbol?.toUpperCase();
    const match = symbolUpper ? etfMap.get(symbolUpper) : undefined;
    return {
      companyName: entry.companyName,
      companySymbol: entry.companySymbol,
      exchangeSymbol: entry.exchangeSymbol,
      exchangeName: entry.exchangeName,
      detailedComparison: entry.detailedComparison,
      existsInSystem: !!match,
      etfData: match
        ? {
            id: match.id,
            name: match.name,
            symbol: match.symbol,
            exchange: match.exchange,
            cachedScoreEntry: match.cachedScore,
          }
        : undefined,
    };
  });
}

export const GET = withErrorHandlingV2<EtfFullRenderResponse>(getHandler);
