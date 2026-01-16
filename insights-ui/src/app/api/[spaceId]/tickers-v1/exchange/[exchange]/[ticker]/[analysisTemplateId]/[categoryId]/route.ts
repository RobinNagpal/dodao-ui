import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface DeleteAnalysisResponse {
  success: boolean;
  deletedCount: number;
}

async function deleteHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string; exchange: string; ticker: string; analysisTemplateId: string; categoryId: string }> }
): Promise<DeleteAnalysisResponse> {
  const { spaceId, exchange, ticker, analysisTemplateId, categoryId } = await context.params;

  // Find the ticker by symbol and exchange
  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId || KoalaGainsSpaceId,
      symbol: ticker.toUpperCase(),
      exchange: exchange.toUpperCase(),
    },
  });

  // Find all analysis types for this category
  const analysisTypes = await prisma.analysisType.findMany({
    where: {
      categoryId: categoryId,
    },
    select: {
      id: true,
    },
  });

  const analysisTypeIds = analysisTypes.map((at) => at.id);

  // Delete all detailed reports for this ticker + template + category (via analysis type IDs)
  const deleteResult = await prisma.tickerV1DetailedReport.deleteMany({
    where: {
      tickerId: tickerRecord.id,
      analysisTemplateId: analysisTemplateId,
      analysisTypeId: {
        in: analysisTypeIds,
      },
    },
  });

  return {
    success: true,
    deletedCount: deleteResult.count,
  };
}

export const DELETE = withErrorHandlingV2<DeleteAnalysisResponse>(deleteHandler);
