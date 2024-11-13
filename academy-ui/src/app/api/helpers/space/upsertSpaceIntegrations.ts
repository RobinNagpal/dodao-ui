import { prisma } from '@/prisma';
import { UpsertSpaceInputDto } from '@/types/space/SpaceDto';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { v4 } from 'uuid';

export async function upsertSpaceIntegrations(spaceInput: UpsertSpaceInputDto, user: DoDaoJwtTokenPayload) {
  await prisma.spaceIntegration.upsert({
    create: {
      id: v4(),
      spaceId: spaceInput.id,
      discordGuildId: spaceInput.spaceIntegrations.discordGuildId,
      projectGalaxyTokenLastFour: spaceInput.spaceIntegrations.projectGalaxyTokenLastFour,
      updatedAt: new Date(),
      updatedBy: user.accountId,
    },
    update: {
      spaceId: spaceInput.id,
      discordGuildId: spaceInput.spaceIntegrations.discordGuildId,
      projectGalaxyTokenLastFour: spaceInput.spaceIntegrations.projectGalaxyTokenLastFour,
      updatedBy: user.accountId,
    },
    where: {
      spaceId: spaceInput.id,
    },
  });
}
