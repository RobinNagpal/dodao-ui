import { useNotificationContext } from '@/contexts/NotificationContext';
import { UpsertSpaceInput, useCreateSpaceMutation, useExtendedSpaceQuery, useUpdateSpaceMutation } from '@/graphql/generated/generated-types';
import { slugify } from '@/utils/auth/slugify';
import { useState } from 'react';

export interface SpaceEditType extends Omit<UpsertSpaceInput, 'id'> {
  id?: string;
}

export type UseEditSpaceHelper = {
  setSpaceIntegrationField: (field: keyof UpsertSpaceInput['spaceIntegrations'], value: any) => void;
  setSpaceField: (field: keyof UpsertSpaceInput, value: any) => void;
  setInviteLinkField: (field: keyof UpsertSpaceInput['inviteLinks'], value: any) => void;
  initialize: () => Promise<void>;
  space: SpaceEditType;
  upsertSpace: () => Promise<void>;
  upserting: boolean;
};

export default function useEditSpace(spaceId?: string): UseEditSpaceHelper {
  const { showNotification } = useNotificationContext();
  const [space, setSpace] = useState<SpaceEditType>({
    id: spaceId,
    admins: [],
    adminUsernames: [],
    adminUsernamesV1: [],
    avatar: '',
    creator: '',
    features: [],
    inviteLinks: {},
    name: '',
    type: '',
    skin: 'dodao',
    domains: [],
    botDomains: [],
    spaceIntegrations: {
      academyRepository: null,
      discordGuildId: null,
      gitGuideRepositories: [],
      gnosisSafeWallets: [],
      projectGalaxyTokenLastFour: null,
    },
  });

  const [upserting, setUpserting] = useState(false);

  const { refetch: querySpace } = useExtendedSpaceQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: true,
  });

  const [updateSpaceMutation] = useUpdateSpaceMutation();
  const [createSpaceMutation] = useCreateSpaceMutation();

  async function initialize() {
    if (spaceId) {
      const response = await querySpace();
      const spaceResponse = response.data.space;
      if (spaceResponse) {
        setSpace({
          id: spaceResponse.id,
          admins: spaceResponse.admins,
          adminUsernames: spaceResponse.adminUsernames,
          adminUsernamesV1: spaceResponse.adminUsernamesV1.map((admin) => ({ username: admin.username, nameOfTheUser: admin.nameOfTheUser })) || [],
          avatar: spaceResponse.avatar || '',
          creator: spaceResponse.creator,
          features: spaceResponse.features,
          inviteLinks: spaceResponse.inviteLinks || {},
          name: spaceResponse.name,
          type: space.type,
          skin: spaceResponse.skin,
          domains: spaceResponse.domains,
          botDomains: spaceResponse.botDomains || [],
          spaceIntegrations: {
            academyRepository: spaceResponse.spaceIntegrations?.academyRepository || null,
            discordGuildId: spaceResponse.spaceIntegrations?.discordGuildId || null,
            gitGuideRepositories: spaceResponse.spaceIntegrations?.gitGuideRepositories || [],
            gnosisSafeWallets: spaceResponse.spaceIntegrations?.gnosisSafeWallets || [],
            projectGalaxyTokenLastFour: spaceResponse.spaceIntegrations?.projectGalaxyTokenLastFour || null,
          },
        });
      }
    }
  }

  function setSpaceField(field: keyof UpsertSpaceInput, value: any) {
    setSpace((prev) => ({ ...prev, [field]: value }));
  }

  function setSpaceIntegrationField(field: keyof UpsertSpaceInput['spaceIntegrations'], value: any) {
    setSpace((prev) => ({ ...prev, spaceIntegrations: { ...prev.spaceIntegrations, [field]: value } }));
  }

  function setInviteLinkField(field: keyof UpsertSpaceInput['inviteLinks'], value: any) {
    setSpace((prev) => ({ ...prev, inviteLinks: { ...prev.inviteLinks, [field]: value } }));
  }

  function getSpaceInput(spaceId: string): UpsertSpaceInput {
    return {
      id: spaceId,
      admins: space.admins,
      adminUsernames: space.adminUsernames,
      adminUsernamesV1: space.adminUsernamesV1.map((admin) => ({ username: admin.username, nameOfTheUser: admin.nameOfTheUser })) || [],
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
      },
    };
  }

  async function upsertSpace() {
    setUpserting(true);
    try {
      let response;
      if (spaceId?.trim()) {
        response = await updateSpaceMutation({
          variables: {
            spaceInput: getSpaceInput(spaceId),
          },
        });
      } else {
        response = await createSpaceMutation({
          variables: {
            spaceInput: getSpaceInput(slugify(space.name)),
          },
        });
      }

      if (response.data) {
        showNotification({ type: 'success', message: 'Space upserted successfully' });
      } else {
        showNotification({ type: 'error', message: 'Error while upserting space' });
      }
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message: 'Error while upserting space' });
      setUpserting(false);
      throw error;
    }
    setUpserting(false);
  }

  return {
    space,
    initialize,
    setSpaceField,
    setSpaceIntegrationField,
    setInviteLinkField,
    upsertSpace,
    upserting,
  };
}
