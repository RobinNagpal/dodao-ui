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
import { TickerV1 } from '@/types/public-equity/analysis-factors-types';

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

export interface TickerV1ReportResponse extends FullReport {
  ticker: TickerV1;
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
  };
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1ReportResponse> {
  const { spaceId, ticker } = await context.params;

  console.log('ticker', ticker);
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
  };

  return {
    ticker: {
      id: tickerRecord.id,
      name: tickerRecord.name,
      symbol: tickerRecord.symbol,
      exchange: tickerRecord.exchange,
      industryKey: tickerRecord.industryKey,
      subIndustryKey: tickerRecord.subIndustryKey,
      websiteUrl: tickerRecord.websiteUrl || undefined,
      summary: tickerRecord.summary || undefined,
    },
    ...tickerRecord,
    websiteUrl: tickerRecord.websiteUrl || undefined,
    summary: tickerRecord.summary || undefined,
    vsCompetition: tickerRecord.vsCompetition || undefined,
    analysisStatus,
  };
}

export const GET = withErrorHandlingV2<TickerV1ReportResponse>(getHandler);
