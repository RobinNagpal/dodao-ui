import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { consolidateGuideRatings } from '@/app/api/helpers/guide/consolidateGuideRatings';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { GuideRating } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guideUuid = searchParams.get('guideUuid');
  const spaceId = searchParams.get('spaceId');
  if (!guideUuid) return NextResponse.json({ body: 'No guideUuid provided' }, { status: 400 });
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });

  const spaceById = await getSpaceById(spaceId);
  await checkEditSpacePermission(spaceById, req);

  const ratings: Pick<GuideRating, 'endRating' | 'positiveFeedback' | 'negativeFeedback'>[] = await prisma.guideRating.findMany({
    where: {
      NOT: {
        endRating: null,
      },
      guideUuid,
      spaceId,
    },
    select: {
      endRating: true,
      positiveFeedback: true,
      negativeFeedback: true,
    },
  });
  return NextResponse.json({ consolidatedGuideRating: consolidateGuideRatings(ratings) }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
