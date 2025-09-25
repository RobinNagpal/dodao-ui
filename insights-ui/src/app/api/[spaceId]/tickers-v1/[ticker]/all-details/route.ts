import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getTickerWithAllDetailsForConditions, TickerV1FullReportResponse } from '@/utils/ticker-v1-model-utils';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<TickerV1FullReportResponse> {
  const { spaceId, ticker } = await context.params;

  // Get ticker from DB with all related data
  const whereClause: Prisma.TickerV1WhereInput = {
    spaceId: spaceId || KoalaGainsSpaceId,
    symbol: ticker.toUpperCase(),
  };
  return await getTickerWithAllDetailsForConditions(whereClause);
}

export const GET = withErrorHandlingV2<TickerV1FullReportResponse>(getHandler);
