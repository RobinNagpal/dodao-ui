import { consolidateGuideRatings } from '@/app/api/helpers/guide/consolidateGuideRatings';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { ConsolidatedGuideRatingDto } from '@/types/bytes/ConsolidatedGuideRatingDto';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<ConsolidatedGuideRatingDto | undefined>> {
  const spaceId = params.spaceId;

  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);

  const ratings = await prisma.guideRating.findMany({
    where: {
      NOT: {
        endRating: null,
      },
      spaceId,
    },
    select: {
      endRating: true,
      positiveFeedback: true,
      negativeFeedback: true,
    },
  });
  const consolidatedRating = consolidateGuideRatings(ratings);
  return NextResponse.json(consolidatedRating, { status: 200 });
}

export const GET = withErrorHandlingV1<ConsolidatedGuideRatingDto | undefined>(getHandler);
