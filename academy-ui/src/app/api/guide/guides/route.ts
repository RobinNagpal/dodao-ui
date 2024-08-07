import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });
  const guides = await prisma.guide.findMany({ where: { spaceId: spaceId, archive: false } });
  return NextResponse.json({ guides }, { status: 200 });
}

export const GET = withErrorHandling(getHandler);
