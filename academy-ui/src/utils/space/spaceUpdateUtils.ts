import { Space, UpsertSpaceInput } from '@/graphql/generated/generated-types';

export interface SpaceEditType extends Omit<UpsertSpaceInput, 'id'> {
  id?: string;
}

export function getSpaceInput(spaceId: string, space: SpaceEditType): UpsertSpaceInput {
  return {
    id: spaceId,
    admins: space.admins,
    adminUsernames: space.adminUsernames,
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
    skin: space.skin,
    domains: space.domains,
    botDomains: space.botDomains || [],
    inviteLinks: {
      discordInviteLink: space.inviteLinks.discordInviteLink,
      showAnimatedButtonForDiscord: space.inviteLinks.showAnimatedButtonForDiscord,
      showAnimatedButtonForTelegram: space.inviteLinks.showAnimatedButtonForTelegram,
      telegramInviteLink: space.inviteLinks.telegramInviteLink,
    },
    spaceIntegrations: {
      academyRepository: space.spaceIntegrations?.academyRepository || null,
      discordGuildId: space.spaceIntegrations?.discordGuildId || null,
      gitGuideRepositories:
        space.spaceIntegrations?.gitGuideRepositories?.map((repo) => ({
          authenticationToken: repo.authenticationToken,
          gitRepoType: repo.gitRepoType,
          repoUrl: repo.repoUrl,
        })) || [],
      gnosisSafeWallets: space.spaceIntegrations?.gnosisSafeWallets || [],
      projectGalaxyTokenLastFour: space.spaceIntegrations?.projectGalaxyTokenLastFour || null,
      spaceApiKeys: space.spaceIntegrations?.spaceApiKeys || [],
    },
  };
}

export function getEditSpaceType(spaceResponse: Space): SpaceEditType {
  const spaceEditType = {
    id: spaceResponse.id,
    admins: spaceResponse.admins,
    adminUsernames: spaceResponse.adminUsernames,
    adminUsernamesV1:
      spaceResponse.adminUsernamesV1.map((admin) => ({
        username: admin.username,
        nameOfTheUser: admin.nameOfTheUser,
      })) || [],
    avatar: spaceResponse.avatar || '',
    creator: spaceResponse.creator,
    features: spaceResponse.features,
    inviteLinks: spaceResponse.inviteLinks || {},
    name: spaceResponse.name,
    type: spaceResponse.type,
    skin: spaceResponse.skin,
    domains: spaceResponse.domains,
    botDomains: spaceResponse.botDomains || [],
    spaceIntegrations: {
      academyRepository: spaceResponse.spaceIntegrations?.academyRepository || null,
      discordGuildId: spaceResponse.spaceIntegrations?.discordGuildId || null,
      gitGuideRepositories: spaceResponse.spaceIntegrations?.gitGuideRepositories || [],
      gnosisSafeWallets: spaceResponse.spaceIntegrations?.gnosisSafeWallets || [],
      projectGalaxyTokenLastFour: spaceResponse.spaceIntegrations?.projectGalaxyTokenLastFour || null,
      spaceApiKeys: spaceResponse.spaceIntegrations?.spaceApiKeys || [],
    },
  };
  return spaceEditType;
}
