import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { UserDto } from '@/types/user/UserDto';
import { getDecodedJwtFromContext } from '@dodao/web-core/api/auth/getJwtFromContext';

async function getHandler(req: NextRequest): Promise<NextResponse<UserDto | { error: string }>> {
  const session = await getDecodedJwtFromContext(req);
  if (!session) return NextResponse.json({ error: 'No session found' }, { status: 401 });

  const user = await prisma.user.findFirstOrThrow({
    where: { username: session.username },
  });

  return NextResponse.json(user as UserDto, { status: 200 });
}

export const GET = withErrorHandlingV1<UserDto>(getHandler);
