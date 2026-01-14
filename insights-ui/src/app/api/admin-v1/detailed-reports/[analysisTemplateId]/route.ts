import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplate } from '@prisma/client';

/** ---------- Types ---------- */

interface AnalysisTemplateWithRelations extends AnalysisTemplate {
  categories: Array<{
    id: string;
    name: string;
    description: string | null;
    analysisTypes: Array<{
      id: string;
      name: string;
      oneLineSummary: string;
      description: string;
      promptInstructions: string;
      outputSchema: string | null;
    }>;
  }>;
}

/** ---------- GET ---------- */

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
