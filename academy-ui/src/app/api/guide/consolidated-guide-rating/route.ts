import { getSpaceById } from '@/app/api/helpers/space/getSpaceById';
import { consolidateGuideRatings } from '@/app/api/helpers/guide/consolidateGuideRatings';
import { checkEditSpacePermission } from '@/app/api/helpers/space/checkEditSpacePermission';
import { prisma } from '@/prisma';
import { GuideRating } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guideUuid = searchParams.get('guideUuid');
  const spaceId = searchParams.get('spaceId');
  if (!guideUuid) return NextResponse.json({ status: 400, body: 'No guideUuid provided' });
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No spaceId provided' });

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
  return NextResponse.json({ status: 200, consolidatedGuideRating: consolidateGuideRatings(ratings) });
}
