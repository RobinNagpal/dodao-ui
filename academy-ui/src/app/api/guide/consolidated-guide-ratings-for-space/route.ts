import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { consolidateGuideRatings } from '@/app/api/helpers/guide/consolidateGuideRatings';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });

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
  return NextResponse.json({ consolidatedGuideRatingsForSpace: consolidateGuideRatings(ratings) }, { status: 200 });
}
