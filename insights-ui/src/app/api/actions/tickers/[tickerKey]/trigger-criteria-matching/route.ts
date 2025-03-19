import { triggerCriteriaMatching } from '@/lib/publicEquity';
import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';

// app/api/public-equity/single-criterion-report/route.ts
import { NextRequest } from 'next/server';
import { CriteriaMatchesOfLatest10Q } from '.prisma/client';

const triggerCriteriaMatchingForTicker = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string }> }
): Promise<CriteriaMatchesOfLatest10Q> => {
  const { tickerKey } = await params;

  const criteriaMatch = await prisma.criteriaMatchesOfLatest10Q.upsert({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    create: {
      spaceId: KoalaGainsSpaceId,
      status: ProcessingStatus.InProgress,
      tickerKey,
    },
    update: {
      status: ProcessingStatus.InProgress,
      criterionMatches: {
        deleteMany: {
          tickerKey,
          spaceId: KoalaGainsSpaceId,
        },
      },
    },
  });

  triggerCriteriaMatching(tickerKey, false);
  return criteriaMatch;
};

export const POST = withErrorHandlingV2<CriteriaMatchesOfLatest10Q>(triggerCriteriaMatchingForTicker);
