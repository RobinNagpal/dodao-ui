import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<Space[] | { error: string }>> {
  const session = await getDecodedJwtFromContext(req);
  if (!session) return NextResponse.json({ error: 'No session found' }, { status: 401 });

  const spaces = await prisma.space.findMany({
    where: {
      creator: session.username,
    },
  });

  return NextResponse.json(spaces as Space[], { status: 200 });
}
