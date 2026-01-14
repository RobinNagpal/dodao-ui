import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DetailedReportCategory } from '@prisma/client';

/** ---------- Types ---------- */

interface CreateCategoriesRequest {
  categories: {
    name: string;
    description?: string;
  }[];
}

interface DetailedReportCategoryWithTypes extends DetailedReportCategory {
  analysisTypes: Array<{
    id: string;
    name: string;
    oneLineSummary: string;
    description: string;
    promptInstructions: string;
    outputSchema: string | null;
  }>;
}

/** ---------- POST ---------- */

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