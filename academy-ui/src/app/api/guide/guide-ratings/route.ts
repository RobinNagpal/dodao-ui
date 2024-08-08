import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guideUuid = searchParams.get('guideUuid');
  const spaceId = searchParams.get('spaceId');
  if (!guideUuid) return NextResponse.json({ status: 400, body: 'No guideUuid provided' });
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No spaceId provided' });

  const guideRatings = await prisma.guideRating.findMany({
    where: {
      NOT: {
        endRating: null,
      },
      guideUuid: guideUuid,
      spaceId: spaceId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 200,
  });

  return NextResponse.json({ status: 200, guideRatings });
}

export const GET = withErrorHandling(getHandler);
