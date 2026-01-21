import { prisma } from '@/prisma';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';
import { CriteriaMatchesOfLatest10Q } from '@prisma/client';

const updateMatchingAttachmentProcessedCount = async (
  req: NextRequest,
  { params }: { params: Promise<{ tickerKey: string }> }
): Promise<CriteriaMatchesOfLatest10Q> => {
  const { tickerKey } = await params;

  const { count } = (await req.json()) as { count: number };
  const updated = await prisma.criteriaMatchesOfLatest10Q.update({
    where: {
      spaceId_tickerKey: {
        spaceId: KoalaGainsSpaceId,
        tickerKey,
      },
    },
    data: {
      matchingAttachmentsProcessedCount: count,
    },
  });

  return updated;
};

export const POST = withErrorHandlingV2<CriteriaMatchesOfLatest10Q>(updateMatchingAttachmentProcessedCount);
