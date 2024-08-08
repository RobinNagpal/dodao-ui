import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ message: 'Space ID is required' }, { status: 400 });
  const byteCollectionCategories = await prisma.byteCollectionCategory.findMany({
    where: {
      spaceId: spaceId,
    },
    orderBy: {
      priority: 'desc',
    },
  });

  return NextResponse.json({ byteCollectionCategories }, { status: 200 });
}
