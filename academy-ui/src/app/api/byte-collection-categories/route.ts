import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
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

export const GET = withErrorHandling(getHandler);
