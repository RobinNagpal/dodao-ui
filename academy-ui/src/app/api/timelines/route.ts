import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';

export async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, message: 'Space ID is required' });

  const timelines = await prisma.timeline.findMany({
    where: {
      spaceId,
    },
  });

  return NextResponse.json({ status: 200, timelines });
}

export const GET = withErrorHandling(getHandler);
