import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<Space[] | { error: string }>> {
  const session = await getDecodedJwtFromContext(req);
  if (!session) return NextResponse.json({ error: 'No session found' }, { status: 401 });

  const spaces = await prisma.space.findMany({
    where: {
      adminUsernamesV1: {
        isEmpty: false,
      },
    },
  });

  const adminSpaces = spaces.filter((space) => space.adminUsernamesV1?.some((admin) => admin.username === session.username));

  return NextResponse.json(adminSpaces as Space[], { status: 200 });
}
