import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { consolidateGuideRatings } from '@/app/api/helpers/guide/consolidateGuideRatings';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return { status: 400, body: 'No spaceId provided' };

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
  return NextResponse.json({ status: 200, consolidatedGuideRatingsForSpace: consolidateGuideRatings(ratings) });
}
