import { getIndustryMappings, getIndustryName, getSubIndustryName } from '@/lib/industryMappingUtils';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import { TickerWithMissingReportInfo } from '@/utils/analysis-reports/report-steps-statuses';
import { getMissingReportsForTicker } from '@/utils/missing-reports-utils';
import {
  revalidateTickerAndExchangeTag,
  revalidateTickerCategoryReportTag,
  revalidateTickerCompetitionTag,
  revalidateTickerManagementTeamTag,
} from '@/utils/ticker-v1-cache-utils';
import {
  EvaluationResult,
  Prisma,
  TickerV1,
  TickerV1AnalysisCategoryFactorResult,
  TickerV1CachedScore,
  TickerV1CategoryAnalysisResult,
  TickerV1Industry,
  TickerV1ManagementTeamReport,
  TickerV1SubIndustry,
  TickerV1VsCompetition,
} from '@prisma/client';

export const tickerV1IncludeWithRelations = {
  categoryAnalysisResults: {
    include: {
      factorResults: {
        include: {
          analysisCategoryFactor: true,
        },
      },
    },
  },
  industry: true,
  subIndustry: true,
  cachedScoreEntry: true,
  managementTeamReports: true,
} as const;

export type FullTickerV1CategoryAnalysisResult = TickerV1CategoryAnalysisResult & {
  factorResults: (TickerV1AnalysisCategoryFactorResult & {
    analysisCategoryFactor: {
      factorAnalysisKey: string;
      factorAnalysisTitle: string;
      factorAnalysisDescription: string;
    };
  })[];
};

export interface CompetitorTickerCachedScore {
  businessAndMoatScore: number;
  financialStatementAnalysisScore: number;
  pastPerformanceScore: number;
  futureGrowthScore: number;
  fairValueScore: number;
  finalScore: number;
}

export interface CompetitorTicker {
  companyName: string;
  companySymbol?: string;
  exchangeSymbol?: string;
  exchangeName?: string;
  detailedComparison?: string;
  existsInSystem?: boolean;
  tickerData?: {
    id: string;
    name: string;
    symbol: string;
    exchange: string;
    cachedScoreEntry?: CompetitorTickerCachedScore | null;
  };
}

export type TickerV1WithRelations = TickerV1 & {
  categoryAnalysisResults: FullTickerV1CategoryAnalysisResult[];
  managementTeamReports?: TickerV1ManagementTeamReport[];
  vsCompetition?: TickerV1VsCompetition | null;
  cachedScoreEntry?: TickerV1CachedScore | null;
};

export interface SimilarTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScoreEntry: {
    finalScore: number;
  } | null;
}

export interface TickerV1FullReportResponse extends TickerV1WithRelations, TickerWithMissingReportInfo {
  ticker: TickerV1;
  industryName: string;
  subIndustryName: string;
  similarTickers: SimilarTicker[];
  competitorTickers: CompetitorTicker[];
}

export interface TickerV1FastResponse extends TickerV1WithRelations, TickerWithMissingReportInfo {}

type SubIndustryWithIndustry = TickerV1SubIndustry & { industry: TickerV1Industry };

export async function getTickerWithAllDetailsForConditionsOpt(whereClause: Prisma.TickerV1WhereInput): Promise<TickerV1FullReportResponse | null | undefined> {
  const tickerRecord: TickerV1WithRelations | null = await prisma.tickerV1.findFirst({
    where: whereClause,
    include: {
      categoryAnalysisResults: {
        include: {
          factorResults: {
            include: {
              analysisCategoryFactor: true,
            },
          },
        },
      },
      investorAnalysisResults: true,
      managementTeamReports: true,
      vsCompetition: true,
    },
  });

  return tickerRecord && getTickerWithAllDetails(tickerRecord);
}

export async function getTickerWithAllDetailsForConditions(whereClause: Prisma.TickerV1WhereInput): Promise<TickerV1FullReportResponse> {
  const tickerRecord = await getTickerWithAllDetailsForConditionsOpt(whereClause);
  if (!tickerRecord) {
    throw new Error('No ticker found for conditions' + JSON.stringify(whereClause));
  }

  return tickerRecord;
}

