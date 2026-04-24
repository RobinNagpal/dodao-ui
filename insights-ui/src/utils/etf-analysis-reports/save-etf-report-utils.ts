import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import {
  EtfAnalysisCategory,
  EtfCategoryAnalysisResponse,
  EtfFinalSummaryResponse,
  EtfIndexStrategyResponse,
  EtfIndexStrategySimilarEtf,
} from '@/types/etf/etf-analysis-types';
import { CompetitionAnalysis } from '@/types/public-equity/analysis-factors-types';
import { findFactorDefinition } from '@/utils/etf-analysis-reports/etf-report-input-json-utils';
import { fetchEtfBySymbolAndExchange } from '@/utils/etf-analysis-reports/get-etf-report-data-utils';
import { revalidateEtfAndExchangeTag, revalidateEtfListingTag } from '@/utils/etf-cache-utils';
import { USExchanges } from '@/utils/countryExchangeUtils';

const SUPPORTED_SIMILAR_ETF_EXCHANGES: ReadonlySet<string> = new Set<string>([USExchanges.BATS, USExchanges.NASDAQ, USExchanges.NYSE, USExchanges.NYSEARCA]);

export async function saveEtfFactorAnalysisResponse(
  symbol: string,
  exchange: string,
  response: EtfCategoryAnalysisResponse,
  categoryKey: EtfAnalysisCategory
): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const etfRecord = await fetchEtfBySymbolAndExchange(symbol, exchange);

  await prisma.etfCategoryAnalysisResult.upsert({
    where: {
      spaceId_etfId_categoryKey: {
        spaceId,
        etfId: etfRecord.id,
        categoryKey,
      },
    },
    update: {
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      etfId: etfRecord.id,
      categoryKey,
      summary: response.overallSummary,
      overallAnalysisDetails: response.overallAnalysisDetails,
    },
  });

  for (const factor of response.factors) {
    const factorDef = findFactorDefinition(categoryKey, factor.factorAnalysisKey);
    if (!factorDef) {
      console.warn(`Unknown factor key: ${factor.factorAnalysisKey} for ETF ${symbol}`);
      continue;
    }

    await prisma.etfAnalysisCategoryFactorResult.upsert({
      where: {
        spaceId_etfId_factorKey: {
          spaceId,
          etfId: etfRecord.id,
          factorKey: factor.factorAnalysisKey,
        },
      },
      update: {
        categoryKey,
        oneLineExplanation: factor.oneLineExplanation,
        detailedExplanation: factor.detailedExplanation,
        result: factor.result,
        updatedAt: new Date(),
      },
      create: {
        spaceId,
        etfId: etfRecord.id,
        categoryKey,
        factorKey: factor.factorAnalysisKey,
        oneLineExplanation: factor.oneLineExplanation,
        detailedExplanation: factor.detailedExplanation,
        result: factor.result,
      },
    });
  }

  const score = response.factors.filter((f) => f.result && f.result.toLowerCase().includes('pass')).length;
  await updateEtfCachedScore(etfRecord.id, categoryKey, score);

  // Per-ETF detail tag plus listing tag — score change affects the listing-page ranking.
  revalidateEtfAndExchangeTag(symbol, exchange);
  revalidateEtfListingTag();
}

export async function saveEtfFinalSummaryResponse(symbol: string, exchange: string, response: EtfFinalSummaryResponse): Promise<void> {
  const etfRecord = await fetchEtfBySymbolAndExchange(symbol, exchange);

  await prisma.etf.update({
    where: { id: etfRecord.id },
    data: {
      summary: response.summary,
      updatedAt: new Date(),
    },
  });

  revalidateEtfAndExchangeTag(symbol, exchange);
}

/**
 * LLM response shape for the Competition analysis. Matches
 * `schemas/etf-analysis/outputs/etf-competition-output.schema.yaml` — no top-level
 * `summary` field, just the long-form body + per-peer array.
 */
export interface EtfCompetitionLlmResponse {
  overallAnalysisDetails: string;
  competitionAnalysisArray: CompetitionAnalysis[];
}

export async function saveEtfCompetitionResponse(symbol: string, exchange: string, response: EtfCompetitionLlmResponse): Promise<void> {
  const spaceId = KoalaGainsSpaceId;
  const etfRecord = await fetchEtfBySymbolAndExchange(symbol, exchange);

  const competitionArray = Array.isArray(response.competitionAnalysisArray) ? response.competitionAnalysisArray : [];

  await prisma.etfVsCompetition.upsert({
    where: {
      spaceId_etfId: {
        spaceId,
        etfId: etfRecord.id,
      },
    },
    update: {
      overallAnalysisDetails: response.overallAnalysisDetails,
      competitionAnalysisArray: competitionArray,
      updatedAt: new Date(),
    },
    create: {
      spaceId,
      etfId: etfRecord.id,
      overallAnalysisDetails: response.overallAnalysisDetails,
      competitionAnalysisArray: competitionArray,
    },
  });

  revalidateEtfAndExchangeTag(symbol, exchange);
}

export async function saveEtfIndexStrategyResponse(symbol: string, exchange: string, response: EtfIndexStrategyResponse): Promise<void> {
  const etfRecord = await fetchEtfBySymbolAndExchange(symbol, exchange);

  await prisma.etf.update({
    where: { id: etfRecord.id },
    data: {
      indexStrategy: response.indexStrategy,
      updatedAt: new Date(),
    },
  });

  await replaceEtfSimilarEtfs(etfRecord.id, etfRecord.spaceId, symbol, exchange, response.similarEtfs ?? []);

  revalidateEtfAndExchangeTag(symbol, exchange);
}

