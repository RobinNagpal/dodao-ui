import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { AnalysisTemplateCategory, AnalysisTemplateParameter } from '@prisma/client';

export interface CreateCategoriesRequest {
  categories: {
    name: string;
    description?: string;
  }[];
}

export type AnalysisTemplateCategoryWithTypes = AnalysisTemplateCategory & {
  analysisParameters: AnalysisTemplateParameter[];
};

async function postHandler(req: Request, context: { params: Promise<{ analysisTemplateId: string }> }): Promise<AnalysisTemplateCategoryWithTypes[]> {
  const { analysisTemplateId } = await context.params;
  const body: CreateCategoriesRequest = await req.json();

  const createdCategories = await prisma.$transaction(
    body.categories.map((category) =>
      prisma.analysisTemplateCategory.create({
        data: {
          analysisTemplateId,
          name: category.name,
          description: category.description,
        },
        include: {
          analysisParameters: true,
        },
      })
    )
  );

  return createdCategories;
}

export const POST = withErrorHandlingV2<AnalysisTemplateCategoryWithTypes[]>(postHandler);
