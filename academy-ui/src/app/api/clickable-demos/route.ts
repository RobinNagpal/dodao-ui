import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ message: 'Space ID is required' }, { status: 400 });
  const clickableDemos = await prisma.clickableDemos.findMany({
    where: {
      spaceId: spaceId,
      archive: false,
    },
    select: {
      id: true,
      title: true,
      excerpt: true,
      spaceId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ clickableDemos }, { status: 200 });
}
