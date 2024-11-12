import { consolidateByteRatings } from '@/app/api/helpers/byte/consolidateByteRatings';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { prisma } from '@/prisma';
import { ByteRating } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '../../helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const byteId = searchParams.get('byteId');
  if (!byteId) return NextResponse.json({ body: 'No byteId provided' }, { status: 400 });

  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });

  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);

  const ratings: Array<Pick<ByteRating, 'rating' | 'positiveFeedback' | 'negativeFeedback'>> = await prisma.byteRating.findMany({
    where: {
      NOT: {
        rating: null,
      },
      byteId,
      spaceId,
    },
    select: {
      rating: true,
      positiveFeedback: true,
      negativeFeedback: true,
    },
  });
  return NextResponse.json({ consolidatedByteRating: { consolidatedByteRating: consolidateByteRatings(ratings) } }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
