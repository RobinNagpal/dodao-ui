import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplateParameter } from '@prisma/client';

export interface CreateAnalysisTypesRequest {
  categoryId: string;
  analysisTypes: {
    name: string;
    description: string;
    promptInstructions: string;
  }[];
}

async function postHandler(req: Request, context: { params: Promise<{ analysisTemplateId: string }> }): Promise<AnalysisTemplateParameter[]> {
  const { analysisTemplateId } = await context.params;
  const body: CreateAnalysisTypesRequest = await req.json();

  const createdAnalysisTypes = await prisma.$transaction(
    body.analysisTypes.map((analysisType) =>
      prisma.analysisTemplateParameter.create({
        data: {
          categoryId: body.categoryId,
          name: analysisType.name,
          description: analysisType.description,
          promptInstructions: analysisType.promptInstructions,
        },
      })
    )
  );

  return createdAnalysisTypes;
}

export const POST = withErrorHandlingV2<AnalysisTemplateParameter[]>(postHandler);
