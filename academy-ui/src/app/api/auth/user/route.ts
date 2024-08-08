import { wrapToCatchError } from '@/app/api/helpers/response/apiResponseWrapper';
import { prisma } from '@/prisma';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/authOptions';
import { NextResponse } from 'next/server';

export async function GET() {
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

export async function PUT(request: Request) {
  const session: Session | null = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, email, phone_number, username, spaceId } = await request.json();

  if (username !== session.username || spaceId !== session.spaceId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const updatedUser = await prisma.user.update({
      where: { username_spaceId: { username: session.username, spaceId: session.spaceId } },
      data: { name: name, email: email, phone_number: phone_number },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function POST1(request: Request) {
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
        phone_number: userData.phone_number,
      },
    });

    return NextResponse.json({ user: user });
  } catch (error) {
    console.error('Error handling user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = wrapToCatchError((request: Request) => POST1(request));
