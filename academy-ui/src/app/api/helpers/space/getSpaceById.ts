import { prisma } from '@/prisma';
import { Space } from '@prisma/client';

export async function getSpaceById(spaceId: string): Promise<Space> {
  return prisma.space.findUniqueOrThrow({ where: { id: spaceId } });
}
