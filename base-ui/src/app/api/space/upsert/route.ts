import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';

export async function POST(req: Request) {
  const { adminUsernamesV1, avatar, creator, features, id, name, domains, authSettings, themeColors, verified, createdAt } = await req.json();

  const spaceInput: Space = {
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

  const space = await prisma.space.upsert({
    where: { id },
    update: { ...spaceInput, themeColors },
    create: { ...spaceInput, themeColors },
  });

  return NextResponse.json({ space }, { status: 200 });
}
