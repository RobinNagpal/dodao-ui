import { Space } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto, UpsertSpaceInputDto } from '@/types/space/SpaceDto';

export interface SpaceEditType extends Omit<UpsertSpaceInputDto, 'id'> {
  id?: string;
}

export function getSpaceInput(spaceId: string, space: SpaceEditType): UpsertSpaceInputDto {
  return {
    id: spaceId,
    adminUsernamesV1:
      space.adminUsernamesV1.map((admin) => ({
        username: admin.username,
        nameOfTheUser: admin.nameOfTheUser,
      })) || [],
    avatar: space.avatar,
    creator: space.creator,
    features: space.features,
    name: space.name,
    type: space.type,
    domains: space.domains,
    inviteLinks: space.inviteLinks && {
      discordInviteLink: space.inviteLinks.discordInviteLink,
      showAnimatedButtonForDiscord: space.inviteLinks.showAnimatedButtonForDiscord,
      showAnimatedButtonForTelegram: space.inviteLinks.showAnimatedButtonForTelegram,
      telegramInviteLink: space.inviteLinks.telegramInviteLink,
    },
    spaceIntegrations: {
      discordGuildId: space.spaceIntegrations?.discordGuildId || undefined,
      projectGalaxyTokenLastFour: space.spaceIntegrations?.projectGalaxyTokenLastFour || undefined,
      spaceApiKeys: space.spaceIntegrations?.spaceApiKeys || [],
    },
  };
}

export function getEditSpaceType(spaceResponse: SpaceWithIntegrationsDto): SpaceEditType {
  const spaceEditType: UpsertSpaceInputDto = {
    id: spaceResponse.id,
    adminUsernamesV1:
      spaceResponse.adminUsernamesV1.map((admin) => ({
        username: admin.username,
        nameOfTheUser: admin.nameOfTheUser,
      })) || [],
    avatar: spaceResponse.avatar || '',
    creator: spaceResponse.creator,
    features: spaceResponse.features,
    inviteLinks: spaceResponse.inviteLinks || null,
    name: spaceResponse.name,
    type: spaceResponse.type,
    domains: spaceResponse.domains,
    spaceIntegrations: {
      discordGuildId: spaceResponse.spaceIntegrations?.discordGuildId || undefined,
      projectGalaxyTokenLastFour: spaceResponse.spaceIntegrations?.projectGalaxyTokenLastFour || undefined,
      spaceApiKeys: spaceResponse.spaceIntegrations?.spaceApiKeys || [],
    },
  };
  return spaceEditType;
}