export async function getCompetitorTickers(
  tickerRecord: TickerV1 & {
    vsCompetition?: TickerV1VsCompetition | null;
  }
): Promise<CompetitorTicker[]> {
  // Process competition analysis to check which competitors exist in our system
  if (!tickerRecord.vsCompetition?.competitionAnalysisArray?.length) {
    return [];
  }

  const competitionArray = tickerRecord.vsCompetition.competitionAnalysisArray;

  // Collect all symbols to query in a single batch (instead of N+1 queries)
  const symbolsToCheck = competitionArray.map((c) => c.companySymbol?.toUpperCase()).filter((symbol): symbol is string => !!symbol);

  // Single batch query for all competitor tickers
  const existingTickers =
    symbolsToCheck.length > 0
      ? await prisma.tickerV1.findMany({
          where: {
            spaceId: KoalaGainsSpaceId,
            symbol: { in: symbolsToCheck },
          },
          select: {
            id: true,
            name: true,
            symbol: true,
            exchange: true,
            cachedScoreEntry: {
              select: {
                businessAndMoatScore: true,
                financialStatementAnalysisScore: true,
                pastPerformanceScore: true,
                futureGrowthScore: true,
                fairValueScore: true,
                finalScore: true,
              },
            },
          },
        })
      : [];

  // Create a map for O(1) lookup
  const tickerMap = new Map(existingTickers.map((t) => [t.symbol.toUpperCase(), t]));

  // Build competitor list using the pre-fetched data
  return competitionArray.map((competition) => {
    const symbolUpper = competition.companySymbol?.toUpperCase();
    const existingTicker = symbolUpper ? tickerMap.get(symbolUpper) : undefined;

    return {
      companyName: competition.companyName,
      companySymbol: competition.companySymbol,
      exchangeSymbol: competition.exchangeSymbol,
      exchangeName: competition.exchangeName,
      detailedComparison: competition.detailedComparison,
      existsInSystem: !!existingTicker,
      tickerData: existingTicker
        ? {
            id: existingTicker.id,
            name: existingTicker.name,
            symbol: existingTicker.symbol,
            exchange: existingTicker.exchange,
            cachedScoreEntry: existingTicker.cachedScoreEntry,
          }
        : undefined,
    };
  });
}

export async function getTickerWithAllDetails(tickerRecord: TickerV1WithRelations): Promise<TickerV1FullReportResponse> {
  // Fetch top 3 similar tickers in the same industry/sub-industry (excluding current ticker)
  const similarTickers = await prisma.tickerV1.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      id: {
        not: tickerRecord.id, // Exclude current ticker
      },
    },
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      cachedScoreEntry: {
        select: {
          finalScore: true,
        },
      },
    },
    orderBy: {
      cachedScoreEntry: {
        finalScore: 'desc',
      },
    },
    take: 3,
  });

  const competitorTickers = await getCompetitorTickers(tickerRecord);

  // Get missing reports for this ticker
  const missingReports = await getMissingReportsForTicker(tickerRecord.spaceId, tickerRecord.id);

  if (!missingReports) {
    throw new Error(`Failed to get missing reports for ticker ${tickerRecord.symbol}`);
  }

  // Get industry and sub-industry mappings
  const mappings = await getIndustryMappings();
  const industryName = getIndustryName(tickerRecord.industryKey, mappings);
  const subIndustryName = getSubIndustryName(tickerRecord.subIndustryKey, mappings);

  return {
    ticker: tickerRecord,
    ...tickerRecord,
    ...missingReports,
    vsCompetition: tickerRecord.vsCompetition || undefined,
    industryName,
    subIndustryName,
    similarTickers,
    competitorTickers,
    websiteUrl: tickerRecord.websiteUrl || null,
    summary: tickerRecord.summary || null,
  };
}

/**
 * Recomputes the ticker's cached score from the factor results currently stored
 * in the DB and upserts the cached row.
 *
 * This is the source of truth for the score shown on the stock listing and
 * competition pages. Run it whenever any category's factor results are created,
 * updated, or deleted so the denormalized cache never drifts from the underlying
 * data. The previous incremental approach only ever bumped the category that was
 * being saved, so deleting/regenerating a category's factor results (e.g. moving
 * a ticker, or regenerating a report to fewer/zero factors) left stale points in
 * the cache and inflated the final score.
 *
 * Each category score = number of factors with result === Pass; the final score
 * is the sum across all five categories. Categories with no factor results
 * contribute 0.
 */
