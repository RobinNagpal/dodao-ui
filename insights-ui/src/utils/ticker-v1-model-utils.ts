import { getIndustryMappings, getIndustryName, getSubIndustryName } from '@/lib/industryMappingUtils';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { revalidateTickerAndExchangeTag } from '@/utils/ticker-v1-cache-utils';
import { Prisma, TickerV1 } from '@prisma/client';
import {
  TickerV1AnalysisCategoryFactorResult,
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

export interface TickerV1ReportResponse extends TickerV1WithRelations {
  ticker: TickerV1;
  industryName: string;
  subIndustryName: string;
  similarTickers: SimilarTicker[];
  competitorTickers: CompetitorTicker[];
  analysisStatus: {
    businessAndMoat: boolean;
    financialAnalysis: boolean;
    pastPerformance: boolean;
    futureGrowth: boolean;
    fairValue: boolean;
    competition: boolean;
    investorAnalysis: {
      WARREN_BUFFETT: boolean;
      CHARLIE_MUNGER: boolean;
      BILL_ACKMAN: boolean;
    };
    futureRisk: boolean;
    finalSummary: boolean;
    cachedScore: boolean;
  };
}

export async function getTickerWithAllDetailsForConditionsOpt(whereClause: Prisma.TickerV1WhereInput): Promise<TickerV1ReportResponse | null | undefined> {
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

export async function getTickerWithAllDetailsForConditions(whereClause: Prisma.TickerV1WhereInput): Promise<TickerV1ReportResponse> {
  const tickerRecord = await getTickerWithAllDetailsForConditionsOpt(whereClause);
  if (!tickerRecord) {
    throw new Error('No ticker found for conditions' + JSON.stringify(whereClause));
  }

  return tickerRecord;
}

export async function getTickerWithAllDetails(tickerRecord: TickerV1WithRelations): Promise<TickerV1ReportResponse> {
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

  // Check analysis status for each category/analysis type
  const analysisStatus = {
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
