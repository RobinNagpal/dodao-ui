import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DetailedReportCategory, AnalysisType } from '@prisma/client';

export interface CreateCategoriesRequest {
  categories: {
    name: string;
    description?: string;
  }[];
}

export type DetailedReportCategoryWithTypes = DetailedReportCategory & {
  analysisTypes: AnalysisType[];
};

async function postHandler(req: Request, context: { params: Promise<{ analysisTemplateId: string }> }): Promise<DetailedReportCategoryWithTypes[]> {
  const { analysisTemplateId } = await context.params;
  const body: CreateCategoriesRequest = await req.json();

  const createdCategories = await prisma.$transaction(
    body.categories.map((category) =>
      prisma.detailedReportCategory.create({
        data: {
          analysisTemplateId,
          name: category.name,
          description: category.description,
        },
        include: {
          analysisTypes: true,
        },
      })
    )
  );

  return createdCategories;
}

export const POST = withErrorHandlingV2<DetailedReportCategoryWithTypes[]>(postHandler);
