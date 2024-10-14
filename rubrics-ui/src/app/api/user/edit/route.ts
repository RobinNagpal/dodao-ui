import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { RubricUser } from '@prisma/client';

export async function POST(req: Request) {
  const { authProvider, email, username, name, phoneNumber, id, spaceId, image, publicAddress } = await req.json();

  const UserInput: Omit<RubricUser, 'id' | 'password'> = {
    authProvider,
    email,
    username,
    name,
    emailVerified: new Date(),
    phoneNumber,
    publicAddress,
    spaceId: spaceId,
    image,
  };

  const user = await prisma.rubricUser.update({
    where: { id },
    data: { ...UserInput },
  });

  return NextResponse.json({ user }, { status: 200 });
}
