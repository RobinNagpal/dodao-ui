import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';

async function getHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ body: 'No spaceId provided' }, { status: 400 });
  const bytes = await prisma.byte.findMany({ where: { spaceId: spaceId } });
  return NextResponse.json({ bytes }, { status: 200 });
}

/// Wrapping handle in withErrorHandling
export const GET = withErrorHandling(getHandler);
