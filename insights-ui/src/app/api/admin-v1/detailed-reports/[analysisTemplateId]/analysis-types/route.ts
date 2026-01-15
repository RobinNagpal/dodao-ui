import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisType } from '@prisma/client';

export interface CreateAnalysisTypesRequest {
  categoryId: string;
  analysisTypes: {
    name: string;
    oneLineSummary: string;
    description: string;
    promptInstructions: string;
    outputSchema?: string;
  }[];
}

async function postHandler(req: Request, context: { params: Promise<{ analysisTemplateId: string }> }): Promise<AnalysisType[]> {
  const { analysisTemplateId } = await context.params;
  const body: CreateAnalysisTypesRequest = await req.json();

  const createdAnalysisTypes = await prisma.$transaction(
    body.analysisTypes.map((analysisType) =>
      prisma.analysisType.create({
        data: {
          categoryId: body.categoryId,
          name: analysisType.name,
          oneLineSummary: analysisType.oneLineSummary,
          description: analysisType.description,
          promptInstructions: analysisType.promptInstructions,
          outputSchema: analysisType.outputSchema,
        },
      })
    )
  );

  return createdAnalysisTypes;
}

export const POST = withErrorHandlingV2<AnalysisType[]>(postHandler);
