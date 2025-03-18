import { getTickerReport, saveTickerReport, triggerCriteriaMatching } from '@/lib/publicEquity';
import { prisma } from '@/prisma';
import { ProcessingStatus, TickerReport } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// app/api/public-equity/single-criterion-report/route.ts
import { NextRequest } from 'next/server';

const triggerCriteriaMatchingForTicker = async (req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<TickerReport> => {
  const { tickerKey } = await params;

  const updatedTicker = await prisma.ticker.update({
    where: { tickerKey },
    data: {
      criteriaMatchesOfLatest10Q: {
        create: {
          status: ProcessingStatus.InProgress,
        },
        update: {
          status: ProcessingStatus.InProgress,
          criterionMatches: {
            deleteMany: {
              tickerKey,
            },
          },
        },
      },
    },
  });

  triggerCriteriaMatching(tickerKey, false);
  return updatedTicker;
};

export const POST = withErrorHandlingV2<TickerReport>(triggerCriteriaMatchingForTicker);
