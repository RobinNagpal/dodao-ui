import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { prisma } from '@/prisma';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { TickerV1 } from '@/types/public-equity/analysis-factors-types';

interface TickerReportResponse {
  ticker: TickerV1;
  analysisStatus: {
    businessAndMoat: boolean;
    financialAnalysis: boolean;
    pastPerformance: boolean;
    futureGrowth: boolean;
    fairValue: boolean;
    competition: boolean;
    investorAnalysis: boolean;
    futureRisk: boolean;
  };
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerReportResponse> {
  const { spaceId, ticker } = await context.params;

  // Get ticker from DB with all related data
  const tickerRecord = await prisma.tickerV1.findFirst({
    where: {
      spaceId,
      symbol: ticker.toUpperCase(),
    },
    include: {
      categoryAnalysisResults: true,
      factorResults: {
        include: {
          analysisCategoryFactor: true,
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
    competition: tickerRecord.vsCompetition.length > 0,
    investorAnalysis: tickerRecord.investorAnalysisResults.length > 0,
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
    analysisStatus,
  };
}

export const GET = withErrorHandlingV2<TickerReportResponse>(getHandler);
