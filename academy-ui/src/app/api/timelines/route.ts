export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';

async function getHandler(req: NextRequest) {
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

export const GET = withErrorHandling(getHandler);
