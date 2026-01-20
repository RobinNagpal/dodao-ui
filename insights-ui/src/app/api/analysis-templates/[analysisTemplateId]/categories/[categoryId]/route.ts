import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplateCategory } from '@prisma/client';

async function deleteHandler(req: Request, context: { params: Promise<{ analysisTemplateId: string; categoryId: string }> }): Promise<AnalysisTemplateCategory> {
  const { categoryId } = await context.params;

  const deletedCategory = await prisma.analysisTemplateCategory.delete({
    where: {
      id: categoryId,
    },
  });

  return deletedCategory;
}

export const DELETE = withErrorHandlingV2<AnalysisTemplateCategory>(deleteHandler);
