import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ratingUuid = searchParams.get('ratingUuid');
  if (!ratingUuid) return NextResponse.json({ status: 400, body: 'No ratingsUuid provided' });
  const rating = await prisma.guideRating.findUniqueOrThrow({
    where: {
      ratingUuid,
    },
  });

  return NextResponse.json({ status: 200, rating });
}

export const GET = withErrorHandling(getHandler);
