import { prisma } from '@/prisma';
import { Space, SpaceIntegration } from '@prisma/client';

export async function getSpaceWithIntegrations(spaceId: string): Promise<Space & { spaceIntegrations: SpaceIntegration | null }> {
  const space: Space = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });

  const spaceIntegrations = await prisma.spaceIntegration.findUnique({ where: { spaceId } });
  return { ...space, spaceIntegrations };
}

export async function getSpaceIdForDomain(domain: string): Promise<string> {
  const space = await prisma.space.findFirst({
    where: {
      OR: [
        {
          domains: {
            has: domain,
          },
        },
        {
          botDomains: {
            has: domain,
          },
        },
      ],
    },
  });
  if (space) {
    return space.id;
  }

  if (domain === 'dodao-ui-robinnagpal.vercel.app' || domain === 'localhost') {
    return 'test-academy-eth';
  }

  return 'test-academy-eth';
}