/**
 * Replace the source ETF's stored similar-ETF list with the LLM-provided one.
 *
 * - Drops entries whose exchange is not one of the supported US exchanges
 *   (BATS / NASDAQ / NYSE / NYSEARCA).
 * - Drops self-references.
 * - Normalizes symbol + exchange to uppercase.
 * - De-duplicates on (symbol, exchange) preserving the first occurrence's order.
 * - Only inserts entries that already exist in the `etfs` table (we need a
 *   report page to link to, and the name comes from `Etf` at read time).
 */
async function replaceEtfSimilarEtfs(
  sourceEtfId: string,
  spaceId: string,
  sourceSymbol: string,
  sourceExchange: string,
  similarEtfs: ReadonlyArray<EtfIndexStrategySimilarEtf>
): Promise<void> {
  const sourceSymbolUpper: string = sourceSymbol.trim().toUpperCase();
  const sourceExchangeUpper: string = sourceExchange.trim().toUpperCase();

  const seen: Set<string> = new Set<string>();
  const cleaned: { symbol: string; exchange: string }[] = [];

  for (const entry of similarEtfs) {
    if (!entry || typeof entry.symbol !== 'string' || typeof entry.exchange !== 'string') continue;
    const symbolUpper: string = entry.symbol.trim().toUpperCase();
    const exchangeUpper: string = entry.exchange.trim().toUpperCase();
    if (!symbolUpper || !exchangeUpper) continue;
    if (!SUPPORTED_SIMILAR_ETF_EXCHANGES.has(exchangeUpper)) continue;
    if (symbolUpper === sourceSymbolUpper && exchangeUpper === sourceExchangeUpper) continue;
    const key: string = `${symbolUpper}|${exchangeUpper}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push({ symbol: symbolUpper, exchange: exchangeUpper });
  }

  // Only keep entries that actually exist in our Etf table so each card
  // resolves to a real report page.
  const existing = cleaned.length
    ? await prisma.etf.findMany({
        where: {
          spaceId,
          OR: cleaned.map((c) => ({ symbol: c.symbol, exchange: c.exchange })),
        },
        select: { symbol: true, exchange: true },
      })
    : [];
  const existingKeys: Set<string> = new Set<string>(existing.map((e) => `${e.symbol}|${e.exchange}`));
  const toInsert = cleaned.filter((c) => existingKeys.has(`${c.symbol}|${c.exchange}`));

  await prisma.$transaction(async (tx) => {
    await tx.etfSimilarEtf.deleteMany({ where: { sourceEtfId } });

    if (toInsert.length === 0) return;

    await tx.etfSimilarEtf.createMany({
      data: toInsert.map((c, idx) => ({
        sourceEtfId,
        spaceId,
        symbol: c.symbol,
        exchange: c.exchange,
        sortOrder: idx,
      })),
    });
  });
}

async function updateEtfCachedScore(etfId: string, categoryKey: EtfAnalysisCategory, categoryScore: number): Promise<void> {
  const existingScore = await prisma.etfCachedScore.findUnique({
    where: { etfId },
  });

  const performanceExisting = existingScore?.performanceAndReturnsScore || 0;
  const costExisting = existingScore?.costEfficiencyAndTeamScore || 0;
  const riskExisting = existingScore?.riskAnalysisScore || 0;
  const futureExisting = existingScore?.futurePerformanceOutlookScore || 0;

  const scores: Record<string, number> = {};
  switch (categoryKey) {
    case EtfAnalysisCategory.PerformanceAndReturns:
      scores.performanceAndReturnsScore = categoryScore;
      break;
    case EtfAnalysisCategory.CostEfficiencyAndTeam:
      scores.costEfficiencyAndTeamScore = categoryScore;
      break;
    case EtfAnalysisCategory.RiskAnalysis:
      scores.riskAnalysisScore = categoryScore;
      break;
    case EtfAnalysisCategory.FuturePerformanceOutlook:
      scores.futurePerformanceOutlookScore = categoryScore;
      break;
  }

  const finalScore =
    (categoryKey === EtfAnalysisCategory.PerformanceAndReturns ? categoryScore : performanceExisting) +
    (categoryKey === EtfAnalysisCategory.CostEfficiencyAndTeam ? categoryScore : costExisting) +
    (categoryKey === EtfAnalysisCategory.RiskAnalysis ? categoryScore : riskExisting) +
    (categoryKey === EtfAnalysisCategory.FuturePerformanceOutlook ? categoryScore : futureExisting);

  await prisma.etfCachedScore.upsert({
    where: { etfId },
    update: {
      ...scores,
      finalScore,
      updatedAt: new Date(),
    },
    create: {
      etfId,
      performanceAndReturnsScore: categoryKey === EtfAnalysisCategory.PerformanceAndReturns ? categoryScore : 0,
      costEfficiencyAndTeamScore: categoryKey === EtfAnalysisCategory.CostEfficiencyAndTeam ? categoryScore : 0,
      riskAnalysisScore: categoryKey === EtfAnalysisCategory.RiskAnalysis ? categoryScore : 0,
      futurePerformanceOutlookScore: categoryKey === EtfAnalysisCategory.FuturePerformanceOutlook ? categoryScore : 0,
      finalScore,
    },
  });
}
