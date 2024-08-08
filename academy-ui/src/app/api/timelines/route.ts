import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ message: 'Space ID is required' }, { status: 400 });

  const timelines = await prisma.timeline.findMany({
    where: {
      spaceId,
    },
  });

  return NextResponse.json({ timelines }, { status: 200 });
}
