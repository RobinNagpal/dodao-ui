import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

async function getHandler(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });
  const guides = await prisma.guide.findMany({ where: { spaceId: spaceId, archive: false } });
  return NextResponse.json({ guides }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
