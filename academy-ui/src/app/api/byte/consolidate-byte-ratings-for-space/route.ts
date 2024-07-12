import { QueryConsolidatedByteRatingsForSpaceArgs } from '@/graphql/generated/generated-types';
import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { consolidateByteRatings } from '@/app/api/helpers/byte/consolidateByteRatings';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { ByteRating } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { spaceId }: QueryConsolidatedByteRatingsForSpaceArgs = await req.json();
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
  return NextResponse.json({ status: 200, consolidatedByteRatings: consolidateByteRatings(ratings) });
}
