import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { TickerCompareMetricsAndChecklist } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

async function getHandler(): Promise<TickerCompareMetricsAndChecklist[]> {
  const tickers = await prisma.ticker.findMany({
    where: {
      spaceId: KoalaGainsSpaceId,
    },
    take: 20,
    select: {
      tickerKey: true,
      sectorId: true,
      industryGroupId: true,
      evaluationsOfLatest10Q: {
        select: {
          importantMetricsEvaluation: {
            include: {
              metrics: true,
            },
          },
          performanceChecklistEvaluation: {
            include: {
              performanceChecklistItems: true,
            },
          },
        },
      },
    },
  });

  return tickers;
}

export const GET = withErrorHandlingV2<TickerCompareMetricsAndChecklist[]>(getHandler);
