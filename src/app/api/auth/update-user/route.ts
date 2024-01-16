import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/authOptions';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, email, phone_number, username, spaceId } = await request.json();

  if (username !== session.username || spaceId !== session.spaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { username_spaceId: { username, spaceId } },
      data: { name, email, phone_number },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
