import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { Space } from '@prisma/client';

export async function POST(req: Request) {
  const { adminUsernamesV1, avatar, creator, features, id, name, domains, authSettings, themeColors } = await req.json();

  const spaceInput: Space = {
    adminUsernamesV1,
    avatar,
    creator,
    features: features || [],
    id,
    name,
    createdAt: new Date(),
    verified: true,
    updatedAt: new Date(),
    domains,
    authSettings: authSettings,
    themeColors: themeColors,
  };

  const space = await prisma.space.create({
    data: { ...spaceInput, themeColors },
  });

  return NextResponse.json({ space }, { status: 200 });
}
