import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
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

export const GET = withErrorHandling(getHandler);
