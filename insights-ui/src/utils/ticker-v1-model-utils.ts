import { getIndustryMappings, getIndustryName, getSubIndustryName } from '@/lib/industryMappingUtils';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { AnalysisStatus } from '@/types/ticker-typesv1';
import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { Prisma, TickerV1, TickerV1Industry, TickerV1SubIndustry } from '@prisma/client';
import {
  TickerV1AnalysisCategoryFactorResult,
  TickerV1CachedScore,
  TickerV1CategoryAnalysisResult,
  TickerV1FutureRisk,
  TickerV1InvestorAnalysisResult,
  TickerV1VsCompetition,
} from '.prisma/client';

export type FullTickerV1CategoryAnalysisResult = TickerV1CategoryAnalysisResult & {
  factorResults: (TickerV1AnalysisCategoryFactorResult & {
    analysisCategoryFactor: {
      factorAnalysisKey: string;
      factorAnalysisTitle: string;
      factorAnalysisDescription: string;
    };
  })[];
};

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
  };
}

export type TickerV1WithRelations = TickerV1 & {
  categoryAnalysisResults: FullTickerV1CategoryAnalysisResult[];
  investorAnalysisResults: TickerV1InvestorAnalysisResult[];
  futureRisks: TickerV1FutureRisk[];
  vsCompetition?: TickerV1VsCompetition | null;
};

export interface SimilarTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScore: number;
}

export interface TickerV1FullReportResponse extends TickerV1WithRelations {
  ticker: TickerV1;
  industryName: string;
  subIndustryName: string;
  similarTickers: SimilarTicker[];
  competitorTickers: CompetitorTicker[];
  analysisStatus: AnalysisStatus;
}

export interface TickerV1FastResponse extends TickerV1WithRelations {
  industry: TickerV1Industry;
  subIndustry: TickerV1SubIndustry;
  analysisStatus: AnalysisStatus;
}

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
      futureRisks: true,
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

export function getTickerV1AnalysisStatus(
  tickerRecord: TickerV1 & {
    categoryAnalysisResults: FullTickerV1CategoryAnalysisResult[];
    investorAnalysisResults: TickerV1InvestorAnalysisResult[];
    futureRisks: TickerV1FutureRisk[];
    vsCompetition?: TickerV1VsCompetition | null;
  }
): AnalysisStatus {
  return {
    businessAndMoat: tickerRecord.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.BusinessAndMoat),
    financialAnalysis: tickerRecord.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.FinancialStatementAnalysis),
    pastPerformance: tickerRecord.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.PastPerformance),
    futureGrowth: tickerRecord.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.FutureGrowth),
    fairValue: tickerRecord.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.FairValue),
    competition: !!tickerRecord.vsCompetition,
    investorAnalysis: {
      WARREN_BUFFETT: tickerRecord.investorAnalysisResults.some((r) => r.investorKey === 'WARREN_BUFFETT'),
      CHARLIE_MUNGER: tickerRecord.investorAnalysisResults.some((r) => r.investorKey === 'CHARLIE_MUNGER'),
      BILL_ACKMAN: tickerRecord.investorAnalysisResults.some((r) => r.investorKey === 'BILL_ACKMAN'),
    },
    futureRisk: tickerRecord.futureRisks.length > 0,
    finalSummary: !!tickerRecord.summary,
    cachedScore: !!tickerRecord.cachedScore,
  };
}

