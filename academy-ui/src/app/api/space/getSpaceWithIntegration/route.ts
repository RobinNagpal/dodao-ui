import { prisma } from '@/prisma';
import { Space } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function getSpaceWithIntegrations(spaceId: string) {
  const space: Space = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });

  const spaceIntegrations = await prisma.spaceIntegration.findUnique({ where: { spaceId } });
  return { ...space, spaceIntegrations };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const spaceId = searchParams.get('spaceId');
  if (!spaceId) return { status: 400, body: 'No spaceId passed in request' };
  const response = await getSpaceWithIntegrations(spaceId);
  return NextResponse.json({ status: 200, body: response });
}
