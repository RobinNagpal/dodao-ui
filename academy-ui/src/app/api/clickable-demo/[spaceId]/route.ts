import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params: { spaceId } }: { params: { spaceId: string } }) {
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

  return NextResponse.json({ status: 200, clickableDemos });
}
