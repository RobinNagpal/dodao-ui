import { consolidateByteRatings } from '@/app/api/helpers/byte/consolidateByteRatings';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { ConsolidatedByteRatingDto } from '@/types/bytes/ConsolidatedByteRatingDto';
import { ByteRating } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<ConsolidatedByteRatingDto | undefined>> {
  const spaceById = await getSpaceById(params.spaceId);
  await checkEditSpacePermission(spaceById, req);

  const ratings: Array<Pick<ByteRating, 'rating' | 'positiveFeedback' | 'negativeFeedback'>> = await prisma.byteRating.findMany({
    where: {
      NOT: {
        rating: null,
      },
      spaceId: params.spaceId,
    },
    select: {
      rating: true,
      positiveFeedback: true,
      negativeFeedback: true,
    },
  });
  return NextResponse.json(consolidateByteRatings(ratings), { status: 200 });
}

export const GET = withErrorHandlingV1<ConsolidatedByteRatingDto | undefined>(getHandler);
