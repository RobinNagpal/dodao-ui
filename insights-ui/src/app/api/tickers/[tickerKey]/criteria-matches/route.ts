import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { saveCriteriaMatchesOfLatest10QRequest } from '@/types/public-equity/ticker-request-response';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { CriteriaMatchesOfLatest10Q } from '@prisma/client';
import { NextRequest } from 'next/server';

async function saveCriteriaMatchesOfLatest10Q(req: NextRequest, { params }: { params: Promise<{ tickerKey: string }> }): Promise<CriteriaMatchesOfLatest10Q> {
  const { tickerKey } = await params;
  const { criterionMatchesOfLatest10Q }: saveCriteriaMatchesOfLatest10QRequest = await req.json();

  console.log(`criterionMatches: ${JSON.stringify(criterionMatchesOfLatest10Q.criterionMatches)}`);
  console.log(`status: ${criterionMatchesOfLatest10Q.status}`);
  console.log(`failureReason: ${criterionMatchesOfLatest10Q.failureReason}`);

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
      status: criterionMatchesOfLatest10Q.status,
      failureReason: criterionMatchesOfLatest10Q.failureReason,
      criterionMatches: {
        // Remove all existing nested criterionMatches.
        deleteMany: {
          tickerKey,
          spaceId: KoalaGainsSpaceId,
        },
        // Create the new set of criterionMatches from the payload.
        create: criterionMatchesOfLatest10Q.criterionMatches.map((c: { criterionKey: any; matchedContent: any; matchedAttachments: any }) => ({
          tickerKey,
          criterionKey: c.criterionKey,
          matchedContent: c.matchedContent,
          matchedAttachments: c.matchedAttachments,
        })),
      },
    },
    include: {
      criterionMatches: true,
    },
  });

  return upsertedCriteriaMatches;
}

export const POST = withErrorHandlingV2<CriteriaMatchesOfLatest10Q>(saveCriteriaMatchesOfLatest10Q);
