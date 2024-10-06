import { prisma } from '@/prisma';
import { RubricSpace } from '@prisma/client';

export async function getSpaceById(spaceId: string): Promise<RubricSpace> {
  return prisma.rubricSpace.findUniqueOrThrow({ where: { id: spaceId } });
}
