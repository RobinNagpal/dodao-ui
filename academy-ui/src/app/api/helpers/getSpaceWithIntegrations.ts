import { prisma } from '@/prisma';
import { SpaceApiKeyDto, SpaceIntegrationsDto, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Space } from '@prisma/client';

export async function getSpaceWithIntegrations(spaceId: string): Promise<SpaceWithIntegrationsDto> {
  // Fetch the Space details
  const space: Space = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });

  return getWithIntegrations(space);
}

export async function getWithIntegrations(space: Space): Promise<SpaceWithIntegrationsDto> {
  // Fetch the SpaceIntegration details
  const spaceIntegrations = await prisma.spaceIntegration.findUniqueOrThrow({
    where: { spaceId: space.id },
  });

  if (spaceIntegrations && spaceIntegrations.spaceApiKeys) {
    // Exclude apiKey from each object in the SpaceApiKeys array
    const sanitizedSpaceApiKeys: SpaceApiKeyDto[] = spaceIntegrations.spaceApiKeys.map(({ apiKey, ...rest }) => rest);
    const integrations: SpaceIntegrationsDto = {
      ...(spaceIntegrations as SpaceIntegrationsDto),
      spaceApiKeys: sanitizedSpaceApiKeys,
    };
    return {
      ...space,
      themeColors: space.themeColors && { ...space.themeColors, primaryTextColor: space.themeColors.primaryTextColor || '#ffffff' },
      spaceIntegrations: integrations,
    };
  }

  // Return the space with spaceIntegrations possibly as null if not found
  return { ...space, spaceIntegrations };
}
