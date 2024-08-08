import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { consolidateByteRatings } from '@/app/api/helpers/byte/consolidateByteRatings';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { ByteRating } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });
  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);

  const ratings: Array<Pick<ByteRating, 'rating' | 'positiveFeedback' | 'negativeFeedback'>> = await prisma.byteRating.findMany({
    where: {
      NOT: {
        rating: null,
      },
      spaceId,
    },
    select: {
      rating: true,
      positiveFeedback: true,
      negativeFeedback: true,
    },
  });
  return NextResponse.json({ consolidatedByteRatingsForSpace: consolidateByteRatings(ratings) }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
