import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const ratingUuid = searchParams.get('ratingUuid');
  if (!ratingUuid) return NextResponse.json({ body: 'No ratingsUuid provided' }, { status: 400 });
  const rating = await prisma.guideRating.findUniqueOrThrow({
    where: {
      ratingUuid,
    },
  });

  return NextResponse.json({ rating }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
