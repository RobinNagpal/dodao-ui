import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface ExchangeResponse {
  exchange: string;
}

async function getHandler(req: NextRequest, context: { params: Promise<{ spaceId: string; ticker: string }> }): Promise<ExchangeResponse> {
  const { spaceId, ticker } = await context.params;

  const tickerRecord = await prisma.tickerV1.findFirstOrThrow({
    where: {
      spaceId: spaceId,
      symbol: ticker.toUpperCase(),
    },
    select: {
      exchange: true,
    },
  });

  return {
    exchange: tickerRecord.exchange,
  };
}

export const GET = withErrorHandlingV2<ExchangeResponse>(getHandler);
