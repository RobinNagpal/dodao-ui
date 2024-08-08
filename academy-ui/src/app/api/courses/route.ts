import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ message: 'Space ID is required' }, { status: 400 });

  const courses = await prisma.course.findMany({
    where: {
      spaceId,
    },
  });

  return NextResponse.json({ courses }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
