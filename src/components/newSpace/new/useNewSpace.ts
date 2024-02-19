import { useNotificationContext } from '@/contexts/NotificationContext';
import { UpsertSpaceInput, useCreateSpaceMutation } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export type UseEditSpaceHelper = {
  setSpaceIntegrationField: (field: keyof UpsertSpaceInput['spaceIntegrations'], value: any) => void;
  setNewSpaceField: (field: keyof UpsertSpaceInput, value: any) => void;
  setInviteLinkField: (field: keyof UpsertSpaceInput['inviteLinks'], value: any) => void;
  newSpace: UpsertSpaceInput;
  createSpace: () => Promise<void>;
  upserting: boolean;
};

export default function useCreateSpace(): UseEditSpaceHelper {
  const { showNotification } = useNotificationContext();
  const [newSpace, setSpace] = useState<UpsertSpaceInput>({
    id: '',
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

  const [createSpaceMutation] = useCreateSpaceMutation();

  function setNewSpaceField(field: keyof UpsertSpaceInput, value: any) {
    setSpace((prev) => ({ ...prev, [field]: value }));
  }

  function setSpaceIntegrationField(field: keyof UpsertSpaceInput['spaceIntegrations'], value: any) {
    setSpace((prev) => ({ ...prev, newSpaceIntegrations: { ...prev.spaceIntegrations, [field]: value } }));
  }

  function setInviteLinkField(field: keyof UpsertSpaceInput['inviteLinks'], value: any) {
    setSpace((prev) => ({ ...prev, inviteLinks: { ...prev.inviteLinks, [field]: value } }));
  }

  function getSpaceInput(): UpsertSpaceInput {
    return {
      id: newSpace.id,
      admins: newSpace.admins,
      type: newSpace.type,
      adminUsernames: [],
      adminUsernamesV1: newSpace.adminUsernamesV1.map((admin) => ({ username: admin.username, nameOfTheUser: admin.nameOfTheUser })) || [],
      avatar: newSpace.avatar,
      creator: newSpace.creator,
      features: newSpace.features,
      name: newSpace.name,
      skin: newSpace.skin,
      domains: newSpace.domains,
      botDomains: newSpace.botDomains || [],
      inviteLinks: {
        discordInviteLink: newSpace.inviteLinks.discordInviteLink,
        showAnimatedButtonForDiscord: newSpace.inviteLinks.showAnimatedButtonForDiscord,
        showAnimatedButtonForTelegram: newSpace.inviteLinks.showAnimatedButtonForTelegram,
        telegramInviteLink: newSpace.inviteLinks.telegramInviteLink,
      },
      spaceIntegrations: {
        academyRepository: newSpace.spaceIntegrations?.academyRepository || null,
        discordGuildId: newSpace.spaceIntegrations?.discordGuildId || null,
        gitGuideRepositories:
          newSpace.spaceIntegrations?.gitGuideRepositories?.map((repo) => ({
            authenticationToken: repo.authenticationToken,
            gitRepoType: repo.gitRepoType,
            repoUrl: repo.repoUrl,
          })) || [],
        gnosisSafeWallets: newSpace.spaceIntegrations?.gnosisSafeWallets || [],
        projectGalaxyTokenLastFour: newSpace.spaceIntegrations?.projectGalaxyTokenLastFour || null,
      },
    };
  }

  async function createSpace() {
    setUpserting(true);
    try {
      let response;
      response = await createSpaceMutation({
        variables: {
          spaceInput: getSpaceInput(),
        },
      });
      if (response.data) {
        showNotification({ type: 'success', message: 'Space upserted successfully' });
      } else {
        showNotification({ type: 'error', message: 'Error while upserting newSpace' });
      }
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message: 'Error while upserting newSpace' });
      setUpserting(false);
      throw error;
    }
    setUpserting(false);
  }

  return {
    newSpace,
    setNewSpaceField,
    setSpaceIntegrationField,
    setInviteLinkField,
    createSpace,
    upserting,
  };
}
