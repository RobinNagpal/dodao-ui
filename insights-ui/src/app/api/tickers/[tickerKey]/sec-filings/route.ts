import { prisma } from '@/prisma';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { SecFiling, Ticker } from '@prisma/client';

async function getHandler(): Promise<SecFiling[]> {
  const tickers = await prisma.secFiling.findMany({
    orderBy: {
      filingDate: 'desc',
    },
    take: 50,
  });
  return tickers;
}
export const GET = withErrorHandlingV2<SecFiling[]>(getHandler);
