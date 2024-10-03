import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { UserDto } from '@/types/user/UserDto';

async function getHandler(req: NextRequest): Promise<NextResponse<UserDto[] | { error: string; }>> {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const user = await prisma.user.findFirstOrThrow({
    where: { username: username },
  });

  return NextResponse.json([user] as UserDto[], { status: 200 });
}

export const GET = (getHandler);
