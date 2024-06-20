import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { User } from '@prisma/client';

export async function POST(req: Request) {
  const { authProvider, email, username, name, phone_number, id, spaceId, image, publicAddress } = await req.json();

  const UserInput: Omit<User, 'id'> = {
    authProvider,
    email,
    username,
    name,
    emailVerified: new Date(),
    phone_number,
    publicAddress,
    spaceId: spaceId,
    image,
  };

  const space = await prisma.user.update({
    where: { id },
    data: { ...UserInput },
  });

  return NextResponse.json({ space }, { status: 200 });
}
