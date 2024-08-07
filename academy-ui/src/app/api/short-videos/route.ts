import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ message: 'spaceId is required' }, { status: 400 });
  const shortVideos = await prisma.shortVideo.findMany({
    where: {
      spaceId: spaceId,
    },
  });

  return NextResponse.json({ shortVideos }, { status: 200 });
}
