import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplate, TickerV1, DetailedReportCategory } from '@prisma/client';

export interface GeneratedAnalysis {
  id: string;
  tickerId: string;
  analysisTemplateId: string;
  categoryId: string;
  ticker: Pick<TickerV1, 'name' | 'symbol' | 'exchange'>;
  analysisTemplate: Pick<AnalysisTemplate, 'name'>;
  category: Pick<DetailedReportCategory, 'name'>;
  createdAt: string;
}

async function getHandler(): Promise<GeneratedAnalysis[]> {
  const generatedAnalyses = await prisma.tickerV1DetailedReport.findMany({
    include: {
      ticker: true,
      analysisTemplate: true,
      analysisType: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const uniqueAnalyses = new Map<string, any>();

  generatedAnalyses.forEach((analysis) => {
    const key = `${analysis.tickerId}-${analysis.analysisTemplateId}-${analysis.analysisType.categoryId}`;
    if (!uniqueAnalyses.has(key)) {
      uniqueAnalyses.set(key, {
        id: key,
        tickerId: analysis.tickerId,
        analysisTemplateId: analysis.analysisTemplateId,
        categoryId: analysis.analysisType.categoryId,
        ticker: analysis.ticker,
        analysisTemplate: analysis.analysisTemplate,
        category: analysis.analysisType.category,
        createdAt: analysis.createdAt.toISOString(),
      });
    }
  });

  return Array.from(uniqueAnalyses.values());
}

export const GET = withErrorHandlingV2<GeneratedAnalysis[]>(getHandler);
