import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return NextResponse.json({ status: 400, body: 'No spaceId provided' });
  const guides = await prisma.guide.findMany({ where: { spaceId: spaceId } });
  return NextResponse.json({ status: 200, guides });
}
