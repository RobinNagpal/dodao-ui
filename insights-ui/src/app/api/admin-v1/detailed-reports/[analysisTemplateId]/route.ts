import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplateWithRelations } from '../route';

async function getHandler(req: Request, context: { params: Promise<{ analysisTemplateId: string }> }): Promise<AnalysisTemplateWithRelations> {
  const { analysisTemplateId } = await context.params;

  const template = await prisma.analysisTemplate.findFirstOrThrow({
    where: {
      id: analysisTemplateId,
    },
    include: {
      categories: {
        include: {
          analysisTypes: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  return template;
}

export const GET = withErrorHandlingV2<AnalysisTemplateWithRelations>(getHandler);
