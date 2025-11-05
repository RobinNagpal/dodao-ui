import { prisma } from '@/prisma';
import {
  AnalysisStatus,
  BasicTickersResponse,
  CATEGORY_MAPPINGS,
  EvaluationResult,
  ReportTickerInfo,
  ReportTickersResponse,
  TickerAnalysisCategory,
} from '@/types/ticker-typesv1';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; industryKey: string; subIndustryKey: string }> }
): Promise<BasicTickersResponse | ReportTickersResponse> {
  const { spaceId, industryKey, subIndustryKey } = await context.params;
  const { searchParams } = new URL(req.url);
  const withAnalysisStatus = searchParams.get('withAnalysisStatus') === 'true';
  const basicOnly = searchParams.get('basicOnly') === 'true';

  // Basic ticker info only (for ticker management)
  if (basicOnly) {
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
        websiteUrl: true,
        stockAnalyzeUrl: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      tickers,
      count: tickers.length,
    };
  }

  // With analysis status (for create reports)
  if (withAnalysisStatus) {
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
        metaDescription: true,
        websiteUrl: true,
        spaceId: true,
        industryKey: true,
        subIndustryKey: true,
        stockAnalyzeUrl: true,
        aboutReport: true,
        categoryAnalysisResults: {
          select: {
            categoryKey: true,
            factorResults: {
              select: {
                result: true,
              },
            },
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
      // Calculate the actual score based on categoryAnalysisResults
      const actualScore = Object.entries(CATEGORY_MAPPINGS)
        .map(([categoryKey]) => {
          const report = ticker.categoryAnalysisResults.find((r) => r.categoryKey === categoryKey);
          const scoresArray = report?.factorResults?.map((factorResult) => (factorResult.result === EvaluationResult.Pass ? 1 : 0)) || [];
          return scoresArray.reduce((partialSum: number, a) => partialSum + a, 0);
        })
        .reduce((partialSum: number, a) => partialSum + a, 0);

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
        finalSummary: !!ticker.summary && !!ticker.metaDescription && !!ticker.aboutReport && ticker.aboutReport.trim().length > 0,
        cachedScore: ticker.categoryAnalysisResults.length > 0 && ticker.cachedScore === actualScore,
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
        isMissingAllAnalysis: isMissing,
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

  // Fallback: return empty response if no query parameters match
  return {
    tickers: [],
    count: 0,
  };
}

export const GET = withErrorHandlingV2<BasicTickersResponse | ReportTickersResponse>(getHandler);
