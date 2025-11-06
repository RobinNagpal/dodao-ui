// sub-industries/move/route.ts
import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { NextRequest } from 'next/server';
import { withLoggedInAdmin } from '../../helpers/withLoggedInAdmin';

export interface MoveSubIndustryRequest {
  oldIndustryKey: string;
  newIndustryKey: string;
  subIndustryKey: string;
}

export interface MoveSubIndustryResponse {
  success: boolean;
  message: string;
  affectedTickersCount?: number;
  affectedFactorsCount?: number;
}

async function postHandler(request: NextRequest, _userContext: DoDaoJwtTokenPayload): Promise<MoveSubIndustryResponse> {
  const body: MoveSubIndustryRequest = await request.json();
  const { oldIndustryKey, newIndustryKey, subIndustryKey } = body;

  if (!oldIndustryKey || !newIndustryKey || !subIndustryKey) {
    throw new Error('oldIndustryKey, newIndustryKey, and subIndustryKey are required');
  }

  if (oldIndustryKey === newIndustryKey) {
    throw new Error('oldIndustryKey and newIndustryKey cannot be the same');
  }

  return await prisma.$transaction(async (tx) => {
    // 1) Sanity checks
    const [newIndustry, subIndustry, conflict] = await Promise.all([
      tx.tickerV1Industry.findUnique({ where: { industryKey: newIndustryKey } }),
      tx.tickerV1SubIndustry.findUnique({
        where: {
          industryKey_subIndustryKey: {
            industryKey: oldIndustryKey,
            subIndustryKey: subIndustryKey,
          },
        },
      }),
      tx.tickerV1SubIndustry.findUnique({
        where: {
          industryKey_subIndustryKey: {
            industryKey: newIndustryKey,
            subIndustryKey: subIndustryKey,
          },
        },
      }),
    ]);

    if (!newIndustry) {
      throw new Error(`Target industry '${newIndustryKey}' does not exist`);
    }

    if (!subIndustry) {
      throw new Error(`Source sub-industry '${subIndustryKey}' not found under industry '${oldIndustryKey}'`);
    }

    if (conflict) {
      throw new Error(`A sub-industry with key '${subIndustryKey}' already exists under industry '${newIndustryKey}'`);
    }

    // 2) Count affected records before the move
    const [tickersCount, factorsCount] = await Promise.all([
      tx.tickerV1.count({
        where: {
          industryKey: oldIndustryKey,
          subIndustryKey: subIndustryKey,
        },
      }),
      tx.analysisCategoryFactor.count({
        where: {
          industryKey: oldIndustryKey,
          subIndustryKey: subIndustryKey,
        },
      }),
    ]);

    // 3) Execute the move using raw SQL (triggers ON UPDATE CASCADE)
    await tx.$executeRawUnsafe(
      `
      UPDATE "TickerV1SubIndustry"
         SET "industry_key" = $1
       WHERE "industry_key" = $2
         AND "sub_industry_key" = $3
      `,
      newIndustryKey,
      oldIndustryKey,
      subIndustryKey
    );

    return {
      success: true,
      message: `Successfully moved sub-industry '${subIndustryKey}' from '${oldIndustryKey}' to '${newIndustryKey}'`,
      affectedTickersCount: tickersCount,
      affectedFactorsCount: factorsCount,
    };
  });
}

export const POST = withLoggedInAdmin<MoveSubIndustryResponse>(postHandler);
