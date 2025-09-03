import { prisma } from '@/prisma';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { AnalysisFactorDefinition, CategoryAnalysisFactors, GetAnalysisFactorsResponse } from '@/types/public-equity/analysis-factors-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// GET: Fetch analysis factors for a specific industry and sub-industry
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ industry: string; 'sub-industry': string }> }
): Promise<GetAnalysisFactorsResponse> {
  const { industry: industryKey, 'sub-industry': subIndustryKey } = await params;

  // Fetch all analysis category factors for this industry and sub-industry
  const factors = await prisma.analysisCategoryFactor.findMany({
    where: {
      industryKey,
      subIndustryKey,
      spaceId: 'koala_gains',
    },
    orderBy: [{ categoryKey: 'asc' }, { factorAnalysisKey: 'asc' }],
  });

  // Group factors by category
  const categoryMap = new Map<TickerAnalysisCategory, AnalysisFactorDefinition[]>();

  factors.forEach((factor) => {
    if (!categoryMap.has(factor.categoryKey as TickerAnalysisCategory)) {
      categoryMap.set(factor.categoryKey as TickerAnalysisCategory, []);
    }

    categoryMap.get(factor.categoryKey as TickerAnalysisCategory)!.push({
      factorAnalysisKey: factor.factorAnalysisKey,
      factorAnalysisTitle: factor.factorAnalysisTitle,
      factorAnalysisDescription: factor.factorAnalysisDescription,
    });
  });

  // Convert map to array
  const categories: CategoryAnalysisFactors[] = Array.from(categoryMap.entries()).map(([categoryKey, factors]) => ({
    categoryKey,
    factors,
  }));

  return {
    industryKey,
    subIndustryKey,
    categories,
  };
}

// POST: Upsert analysis factors
async function postHandler(request: NextRequest, { params }: { params: Promise<{ industry: string; 'sub-industry': string }> }): Promise<{ success: boolean }> {
  const { industry: industryKey, 'sub-industry': subIndustryKey } = await params;
  const body: GetAnalysisFactorsResponse = await request.json();
  const { categories } = body;

  if (!categories) {
    throw new Error('categories are required');
  }

  // Use a transaction to ensure all operations succeed or fail together
  await prisma.$transaction(async (tx) => {
    // First, delete all existing factors for this industry/sub-industry combination
    await tx.analysisCategoryFactor.deleteMany({
      where: {
        industryKey,
        subIndustryKey,
        spaceId: 'koala_gains',
      },
    });

    // Then, create all new factors
    const factorsToCreate = categories.flatMap((category) =>
      category.factors.map((factor) => ({
        industryKey,
        subIndustryKey,
        categoryKey: category.categoryKey,
        factorAnalysisKey: factor.factorAnalysisKey,
        factorAnalysisTitle: factor.factorAnalysisTitle,
        factorAnalysisDescription: factor.factorAnalysisDescription,
        spaceId: 'koala_gains',
      }))
    );

    if (factorsToCreate.length > 0) {
      await tx.analysisCategoryFactor.createMany({
        data: factorsToCreate,
      });
    }
  });

  return { success: true };
}

// DELETE: Delete all analysis factors for an industry/sub-industry combination
async function deleteHandler(req: NextRequest, { params }: { params: Promise<{ industry: string; 'sub-industry': string }> }): Promise<{ success: boolean }> {
  const { industry: industryKey, 'sub-industry': subIndustryKey } = await params;

  await prisma.analysisCategoryFactor.deleteMany({
    where: {
      industryKey,
      subIndustryKey,
      spaceId: 'koala_gains',
    },
  });

  return { success: true };
}

// Export handlers with error handling wrapper
export const GET = withErrorHandlingV2<GetAnalysisFactorsResponse>(getHandler);
export const POST = withErrorHandlingV2<{ success: boolean }>(postHandler);
export const DELETE = withErrorHandlingV2<{ success: boolean }>(deleteHandler);
