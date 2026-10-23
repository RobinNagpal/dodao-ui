/**
 * In-process data loaders behind the per-ETF GET API routes (`/etfs-v1/exchange/[exchange]/[etf]`,
 * `/full-render`, `/chart-data`, `/competition`, `/mor-info`, `/portfolio-holdings`).
 *
 * Each route's GET handler is a thin wrapper around one of these, and the `/etfs/[exchange]/[etf]`
 * report pages call them directly (through `ssr-data-cache.ts`) instead of `fetch()`ing the routes
 * over the public host — so a page render no longer loops back through the load balancer into the
 * same container. Response shapes are unchanged; the response types stay in the route files.
 */
import type { EtfAnalysisResponse, EtfCategoryAnalysisResultResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route';
import type { EtfChartDataResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/chart-data/route';
import type {
  EtfFullRenderResponse,
  EtfKeyFactsReportResponse,
  EtfKeyMetricsResponse,
} from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/full-render/route';
import type { EtfMorInfoOptionalWrapper } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/mor-info/route';
import type { EtfPortfolioHoldingsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/portfolio-holdings/route';
import type { EtfFastResponse, EtfWithRelations } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import type { PriceHistoryResponse } from '@/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/price-history/route';
import { getEtfWhereClause, serializeBigIntFields } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import type { EtfApplicableInvestorGoals, EtfCompetitionResponse, EtfCompetitor, EtfKeyFactsFlagAssessment } from '@/types/etf/etf-analysis-types';
import type { EtfFinancialInfoResponse, EtfScoresResponse } from '@/types/etf/etf-detail-response-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getCountryByExchange, isExchange, SupportedCountries } from '@/utils/countryExchangeUtils';
import type { EtfMorPortfolioHoldings, PriceHistoryPoint } from '@/types/prismaTypes';
import type { CompetitionAnalysis } from '@/types/public-equity/analysis-factors-types';
import {
  buildEtfPerformanceMetricsPayload,
  parsePercentString,
  type EtfPerformanceMetricFields,
  type EtfPerformanceMetricsPayload,
} from '@/utils/etf-performance-metrics-utils';
import { ensureEtfPriceHistoryIsFresh } from '@/utils/etf-price-history-utils';
import { toEtfAlternativeListings } from '@/utils/etf-alternative-listing-utils';
import { hydrateSimilarEtfs } from '@/utils/etf-similar-etfs-utils';

/* ------------------------------------------------------------------ */
/*  /etfs-v1/exchange/[exchange]/[etf]  (EtfFastResponse)              */
/* ------------------------------------------------------------------ */

/**
 * ETF row + financialInfo + stockAnalyzerInfo. `allowNull: false` throws (Prisma P2025 → the route's
 * 404) when the ETF does not exist, matching the route without `?allowNull=true`.
 */
export async function getEtfFastData(spaceId: string, exchange: string, etf: string, allowNull: boolean): Promise<EtfFastResponse | null> {
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });
  const include = { financialInfo: true, stockAnalyzerInfo: true } as const;

  const etfRecord: EtfWithRelations | null = allowNull
    ? await prisma.etf.findFirst({ where: whereClause, include })
    : await prisma.etf.findFirstOrThrow({ where: whereClause, include });

  if (!etfRecord) return null;

  // Serialize BigInt fields to avoid JSON serialization errors
  return serializeBigIntFields(etfRecord);
}

/* ------------------------------------------------------------------ */
/*  /mor-info                                                          */
/* ------------------------------------------------------------------ */

/** Morningstar analyzer/risk/people/portfolio rows. Throws (route 404) when the ETF does not exist. */
export async function getEtfMorInfoData(spaceId: string, exchange: string, etf: string): Promise<EtfMorInfoOptionalWrapper> {
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });
  if (!whereClause.symbol || !whereClause.exchange) {
    return { morAnalyzerInfo: null, morRiskInfo: null, morPeopleInfo: null, morPortfolioInfo: null };
  }

  const etfRecord = await prisma.etf.findFirstOrThrow({
    where: { ...whereClause },
    include: {
      morAnalyzerInfo: true,
      morRiskInfo: true,
      morPeopleInfo: true,
      morPortfolioInfo: true,
    },
  });

  return {
    morAnalyzerInfo: etfRecord.morAnalyzerInfo,
    morRiskInfo: etfRecord.morRiskInfo,
    morPeopleInfo: etfRecord.morPeopleInfo,
    morPortfolioInfo: etfRecord.morPortfolioInfo,
  };
}

/* ------------------------------------------------------------------ */
/*  /portfolio-holdings                                                */
/* ------------------------------------------------------------------ */

