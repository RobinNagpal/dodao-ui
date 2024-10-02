import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { UserDto } from '@/types/user/UserDto';

async function getHandler(req: NextRequest, { params }: { params: { username: string; spaceId: string } }): Promise<NextResponse<UserDto[]>>  {
  const { username } = params;
    
  const user = await prisma.user.findFirstOrThrow({
    where: { username: username },
  });

  return NextResponse.json([user] as UserDto[], { status: 200 });
}

export const GET = withErrorHandlingV1<UserDto[]>(getHandler);
