import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplateParameter } from '@prisma/client';

async function deleteHandler(req: Request, context: { params: Promise<{ analysisTemplateId: string; analysisTypeId: string }> }): Promise<AnalysisTemplateParameter> {
  const { analysisTypeId } = await context.params;

  const deletedAnalysisType = await prisma.analysisTemplateParameter.delete({
    where: {
      id: analysisTypeId,
    },
  });

  return deletedAnalysisType;
}

export const DELETE = withErrorHandlingV2<AnalysisTemplateParameter>(deleteHandler);
