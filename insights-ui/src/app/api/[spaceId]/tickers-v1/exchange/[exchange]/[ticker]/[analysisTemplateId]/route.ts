import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplate, TickerV1, TickerV1DetailedReport, AnalysisType, DetailedReportCategory } from '@prisma/client';
import { NextRequest } from 'next/server';

export interface TickerAnalysisData {
  ticker: TickerV1;
  analysisTemplate: AnalysisTemplate;
  analyses: Array<
    TickerV1DetailedReport & {
      analysisType: AnalysisType & {
        category: DetailedReportCategory;
      };
    }
  >;
}

async function getHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; ticker: string; analysisTemplateId: string }> }
): Promise<TickerAnalysisData> {
  const { spaceId, exchange, ticker, analysisTemplateId } = await context.params;

  // Find the ticker by symbol and exchange
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
  });

  // Get the analysis template
  const analysisTemplate = await prisma.analysisTemplate.findFirstOrThrow({
    where: {
      id: analysisTemplateId,
    },
  });

  // Get all analysis results for this ticker and template
  const analyses = await prisma.tickerV1DetailedReport.findMany({
    where: {
      tickerId: tickerRecord.id,
      analysisTemplateId: analysisTemplateId,
    },
    include: {
      analysisType: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [
      {
        analysisType: {
          category: {
            name: 'asc',
          },
        },
      },
      {
        analysisType: {
          name: 'asc',
        },
      },
    ],
  });

  return {
    ticker: tickerRecord,
    analysisTemplate,
    analyses,
  };
}

export const GET = withErrorHandlingV2<TickerAnalysisData>(getHandler);