export const recomputeTickerCachedScore = async (tickerRecord: TickerV1): Promise<void> => {
  const categoryResults = await prisma.tickerV1CategoryAnalysisResult.findMany({
    where: { spaceId: KoalaGainsSpaceId, tickerId: tickerRecord.id },
    include: { factorResults: { select: { result: true } } },
  });

  const categoryScores = {
    businessAndMoat: 0,
    financialStatementAnalysis: 0,
    pastPerformance: 0,
    futureGrowth: 0,
    fairValue: 0,
  };

  for (const categoryResult of categoryResults) {
    const passedFactors = categoryResult.factorResults.filter((factor) => factor.result === EvaluationResult.Pass).length;

    switch (categoryResult.categoryKey) {
      case TickerAnalysisCategory.BusinessAndMoat:
        categoryScores.businessAndMoat = passedFactors;
        break;
      case TickerAnalysisCategory.FinancialStatementAnalysis:
        categoryScores.financialStatementAnalysis = passedFactors;
        break;
      case TickerAnalysisCategory.PastPerformance:
        categoryScores.pastPerformance = passedFactors;
        break;
      case TickerAnalysisCategory.FutureGrowth:
        categoryScores.futureGrowth = passedFactors;
        break;
      case TickerAnalysisCategory.FairValue:
        categoryScores.fairValue = passedFactors;
        break;
    }
  }

  const finalScore =
    categoryScores.businessAndMoat +
    categoryScores.financialStatementAnalysis +
    categoryScores.pastPerformance +
    categoryScores.futureGrowth +
    categoryScores.fairValue;

  await prisma.tickerV1CachedScore.upsert({
    where: { tickerId: tickerRecord.id },
    update: {
      businessAndMoatScore: categoryScores.businessAndMoat,
      financialStatementAnalysisScore: categoryScores.financialStatementAnalysis,
      pastPerformanceScore: categoryScores.pastPerformance,
      futureGrowthScore: categoryScores.futureGrowth,
      fairValueScore: categoryScores.fairValue,
      finalScore,
      updatedAt: new Date(),
    },
    create: {
      tickerId: tickerRecord.id,
      businessAndMoatScore: categoryScores.businessAndMoat,
      financialStatementAnalysisScore: categoryScores.financialStatementAnalysis,
      pastPerformanceScore: categoryScores.pastPerformance,
      futureGrowthScore: categoryScores.futureGrowth,
      fairValueScore: categoryScores.fairValue,
      finalScore,
    },
  });
};

/**
 * Discriminator for which narrow per-subpage tag to invalidate alongside the
 * umbrella `tickerAndExchangeTag` (which the main `/stocks/[exchange]/[ticker]`
 * page subscribes to). Pass the right one so only the affected subpage's cache
 * is invalidated, not all seven.
 */
export type TickerCacheSlice = { kind: 'category'; category: TickerAnalysisCategory } | { kind: 'competition' } | { kind: 'managementTeam' } | { kind: 'core' };

const invalidateNarrowTag = (tickerRecord: TickerV1, slice: TickerCacheSlice): void => {
  switch (slice.kind) {
    case 'category':
      revalidateTickerCategoryReportTag(tickerRecord.symbol, tickerRecord.exchange, slice.category);
      return;
    case 'competition':
      revalidateTickerCompetitionTag(tickerRecord.symbol, tickerRecord.exchange);
      return;
    case 'managementTeam':
      revalidateTickerManagementTeamTag(tickerRecord.symbol, tickerRecord.exchange);
      return;
    case 'core':
      // Ticker-core changes (summary/aboutReport) only need the umbrella tag —
      // the subpage caches still hold valid data for their own slice.
      return;
  }
};

export const bumpUpdatedAtAndInvalidateCache = async (tickerRecord: TickerV1, slice: TickerCacheSlice, options?: { skipRevalidation?: boolean }) => {
  // Each saver writes one specific slice of data; the only page that actually
  // renders that slice is the matching subpage. Invalidate its narrow tag
  // unconditionally so the subpage rebuilds the next time it's hit, regardless
  // of whether more pipeline steps are queued.
  invalidateNarrowTag(tickerRecord, slice);

  // The umbrella (main aggregate page) is the one we defer during a multi-step
  // generation. The page renders every slice at once, so rebuilding it after
  // each step would re-render the same shell with one section's update — we'd
  // rather invalidate once when the pipeline finishes. `skipRevalidation: true`
  // skips ONLY the umbrella for this reason.
  if (!options?.skipRevalidation) {
    revalidateTickerAndExchangeTag(tickerRecord.symbol, tickerRecord.exchange);
  }
  await prisma.tickerV1.update({
    where: {
      id: tickerRecord.id,
    },
    data: {
      updatedAt: new Date(),
    },
  });
};
