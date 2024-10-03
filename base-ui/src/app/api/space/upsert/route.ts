import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { BaseSpace } from '@prisma/client';

export async function POST(req: Request) {
  const { adminUsernamesV1, avatar, creator, features, id, name, domains, authSettings, themeColors, verified, createdAt } = await req.json();

  const spaceInput: BaseSpace = {
    id,
    name,
    creator,
    avatar,
    features,
    domains,
    authSettings,
    adminUsernamesV1,
    themeColors,
    verified,
    createdAt,
    updatedAt: new Date(),
  };

  const space = await prisma.baseSpace.upsert({
    where: { id },
    update: { ...spaceInput, themeColors },
    create: { ...spaceInput, themeColors },
  });

  return NextResponse.json({ space }, { status: 200 });
}
