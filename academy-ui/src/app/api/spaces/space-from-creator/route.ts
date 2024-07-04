import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorUsername = searchParams.get('creatorUsername');
  if (!creatorUsername) return NextResponse.json({ status: 400, body: 'No creatorUsername provided' });
  const space = prisma.space.findFirst({
    where: {
      creator: creatorUsername!,
    },
  });
  return NextResponse.json({ status: 200, body: space });
}
