import { prisma } from '@/prisma';
import { ReportTickersResponse, AnalysisStatus, ReportTickerInfo } from '@/types/ticker-typesv1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; industryKey: string; subIndustryKey: string }> }
): Promise<ReportTickersResponse> {
  const { spaceId, industryKey, subIndustryKey } = await context.params;

  const tickers = await prisma.tickerV1.findMany({
    where: {
      spaceId,
      industryKey,
      subIndustryKey,
    },
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      cachedScore: true,
      updatedAt: true,
      createdAt: true,
      summary: true,
      websiteUrl: true,
      spaceId: true,
      industryKey: true,
      subIndustryKey: true,
      categoryAnalysisResults: {
        select: {
          categoryKey: true,
        },
      },
      investorAnalysisResults: {
        select: {
          investorKey: true,
        },
      },
      futureRisks: {
        select: {
          id: true,
        },
      },
      vsCompetition: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  const reportTickers: ReportTickerInfo[] = [];
  let missingCount = 0;
  let partialCount = 0;
  let completeCount = 0;

  for (const ticker of tickers) {
    // Calculate analysis status
    const analysisStatus: AnalysisStatus = {
      businessAndMoat: ticker.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.BusinessAndMoat),
      financialAnalysis: ticker.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.FinancialStatementAnalysis),
      pastPerformance: ticker.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.PastPerformance),
      futureGrowth: ticker.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.FutureGrowth),
      fairValue: ticker.categoryAnalysisResults.some((r) => r.categoryKey === TickerAnalysisCategory.FairValue),
      competition: !!ticker.vsCompetition,
      investorAnalysis: {
        WARREN_BUFFETT: ticker.investorAnalysisResults.some((r) => r.investorKey === 'WARREN_BUFFETT'),
        CHARLIE_MUNGER: ticker.investorAnalysisResults.some((r) => r.investorKey === 'CHARLIE_MUNGER'),
        BILL_ACKMAN: ticker.investorAnalysisResults.some((r) => r.investorKey === 'BILL_ACKMAN'),
      },
      futureRisk: ticker.futureRisks.length > 0,
      finalSummary: !!ticker.summary,
      cachedScore: !!ticker.cachedScore,
    };

    // Calculate missing/partial status
    const allAnalysisItems = [
      analysisStatus.businessAndMoat,
      analysisStatus.financialAnalysis,
      analysisStatus.pastPerformance,
      analysisStatus.futureGrowth,
      analysisStatus.fairValue,
      analysisStatus.competition,
      analysisStatus.investorAnalysis.WARREN_BUFFETT,
      analysisStatus.investorAnalysis.CHARLIE_MUNGER,
      analysisStatus.investorAnalysis.BILL_ACKMAN,
      analysisStatus.futureRisk,
      analysisStatus.finalSummary,
      analysisStatus.cachedScore,
    ];

    const completedItems = allAnalysisItems.filter((item) => item).length;
    const totalItems = allAnalysisItems.length;

    const isMissing = completedItems === 0;
    const isPartial = completedItems > 0 && completedItems < totalItems;
    const isComplete = completedItems === totalItems;

    if (isMissing) missingCount++;
    else if (isPartial) partialCount++;
    else if (isComplete) completeCount++;

    reportTickers.push({
      id: ticker.id,
      name: ticker.name,
      symbol: ticker.symbol,
      exchange: ticker.exchange,
      cachedScore: ticker.cachedScore,
      updatedAt: ticker.updatedAt,
      createdAt: ticker.createdAt,
      summary: ticker.summary,
      websiteUrl: ticker.websiteUrl,
      spaceId: ticker.spaceId,
      industryKey: ticker.industryKey,
      subIndustryKey: ticker.subIndustryKey,
      analysisStatus,
      isMissing,
      isPartial,
    });
  }

  return {
    tickers: reportTickers,
    count: tickers.length,
    missingCount,
    partialCount,
    completeCount,
  };
}

export const GET = withErrorHandlingV2<ReportTickersResponse>(getHandler);
