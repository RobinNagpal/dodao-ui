import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';

export async function GET(req: NextRequest): Promise<NextResponse<Space[] | { error: string }>> {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Creator username is required' }, { status: 400 });
  }

  const spaceMappings = await prisma.user
    .findMany({
      where: { username: username },
      select: { spaceId: true },
    })
    
  const spaceIds = spaceMappings.map(mapping => mapping.spaceId);
  
  if (spaceIds.length === 0) {
    return NextResponse.json([], { status: 200 });
  } else {
    const spaces = await prisma.space.findMany({
      where: { id: { in: spaceIds } },
    });
    return NextResponse.json(spaces as Space[], { status: 200 });
  }
}
