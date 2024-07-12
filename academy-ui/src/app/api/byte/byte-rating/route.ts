import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ratingUuid = searchParams.get('ratingUuid');
  if (!ratingUuid) return NextResponse.json({ status: 400, body: 'No ratingUuid provided' });
  const rating = await prisma.byteRating.findUniqueOrThrow({
    where: {
      ratingUuid: ratingUuid,
    },
  });

  return NextResponse.json({ status: 200, rating });
}
