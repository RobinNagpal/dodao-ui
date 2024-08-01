import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, message: 'Space ID is required' });
  const byteCollectionCategories = await prisma.byteCollectionCategory.findMany({
    where: {
      spaceId: spaceId,
    },
    orderBy: {
      priority: 'desc',
    },
  });

  return NextResponse.json({ status: 200, byteCollectionCategories });
}