export async function getCompetitorTickers(
  tickerRecord: TickerV1 & {
    vsCompetition?: TickerV1VsCompetition | null;
  }
): Promise<CompetitorTicker[]> {
  // Process competition analysis to check which competitors exist in our system
  const competitorTickers: CompetitorTicker[] = [];
  if (tickerRecord.vsCompetition?.competitionAnalysisArray) {
    for (const competition of tickerRecord.vsCompetition.competitionAnalysisArray as any[]) {
      const competitorInfo: CompetitorTicker = {
        companyName: competition.companyName,
        companySymbol: competition.companySymbol,
        exchangeSymbol: competition.exchangeSymbol,
        exchangeName: competition.exchangeName,
        detailedComparison: competition.detailedComparison,
        existsInSystem: false,
      };

      // Check if this competitor exists in our system (only by symbol, ignoring exchange name due to LLM inconsistencies)
      if (competition.companySymbol) {
        const existingTicker = await prisma.tickerV1.findFirst({
          where: {
            spaceId: KoalaGainsSpaceId,
            symbol: competition.companySymbol.toUpperCase(),
          },
          select: {
            id: true,
            name: true,
            symbol: true,
            exchange: true,
          },
        });

        if (existingTicker) {
          competitorInfo.existsInSystem = true;
          competitorInfo.tickerData = existingTicker;
        }
      }

      competitorTickers.push(competitorInfo);
    }
  }
  return competitorTickers;
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
      cachedScore: true,
    },
    orderBy: {
      cachedScore: 'desc',
    },
    take: 3,
  });

  const competitorTickers = await getCompetitorTickers(tickerRecord);

  // Check analysis status for each category/analysis type
  const analysisStatus = getTickerV1AnalysisStatus(tickerRecord);

  // Get industry and sub-industry mappings
  const mappings = await getIndustryMappings();
  const industryName = getIndustryName(tickerRecord.industryKey, mappings);
  const subIndustryName = getSubIndustryName(tickerRecord.subIndustryKey, mappings);

  return {
    ticker: tickerRecord,
    ...tickerRecord,
    websiteUrl: tickerRecord.websiteUrl || null,
    summary: tickerRecord.summary || null,
    vsCompetition: tickerRecord.vsCompetition || undefined,
    industryName,
    subIndustryName,
    similarTickers,
    competitorTickers,
    analysisStatus,
  };
}

export const updateTickerCachedScore = async (tickerRecord: TickerV1, categoryType: TickerAnalysisCategory, categoryScore: number) => {
  // Get or create cached score record
  const existingCachedScore = await prisma.tickerV1CachedScore.findUnique({
    where: { tickerId: tickerRecord.id },
  });

  // Get scores from other categories if they exist
  const businessAndMoatExisting = existingCachedScore?.businessAndMoatScore || 0;
  const financialStatementAnalysisExisting = existingCachedScore?.financialStatementAnalysisScore || 0;
  const pastPerformanceExisting = existingCachedScore?.pastPerformanceScore || 0;
  const futureGrowthExisting = existingCachedScore?.futureGrowthScore || 0;
  const fairValueExisting = existingCachedScore?.fairValueScore || 0;

  // Create score mapping for upsert
  const scoreUpdates: Partial<TickerV1CachedScore> = {
    updatedAt: new Date(),
  };

  // Update the specific category score
  switch (categoryType) {
    case TickerAnalysisCategory.BusinessAndMoat:
      scoreUpdates.businessAndMoatScore = categoryScore;
      break;
    case TickerAnalysisCategory.FinancialStatementAnalysis:
      scoreUpdates.financialStatementAnalysisScore = categoryScore;
      break;
    case TickerAnalysisCategory.PastPerformance:
      scoreUpdates.pastPerformanceScore = categoryScore;
      break;
    case TickerAnalysisCategory.FutureGrowth:
      scoreUpdates.futureGrowthScore = categoryScore;
      break;
    case TickerAnalysisCategory.FairValue:
      scoreUpdates.fairValueScore = categoryScore;
      break;
  }

  // Calculate final score (sum of all category scores)
  const finalScore = businessAndMoatExisting + financialStatementAnalysisExisting + pastPerformanceExisting + futureGrowthExisting + fairValueExisting;
  scoreUpdates.finalScore = finalScore;

  // Update or create cached score record
  await prisma.tickerV1CachedScore.upsert({
    where: { tickerId: tickerRecord.id },
    update: scoreUpdates,
    create: {
      tickerId: tickerRecord.id,
      businessAndMoatScore: categoryType === TickerAnalysisCategory.BusinessAndMoat ? categoryScore : 0,
      financialStatementAnalysisScore: categoryType === TickerAnalysisCategory.FinancialStatementAnalysis ? categoryScore : 0,
      pastPerformanceScore: categoryType === TickerAnalysisCategory.PastPerformance ? categoryScore : 0,
      futureGrowthScore: categoryType === TickerAnalysisCategory.FutureGrowth ? categoryScore : 0,
      fairValueScore: categoryType === TickerAnalysisCategory.FairValue ? categoryScore : 0,
      finalScore,
    },
  });
};

export const bumpUpdatedAtAndInvalidateCache = async (tickerRecord: TickerV1) => {
  revalidateTickerAndExchangeTag(tickerRecord.symbol, tickerRecord.exchange);
  await prisma.tickerV1.update({
    where: {
      id: tickerRecord.id,
    },
    data: {
      updatedAt: new Date(),
    },
  });
};
