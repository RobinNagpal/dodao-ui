import { QueryByteRatingsArgs } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const args: QueryByteRatingsArgs = {
    byteId: searchParams.get('byteId')!,
    spaceId: searchParams.get('spaceId')!,
  };
  if (!args.byteId) return NextResponse.json({ body: 'No byteId provided' }, { status: 400 });
  if (!args.spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });
  const ratings = await prisma.byteRating.findMany({
    where: {
      NOT: {
        rating: null,
      },
      byteId: args.byteId,
      spaceId: args.spaceId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 200,
  });

  return NextResponse.json({ byteRatings: ratings }, { status: 200 });
}
