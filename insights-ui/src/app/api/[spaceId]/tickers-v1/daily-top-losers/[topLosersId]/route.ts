import { prisma } from '@/prisma';
import { TopLoserWithTicker } from '@/types/daily-stock-movers';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; topLosersId: string }> }): Promise<TopLoserWithTicker> {
  const { topLosersId } = await context.params;

  const topLoser = await prisma.dailyTopLoser.findFirstOrThrow({
    where: {
      id: topLosersId,
    },
    include: {
      ticker: true,
    },
  });

  return topLoser;
}

export const GET = withErrorHandlingV2<TopLoserWithTicker>(getHandler);
