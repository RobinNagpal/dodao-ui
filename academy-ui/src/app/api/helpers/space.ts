import { prisma } from '@/prisma';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Space } from '@prisma/client';

export async function getSpaceWithIntegrations(spaceId: string): Promise<SpaceWithIntegrationsDto> {
  // Fetch the Space details
  const space: Space = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });

  // Fetch the SpaceIntegration details
  const spaceIntegrations = await prisma.spaceIntegration.findUnique({
    where: { spaceId },
  });

  if (spaceIntegrations && spaceIntegrations.spaceApiKeys) {
    // Exclude apiKey from each object in the SpaceApiKeys array
    const sanitizedSpaceApiKeys = spaceIntegrations.spaceApiKeys.map(({ apiKey, ...rest }) => rest);
    return {
      ...space,
      spaceIntegrations: {
        ...spaceIntegrations,
        spaceApiKeys: sanitizedSpaceApiKeys,
      },
    };
  }

  // Return the space with spaceIntegrations possibly as null if not found
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
    return process.env.DODAO_DEFAULT_SPACE_ID!;
  }

  return process.env.DODAO_DEFAULT_SPACE_ID!;
}

export async function getAllSpaceIdsForDomain(domain: string): Promise<string[]> {
  const spaces = await prisma.space.findMany({
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
  if (spaces.length) {
    return spaces.map((space) => space.id);
  }

  if (domain === 'dodao-ui-robinnagpal.vercel.app' || domain === 'localhost') {
    return [process.env.DODAO_DEFAULT_SPACE_ID!];
  }

  return [process.env.DODAO_DEFAULT_SPACE_ID!];
}
