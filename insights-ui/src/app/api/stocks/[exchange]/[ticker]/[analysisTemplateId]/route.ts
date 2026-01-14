import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

/** ---------- Types ---------- */

interface TickerAnalysisResponse {
  ticker: {
    id: string;
    name: string;
    symbol: string;
    exchange: string;
    summary: string | null;
    websiteUrl: string | null;
  };
  analysisTemplate: {
    id: string;
    name: string;
    description: string | null;
  };
  analyses: Array<{
    id: string;
    analysisType: {
      id: string;
      name: string;
      oneLineSummary: string;
      description: string;
      category: {
        name: string;
      };
    };
    output: string;
    createdAt: string;
  }>;
}

/** ---------- GET ---------- */

async function getHandler(
  req: Request,
  context: { params: Promise<{ exchange: string; ticker: string; analysisTemplateId: string }> }
): Promise<TickerAnalysisResponse> {
  const { exchange, ticker: tickerSymbol, analysisTemplateId } = await context.params;

  // Find the ticker by symbol and exchange
  const ticker = await prisma.tickerV1.findFirstOrThrow({
    where: {
      symbol: tickerSymbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
    select: {
      id: true,
      name: true,
      symbol: true,
      exchange: true,
      summary: true,
      websiteUrl: true,
    },
  });

  // Get the analysis template
  const analysisTemplate = await prisma.analysisTemplate.findFirstOrThrow({
    where: {
      id: analysisTemplateId,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  // Get all analysis results for this ticker and template
  const analysisResults = await prisma.tickerV1DetailedReport.findMany({
    where: {
      tickerId: ticker.id,
      analysisTemplateId: analysisTemplateId,
    },
    include: {
      analysisType: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
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

  const analyses = analysisResults.map((result) => ({
    id: result.id,
    analysisType: {
      id: result.analysisType.id,
      name: result.analysisType.name,
      oneLineSummary: result.analysisType.oneLineSummary,
      description: result.analysisType.description,
      category: {
        name: result.analysisType.category.name,
      },
    },
    output: result.output,
    createdAt: result.createdAt.toISOString(),
  }));

  return {
    ticker,
    analysisTemplate,
    analyses,
  };
}

export const GET = withErrorHandlingV2<TickerAnalysisResponse>(getHandler);
