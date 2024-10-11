import { withErrorHandling } from '@/app/api/helpers/middlewares/withErrorHandling';
import { prisma } from '@/prisma';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/authOptions';
import { NextResponse } from 'next/server';

async function getHandler() {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: session.username,
        spaceId: session.spaceId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function putHandler(request: Request) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, email, phoneNumber, username, spaceId } = await request.json();

  if (username !== session.username || spaceId !== session.spaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { username_spaceId: { username: session.username, spaceId: session.spaceId } },
      data: { name: name, email: email, phoneNumber: phoneNumber },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function postHandler(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const { spaceId, ...userData } = body;

  try {
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        emailVerified: userData.emailVerified,
        image: null,
        publicAddress: userData.publicAddress,
        spaceId: spaceId,
        username: userData.username,
        authProvider: userData.authProvider,
        phoneNumber: userData.phoneNumber,
      },
    });

    return NextResponse.json({ user: user });
  } catch (error) {
    console.error('Error handling user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withErrorHandling(postHandler);
export const GET = withErrorHandling(getHandler);
export const PUT = withErrorHandling(putHandler);
