import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, message: 'Space ID is required' });

  const courses = await prisma.course.findMany({
    where: {
      spaceId,
    },
  });

  return NextResponse.json({ status: 200, courses });
}

export const GET = withErrorHandling(getHandler);
