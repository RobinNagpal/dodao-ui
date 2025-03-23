import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { SecFiling, Ticker } from '@prisma/client';
import { NextRequest } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<SecFiling[]> {
  const { tickerKey } = await params;

  const tickers = await prisma.secFiling.findMany({
    where: {
      tickerKey: tickerKey,
      spaceId: KoalaGainsSpaceId,
    },
    orderBy: {
      filingDate: 'desc',
    },
    take: 50,
  });
  return tickers;
}
export const GET = withErrorHandlingV2<SecFiling[]>(getHandler);
