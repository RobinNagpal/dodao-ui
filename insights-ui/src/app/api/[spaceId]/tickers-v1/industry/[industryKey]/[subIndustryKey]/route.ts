import { prisma } from '@/prisma';
import { BasicTickersResponse, ReportTickersResponse, TickerV1WithIndustryAndSubIndustry } from '@/types/ticker-typesv1';
import { getMissingReportCount, TickerWithMissingReportInfo } from '@/utils/analysis-reports/report-steps-statuses';
import { getMissingReportsForTicker } from '@/utils/missing-reports-utils';
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
        websiteUrl: true,
        stockAnalyzeUrl: true,
        cachedScoreEntry: {
          select: {
            finalScore: true,
          },
        },
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
    const tickers: TickerV1WithIndustryAndSubIndustry[] = await prisma.tickerV1.findMany({
      where: {
        spaceId,
        industryKey,
        subIndustryKey,
      },
      include: {
        industry: true,
        subIndustry: true,
        cachedScoreEntry: true,
      },

      orderBy: {
        name: 'asc',
      },
    });

    const reportTickers: TickerWithMissingReportInfo[] = [];
    let missingCount = 0;
    let partialCount = 0;
    let completeCount = 0;

    for (const ticker of tickers) {
      await getMissingReportsForTicker(spaceId, ticker.id).then((missingReports) => {
        if (missingReports) {
          reportTickers.push({
            ...ticker,
            ...missingReports,
          });
        }
      });
    }

    // Calculate missingCount, partialCount, and completeCount
    for (const ticker of reportTickers) {
      const { missingReportCount, totalReportCount } = getMissingReportCount(ticker);

      if (missingReportCount === totalReportCount) {
        missingCount++;
      } else if (missingReportCount === 0) {
        completeCount++;
      } else {
        partialCount++;
      }
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
