import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ spaceId: string }> }): Promise<NextResponse<Space[] | { error: string }>> {
  const session = await getDecodedJwtFromContext(req);
  if (!session) return NextResponse.json({ error: 'No session found' }, { status: 401 });

  // filtering values within list of json objects is not supported so we have to use raw query
  const spaces = await prisma.$queryRaw`
  SELECT *
  FROM "spaces"
  WHERE EXISTS (
    SELECT 1
    FROM unnest("admin_usernames_v1") AS item
    WHERE item->>'username' = ${session.username}
  )
  AND "creator" != ${session.username};;
`;

  return NextResponse.json(spaces as Space[], { status: 200 });
}
