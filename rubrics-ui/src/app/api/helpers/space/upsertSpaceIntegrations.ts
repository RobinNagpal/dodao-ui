import { UpsertSpaceInput } from '@/graphql/generated/generated-types';
import { prisma } from '@/prisma';
import { DoDaoJwtTokenPayload } from '@dodao/web-core/types/auth/Session';
import { v4 } from 'uuid';

export async function upsertSpaceIntegrations(spaceInput: UpsertSpaceInput, user: DoDaoJwtTokenPayload) {
  await prisma.spaceIntegration.upsert({
    create: {
      id: v4(),
      spaceId: spaceInput.id,
      academyRepository: spaceInput.spaceIntegrations.academyRepository,
      discordGuildId: spaceInput.spaceIntegrations.discordGuildId,
      gitGuideRepositories: spaceInput.spaceIntegrations.gitGuideRepositories,
      gnosisSafeWallets: JSON.stringify(spaceInput.spaceIntegrations.gnosisSafeWallets),

      projectGalaxyTokenLastFour: spaceInput.spaceIntegrations.projectGalaxyTokenLastFour,
      updatedAt: new Date(),
      updatedBy: user.accountId,
    },
    update: {
      spaceId: spaceInput.id,
      academyRepository: spaceInput.spaceIntegrations.academyRepository,
      discordGuildId: spaceInput.spaceIntegrations.discordGuildId,
      gitGuideRepositories: spaceInput.spaceIntegrations.gitGuideRepositories,
      gnosisSafeWallets: JSON.stringify(spaceInput.spaceIntegrations.gnosisSafeWallets),
      projectGalaxyTokenLastFour: spaceInput.spaceIntegrations.projectGalaxyTokenLastFour,
      updatedBy: user.accountId,
    },
    where: {
      spaceId: spaceInput.id,
    },
  });
}
