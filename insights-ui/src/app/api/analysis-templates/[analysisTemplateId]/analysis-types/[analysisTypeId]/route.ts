import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisType } from '@prisma/client';

async function deleteHandler(req: Request, context: { params: Promise<{ analysisTemplateId: string; analysisTypeId: string }> }): Promise<AnalysisType> {
  const { analysisTypeId } = await context.params;

  const deletedAnalysisType = await prisma.analysisType.delete({
    where: {
      id: analysisTypeId,
    },
  });

  return deletedAnalysisType;
}

export const DELETE = withErrorHandlingV2<AnalysisType>(deleteHandler);
