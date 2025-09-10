import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import {
  TickerV1CategoryAnalysisResult,
  TickerV1InvestorAnalysisResult,
  TickerV1FutureRisk,
  TickerV1VsCompetition,
  TickerV1AnalysisCategoryFactorResult,
} from '.prisma/client';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { TickerV1 } from '@prisma/client';

export type FullTickerV1CategoryAnalysisResult = TickerV1CategoryAnalysisResult & {
  factorResults: (TickerV1AnalysisCategoryFactorResult & {
    analysisCategoryFactor: {
      factorAnalysisKey: string;
      factorAnalysisTitle: string;
      factorAnalysisDescription: string;
    };
  })[];
};

type FullReport = TickerV1 & {
  investorAnalysisResults: TickerV1InvestorAnalysisResult[];
  futureRisks: TickerV1FutureRisk[];
  vsCompetition?: TickerV1VsCompetition;
  categoryAnalysisResults: FullTickerV1CategoryAnalysisResult[];
};

export interface SimilarTicker {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  cachedScore: number;
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
  };
}

export interface TickerV1ReportResponse extends FullReport {
  ticker: TickerV1;
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

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1ReportResponse> {
  const { spaceId, ticker } = await context.params;

  // Get ticker from DB with all related data
  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
    },
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

  if (!tickerRecord) {
    throw new Error(`Ticker ${ticker} not found`);
  }

  // Fetch top 3 similar tickers in the same industry/sub-industry (excluding current ticker)
  const similarTickers = await prisma.tickerV1.findMany({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
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
            spaceId: spaceId || KoalaGainsSpaceId,
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

  return {
    ticker: tickerRecord,
    ...tickerRecord,
    websiteUrl: tickerRecord.websiteUrl || null,
    summary: tickerRecord.summary || null,
    vsCompetition: tickerRecord.vsCompetition || undefined,
    similarTickers,
    competitorTickers,
    analysisStatus,
  };
}

export const GET = withErrorHandlingV2<TickerV1ReportResponse>(getHandler);
