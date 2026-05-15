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
import { EtfFinancialInfoResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/financial-info/route';
import { EtfPortfolioHoldingsResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/portfolio-holdings/route';
import { PriceHistoryResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/price-history/route';
import { EtfFastResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/route';
import { EtfScoresResponse } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/scores/route';
import { SimilarEtf } from '@/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/similar-etfs/route';
import { getEtfWhereClause, serializeBigIntFields } from '@/app/api/[spaceId]/etfs-v1/etfApiUtils';
import { prisma } from '@/prisma';
import type { EtfCompetitionResponse, EtfCompetitor } from '@/types/etf/etf-analysis-types';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PriceHistoryPoint } from '@/types/prismaTypes';
import { CompetitionAnalysis } from '@/types/public-equity/analysis-factors-types';
import { ensureEtfPriceHistoryIsFresh } from '@/utils/etf-price-history-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

export interface EtfFullRenderResponse {
  etf: EtfFastResponse | null;
  financialInfo: EtfFinancialInfoResponse | null;
  analysis: EtfAnalysisResponse;
  scores: EtfScoresResponse | null;
  similarEtfs: SimilarEtf[];
  portfolioHoldings: EtfPortfolioHoldingsResponse;
  competition: EtfCompetitionResponse | null;
  priceHistory: PriceHistoryResponse | null;
}

const EMPTY: EtfFullRenderResponse = {
  etf: null,
  financialInfo: null,
  analysis: { categories: [] },
  scores: null,
  similarEtfs: [],
  portfolioHoldings: { holdings: null, updatedAt: null },
  competition: null,
  priceHistory: null,
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
      vsCompetition: true,
      similarEtfs: { orderBy: { sortOrder: 'asc' }, take: 6 },
    },
  });
  if (!etfRecord) return EMPTY;

  const etfId = etfRecord.id;

  const [analysisRows, similarHydrated, competitorHydrated, priceInfo] = await Promise.all([
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
    ensureEtfPriceHistoryIsFresh(etfRecord).catch(() => null),
  ]);

  // Shape responses to match the original per-route payloads so the main page
  // can keep its existing component contracts.
  const etfRaw: EtfFastResponse = serializeBigIntFields({
    ...etfRecord,
    // Strip relations not in the original EtfFastResponse shape so the
    // serialized blob is leaner; the main page only reads financialInfo /
    // stockAnalyzerInfo / top-level fields from this slot.
    morPortfolioInfo: undefined,
    vsCompetition: undefined,
    similarEtfs: undefined,
    cachedScore: undefined,
  });

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

  return {
    etf: etfRaw,
    financialInfo,
    analysis,
    scores,
    similarEtfs: similarHydrated,
    portfolioHoldings,
    competition,
    priceHistory,
  };
}

async function hydrateSimilarEtfs(spaceId: string, stored: Array<{ id: string; symbol: string; exchange: string; sortOrder: number }>): Promise<SimilarEtf[]> {
  if (stored.length === 0) return [];

  const etfs = await prisma.etf.findMany({
    where: {
      spaceId,
      OR: stored.map((s) => ({ symbol: s.symbol, exchange: s.exchange })),
    },
    select: {
      symbol: true,
      exchange: true,
      name: true,
      financialInfo: true,
    },
  });
  const byKey = new Map(etfs.map((e) => [`${e.symbol}|${e.exchange}`, e]));

  return stored.map((s) => {
    const match = byKey.get(`${s.symbol}|${s.exchange}`);
    const fi = match?.financialInfo ?? null;
    return {
      id: s.id,
      symbol: s.symbol,
      exchange: s.exchange,
      name: match?.name ?? s.symbol,
      aum: fi?.aum ?? null,
      expenseRatio: fi?.expenseRatio ?? null,
      pe: fi?.pe ?? null,
      sharesOut: fi?.sharesOut ?? null,
      dividendTtm: fi?.dividendTtm ?? null,
      dividendYield: fi?.dividendYield ?? null,
      payoutFrequency: fi?.payoutFrequency ?? null,
      payoutRatio: fi?.payoutRatio ?? null,
      volume: fi?.volume ?? null,
      yearHigh: fi?.yearHigh ?? null,
      yearLow: fi?.yearLow ?? null,
      beta: fi?.beta ?? null,
      holdings: fi?.holdings ?? null,
    };
  });
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
