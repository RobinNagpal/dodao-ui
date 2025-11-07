import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../../helpers/withLoggedInAdmin';

export interface MoveTickersRequest {
  tickerIds: string[]; // Array of ticker IDs to move
  targetIndustryKey: string;
  targetSubIndustryKey: string;
}

export interface MoveTickersResponse {
  success: boolean;
  message: string;
  movedTickersCount: number;
  deletedAnalysisResultsCount: number;
  deletedFactorResultsCount: number;
}

async function postHandler(
  request: NextRequest,
  _userContext: DoDaoJwtTokenPayload,
  { params }: { params: Promise<{ spaceId: string }> }
): Promise<MoveTickersResponse> {
  const { spaceId } = await params;
  const body: MoveTickersRequest = await request.json();
  const { tickerIds, targetIndustryKey, targetSubIndustryKey } = body;

  if (!tickerIds || tickerIds.length === 0) {
    throw new Error('tickerIds array is required and cannot be empty');
  }

  if (!targetIndustryKey || !targetSubIndustryKey) {
    throw new Error('targetIndustryKey and targetSubIndustryKey are required');
  }

  return await prisma.$transaction(async (tx) => {
    // 1) Validate target industry and sub-industry exist and are properly paired
    const [targetIndustry, targetSubIndustry] = await Promise.all([
      tx.tickerV1Industry.findUnique({ where: { industryKey: targetIndustryKey } }),
      tx.tickerV1SubIndustry.findUnique({
        where: {
          industryKey_subIndustryKey: {
            industryKey: targetIndustryKey,
            subIndustryKey: targetSubIndustryKey,
          },
        },
      }),
    ]);

    if (!targetIndustry) {
      throw new Error(`Target industry '${targetIndustryKey}' does not exist`);
    }

    if (!targetSubIndustry) {
      throw new Error(`Target sub-industry '${targetSubIndustryKey}' does not exist under industry '${targetIndustryKey}'`);
    }

    // 2) Validate all tickers exist and belong to the specified space
    const existingTickers = await tx.tickerV1.findMany({
      where: {
        id: { in: tickerIds },
        spaceId: spaceId,
      },
      select: {
        id: true,
        symbol: true,
        industryKey: true,
        subIndustryKey: true,
      },
    });

    if (existingTickers.length !== tickerIds.length) {
      const foundIds = existingTickers.map((t) => t.id);
      const missingIds = tickerIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Some tickers not found or don't belong to this space: ${missingIds.join(', ')}`);
    }

    // 3) Check if any tickers are already in the target location
    const alreadyInTarget = existingTickers.filter((t) => t.industryKey === targetIndustryKey && t.subIndustryKey === targetSubIndustryKey);

    if (alreadyInTarget.length > 0) {
      const symbols = alreadyInTarget.map((t) => t.symbol).join(', ');
      throw new Error(`Some tickers are already in the target location: ${symbols}`);
    }

    // 4) Delete analysis results (these are tied to specific industry/sub-industry factor combinations)

    // First delete factor results (children)
    const deletedFactorResults = await tx.tickerV1AnalysisCategoryFactorResult.deleteMany({
      where: {
        tickerId: { in: tickerIds },
        spaceId: spaceId,
      },
    });

    // Then delete category analysis results (parents)
    const deletedAnalysisResults = await tx.tickerV1CategoryAnalysisResult.deleteMany({
      where: {
        tickerId: { in: tickerIds },
        spaceId: spaceId,
      },
    });

    // 5) Update tickers with new industry and sub-industry
    const updateResult = await tx.tickerV1.updateMany({
      where: {
        id: { in: tickerIds },
        spaceId: spaceId,
      },
      data: {
        industryKey: targetIndustryKey,
        subIndustryKey: targetSubIndustryKey,
        updatedAt: new Date(),
      },
    });

    const tickerSymbols = existingTickers.map((t) => t.symbol).join(', ');

    return {
      success: true,
      message: `Successfully moved ${updateResult.count} ticker(s) [${tickerSymbols}] to ${targetIndustry.name} → ${targetSubIndustry.name}`,
      movedTickersCount: updateResult.count,
      deletedAnalysisResultsCount: deletedAnalysisResults.count,
      deletedFactorResultsCount: deletedFactorResults.count,
    };
  });
}

export const POST = withLoggedInAdmin<MoveTickersResponse>(postHandler);
