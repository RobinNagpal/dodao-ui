import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { ProcessingStatus } from '@/types/public-equity/ticker-report-types';
import { SaveCriteriaMatchesOfLatest10QRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CriteriaMatchesOfLatest10Q } from '@prisma/client';
import { NextRequest } from 'next/server';

async function saveCriteriaMatchesOfLatest10Q(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<CriteriaMatchesOfLatest10Q> {
  const { tickerKey } = await params;
  const { criterionMatchesOfLatest10Q: request }: SaveCriteriaMatchesOfLatest10QRequest = await req.json();

  console.log(`criterionMatches: ${JSON.stringify(request.criterionMatches)}`);
  console.log(`status: ${request.status}`);
  console.log(`failureReason: ${request.failureReason}`);

  // Verify the ticker exists.
  const existingTicker = await prisma.ticker.findUnique({
    where: { tickerKey },
  });
  if (!existingTicker) {
    throw new Error(`Ticker not found for key: ${tickerKey}`);
  }

  // Use upsert so that we either update an existing record or create a new one.
  const upsertedCriteriaMatches = await prisma.criteriaMatchesOfLatest10Q.update({
    where: {
      // This assumes you have a unique composite index on spaceId and tickerKey.
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      status: request.status,
      failureReason: request.failureReason,
      criterionMatches: {
        deleteMany: {
          spaceId: KoalaGainsSpaceId,
          tickerKey,
        },
        create: request.criterionMatches.map((c) => {
          return {
            criterionKey: c.criterionKey,
            spaceId: KoalaGainsSpaceId,
            tickerKey: tickerKey,
            matchedContent: c.matchedContent,
          };
        }),
      },
    },
  });

  return upsertedCriteriaMatches;
}

export const POST = withErrorHandlingV2<CriteriaMatchesOfLatest10Q>(saveCriteriaMatchesOfLatest10Q);
