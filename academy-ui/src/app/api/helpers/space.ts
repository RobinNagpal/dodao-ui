import { prisma } from '@/prisma';
import { SpaceApiKeyDto, SpaceIntegrationsDto, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Space } from '@prisma/client';

export async function getSpaceWithIntegrations(spaceId: string): Promise<SpaceWithIntegrationsDto> {
  // Fetch the Space details
  const space: Space = await prisma.space.findUniqueOrThrow({ where: { id: spaceId } });

  // Fetch the SpaceIntegration details
  const spaceIntegrations = await prisma.spaceIntegration.findUniqueOrThrow({
    where: { spaceId },
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
      spaceIntegrations: integrations,
    };
  }

  // Return the space with spaceIntegrations possibly as null if not found
  return { ...space, spaceIntegrations };
}