export async function getEtfPortfolioHoldingsData(spaceId: string, exchange: string, etf: string): Promise<EtfPortfolioHoldingsResponse> {
  const whereClause = getEtfWhereClause({ spaceId, exchange, etf });
  if (!whereClause.symbol || !whereClause.exchange) {
    return { holdings: null, updatedAt: null };
  }

  const etfRecord = await prisma.etf.findFirst({
    where: { ...whereClause },
    select: { morPortfolioInfo: { select: { holdings: true, updatedAt: true } } },
  });

  const holdings = (etfRecord?.morPortfolioInfo?.holdings ?? null) as EtfMorPortfolioHoldings | null;
  const updatedAt = etfRecord?.morPortfolioInfo?.updatedAt?.toISOString() ?? null;
  return { holdings, updatedAt };
}

/* ------------------------------------------------------------------ */
/*  /full-render                                                       */
/* ------------------------------------------------------------------ */

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

const EMPTY_FULL_RENDER: EtfFullRenderResponse = {
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

export async function getEtfFullRenderData(spaceId: string, exchange: string, etf: string): Promise<EtfFullRenderResponse> {
  const where = getEtfWhereClause({ spaceId, exchange, etf });
  if (!where.symbol || !where.exchange) return EMPTY_FULL_RENDER;

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
  if (!etfRecord) return EMPTY_FULL_RENDER;

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
    hydrateEtfCompetitors((etfRecord.vsCompetition?.competitionAnalysisArray ?? []) as unknown as CompetitionAnalysis[], etfRecord.exchange),
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
          aum: etfRecord.financialInfo?.aum ?? null,
          expenseRatio: etfRecord.financialInfo?.expenseRatio ?? null,
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

/* ------------------------------------------------------------------ */
/*  /chart-data                                                        */
/* ------------------------------------------------------------------ */

const EMPTY_CHART_DATA: EtfChartDataResponse = { priceHistory: null, performanceMetrics: null };

export async function getEtfChartData(spaceId: string, exchange: string, etf: string): Promise<EtfChartDataResponse> {
  const where = getEtfWhereClause({ spaceId, exchange, etf });
  if (!where.symbol || !where.exchange) return EMPTY_CHART_DATA;

  const etfRecord = await prisma.etf.findFirst({ where, include: { stockAnalyzerInfo: true } });
  if (!etfRecord) return EMPTY_CHART_DATA;

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

/* ------------------------------------------------------------------ */
/*  /competition                                                       */
/* ------------------------------------------------------------------ */

export async function getEtfCompetitionData(spaceId: string, exchange: string, etf: string): Promise<EtfCompetitionResponse> {
  const where = getEtfWhereClause({ spaceId, exchange, etf });

  const etfRecord = await prisma.etf.findFirst({
    where,
    include: {
      vsCompetition: true,
      cachedScore: true,
      financialInfo: { select: { aum: true, expenseRatio: true } },
    },
  });

  if (!etfRecord) {
    return { vsCompetition: null, competitors: [], etf: undefined };
  }

  const competitionArray = (etfRecord.vsCompetition?.competitionAnalysisArray ?? []) as unknown as CompetitionAnalysis[];
  const competitors = await hydrateEtfCompetitors(competitionArray, etfRecord.exchange);

  return {
    vsCompetition: etfRecord.vsCompetition
      ? {
          overallAnalysisDetails: etfRecord.vsCompetition.overallAnalysisDetails,
          createdAt: etfRecord.vsCompetition.createdAt,
          updatedAt: etfRecord.vsCompetition.updatedAt,
        }
      : null,
    competitors,
    etf: {
      id: etfRecord.id,
      name: etfRecord.name,
      symbol: etfRecord.symbol,
      exchange: etfRecord.exchange,
      cachedScoreEntry: etfRecord.cachedScore
        ? {
            performanceAndReturnsScore: etfRecord.cachedScore.performanceAndReturnsScore,
            costEfficiencyAndTeamScore: etfRecord.cachedScore.costEfficiencyAndTeamScore,
            riskAnalysisScore: etfRecord.cachedScore.riskAnalysisScore,
            futurePerformanceOutlookScore: etfRecord.cachedScore.futurePerformanceOutlookScore,
            finalScore: etfRecord.cachedScore.finalScore,
          }
        : null,
      aum: etfRecord.financialInfo?.aum ?? null,
      expenseRatio: etfRecord.financialInfo?.expenseRatio ?? null,
      createdAt: etfRecord.createdAt,
      updatedAt: etfRecord.updatedAt,
    },
  };
}

/**
 * For each LLM-produced peer, look up whether we already cover that ETF so the
 * UI can link to its report, plot its cached score on the quadrant chart and
 * show its AUM / expense ratio. Single batched query — no N+1.
 *
 * The same symbol can be listed on several exchanges (e.g. IXJ on NYSEARCA and
 * ASX), and an unrelated fund can share a ticker in another country (SPLG on
 * NYSEARCA vs SPLG on LSE). When the report names an exchange we recognize, only
 * a listing in that exchange's country counts — preferring the exact exchange —
 * so a peer we don't cover is shown as uncovered instead of borrowing a
 * look-alike's scores, AUM and link. Without a recognizable exchange, prefer the
 * main ETF's country, then any listing.
 */
async function hydrateEtfCompetitors(competitionArray: CompetitionAnalysis[], mainExchange: string): Promise<EtfCompetitor[]> {
  if (!competitionArray.length) return [];

  const symbolsToCheck = competitionArray.map((c) => c.companySymbol?.toUpperCase()).filter((symbol): symbol is string => !!symbol);

  const competitorSelect = {
    id: true,
    name: true,
    symbol: true,
    exchange: true,
    alternativeListings: true,
    cachedScore: {
      select: {
        performanceAndReturnsScore: true,
        costEfficiencyAndTeamScore: true,
        riskAnalysisScore: true,
        futurePerformanceOutlookScore: true,
        finalScore: true,
      },
    },
    financialInfo: { select: { aum: true, expenseRatio: true } },
  } as const;

  const existingEtfs =
    symbolsToCheck.length > 0
      ? await prisma.etf.findMany({
          where: {
            spaceId: KoalaGainsSpaceId,
            symbol: { in: symbolsToCheck },
          },
          select: competitorSelect,
        })
      : [];

  // A competitor named by a ticker that is now another fund's alternative listing (e.g. LSE:SWDA,
  // folded into LSE:IWDA) still links to that fund.
  const foundSymbols = new Set(existingEtfs.map((e) => e.symbol.toUpperCase()));
  const missingSymbols = [...new Set(symbolsToCheck.filter((s) => !foundSymbols.has(s)))];
  const owners =
    missingSymbols.length > 0
      ? await prisma.etf.findMany({
          where: { spaceId: KoalaGainsSpaceId, OR: missingSymbols.map((symbol) => ({ alternativeListings: { array_contains: [{ symbol }] } })) },
          select: competitorSelect,
        })
      : [];

  // Candidates per named symbol; `matchExchange` is the exchange the name trades on there (the fund's
  // own, or the alternative listing's), `etf` the record the entry links to.
  type CompetitorCandidate = { matchExchange: string; etf: (typeof existingEtfs)[number] };
  const listingsBySymbol = new Map<string, CompetitorCandidate[]>();
  const addCandidate = (symbol: string, candidate: CompetitorCandidate): void => {
    const key = symbol.toUpperCase();
    listingsBySymbol.set(key, [...(listingsBySymbol.get(key) ?? []), candidate]);
  };
  for (const e of existingEtfs) addCandidate(e.symbol, { matchExchange: e.exchange, etf: e });
  for (const owner of owners) {
    for (const alt of toEtfAlternativeListings(owner.alternativeListings)) {
      if (missingSymbols.includes(alt.symbol.toUpperCase())) addCandidate(alt.symbol, { matchExchange: alt.exchange, etf: owner });
    }
  }
  const mainCountry = countryOfExchange(mainExchange);

  return competitionArray.map((entry) => {
    const symbolUpper = entry.companySymbol?.toUpperCase();
    const listings = symbolUpper ? listingsBySymbol.get(symbolUpper) ?? [] : [];
    const namedExchange = entry.exchangeSymbol?.trim().toUpperCase() ?? '';
    const namedCountry = countryOfExchange(namedExchange);
    const match = namedCountry
      ? listings.find((l) => l.matchExchange.toUpperCase() === namedExchange) ?? listings.find((l) => countryOfExchange(l.matchExchange) === namedCountry)
      : listings.find((l) => mainCountry && countryOfExchange(l.matchExchange) === mainCountry) ?? listings[0];
    const existing = match?.etf;

    return {
      companyName: entry.companyName,
      companySymbol: entry.companySymbol,
      exchangeSymbol: entry.exchangeSymbol,
      exchangeName: entry.exchangeName,
      detailedComparison: entry.detailedComparison,
      existsInSystem: !!existing,
      etfData: existing
        ? {
            id: existing.id,
            name: existing.name,
            symbol: existing.symbol,
            exchange: existing.exchange,
            cachedScoreEntry: existing.cachedScore,
            aum: existing.financialInfo?.aum ?? null,
            expenseRatio: existing.financialInfo?.expenseRatio ?? null,
          }
        : undefined,
    };
  });
}

function countryOfExchange(exchange: string): SupportedCountries | undefined {
  const normalized = exchange.trim().toUpperCase();
  return isExchange(normalized) ? getCountryByExchange(normalized) : undefined;
}
