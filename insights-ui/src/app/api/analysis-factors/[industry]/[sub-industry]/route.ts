import { prisma } from '@/prisma';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
import { AnalysisFactorDefinition, CategoryAnalysisFactors, UpsertAnalysisFactorsRequest } from '@/types/public-equity/analysis-factors-types';
import { SuccessStatus } from '@/types/public-equity/common-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

// GET: Fetch analysis factors for a specific industry and sub-industry
async function getHandler(
  req: NextRequest,
  { params }: { params: Promise<{ industry: string; 'sub-industry': string }> }
): Promise<UpsertAnalysisFactorsRequest> {
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
      factorAnalysisMetrics: factor.factorAnalysisMetrics || undefined,
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

// POST: Create new analysis factors (for completely new industry/sub-industry combinations)
async function postHandler(request: NextRequest, { params }: { params: Promise<{ industry: string; 'sub-industry': string }> }): Promise<{ success: boolean }> {
  const { industry: industryKey, 'sub-industry': subIndustryKey } = await params;
  const body: UpsertAnalysisFactorsRequest = await request.json();
  const { categories } = body;

  if (!categories) {
    throw new Error('categories are required');
  }

  // Use a transaction to ensure all operations succeed or fail together
  await prisma.$transaction(async (tx) => {
    // Create all new factors
    const factorsToCreate = categories.flatMap((category) =>
      category.factors.map((factor) => ({
        industryKey,
        subIndustryKey,
        categoryKey: category.categoryKey,
        factorAnalysisKey: factor.factorAnalysisKey,
        factorAnalysisTitle: factor.factorAnalysisTitle,
        factorAnalysisDescription: factor.factorAnalysisDescription,
        factorAnalysisMetrics: factor.factorAnalysisMetrics || null,
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

// PUT: Update existing analysis factors (smart upsert - update existing, add new, remove deleted)
async function putHandler(request: NextRequest, { params }: { params: Promise<{ industry: string; 'sub-industry': string }> }): Promise<{ success: boolean }> {
  const { industry: industryKey, 'sub-industry': subIndustryKey } = await params;
  const body: UpsertAnalysisFactorsRequest = await request.json();
  const { categories } = body;

  if (!categories) {
    throw new Error('categories are required');
  }

  // Use a transaction to ensure all operations succeed or fail together
  await prisma.$transaction(async (tx) => {
    // Get existing factors for this industry/sub-industry
    const existingFactors = await tx.analysisCategoryFactor.findMany({
      where: {
        industryKey,
        subIndustryKey,
        spaceId: 'koala_gains',
      },
    });

    // Create a set of existing factor keys for quick lookup
    const existingFactorKeys = new Set(existingFactors.map((f) => `${f.categoryKey}:${f.factorAnalysisKey}`));

    // Prepare new factors from the request
    const newFactors = categories.flatMap((category) =>
      category.factors.map((factor) => ({
        industryKey,
        subIndustryKey,
        categoryKey: category.categoryKey,
        factorAnalysisKey: factor.factorAnalysisKey,
        factorAnalysisTitle: factor.factorAnalysisTitle,
        factorAnalysisDescription: factor.factorAnalysisDescription,
        factorAnalysisMetrics: factor.factorAnalysisMetrics || null,
        spaceId: 'koala_gains',
        key: `${category.categoryKey}:${factor.factorAnalysisKey}`,
      }))
    );

    const newFactorKeys = new Set(newFactors.map((f) => f.key));

    // 1. Update existing factors that are still present
    // 2. Insert new factors that don't exist yet
    for (const newFactor of newFactors) {
      const { key, ...factorData } = newFactor;

      if (existingFactorKeys.has(key)) {
        // Update existing factor
        await tx.analysisCategoryFactor.updateMany({
          where: {
            industryKey,
            subIndustryKey,
            categoryKey: factorData.categoryKey,
            factorAnalysisKey: factorData.factorAnalysisKey,
            spaceId: 'koala_gains',
          },
          data: {
            factorAnalysisTitle: factorData.factorAnalysisTitle,
            factorAnalysisDescription: factorData.factorAnalysisDescription,
            factorAnalysisMetrics: factorData.factorAnalysisMetrics || null,
          },
        });
      } else {
        // Insert new factor
        await tx.analysisCategoryFactor.create({
          data: factorData,
        });
      }
    }

    // 3. Delete factors that are no longer present in the new data
    const factorsToDelete = existingFactors.filter((existing) => !newFactorKeys.has(`${existing.categoryKey}:${existing.factorAnalysisKey}`));

    if (factorsToDelete.length > 0) {
      // Delete related factor results first (if not using cascade delete)
      for (const factorToDelete of factorsToDelete) {
        await tx.tickerV1AnalysisCategoryFactorResult.deleteMany({
          where: {
            analysisCategoryFactorId: factorToDelete.id,
          },
        });
      }

      // Then delete the factors
      await tx.analysisCategoryFactor.deleteMany({
        where: {
          id: {
            in: factorsToDelete.map((f) => f.id),
          },
        },
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
export const GET = withErrorHandlingV2<UpsertAnalysisFactorsRequest>(getHandler);
export const POST = withErrorHandlingV2<SuccessStatus>(postHandler);
export const PUT = withErrorHandlingV2<SuccessStatus>(putHandler);
export const DELETE = withErrorHandlingV2<SuccessStatus>(deleteHandler);
