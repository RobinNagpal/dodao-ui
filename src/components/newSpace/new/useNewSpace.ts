import { useNotificationContext } from '@/contexts/NotificationContext';
import { UpsertSpaceInput, useCreateSpaceMutation } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export type UseEditSpaceHelper = {
  setSpaceIntegrationField: (field: keyof UpsertSpaceInput['spaceIntegrations'], value: any) => void;
  setSpaceField: (field: keyof UpsertSpaceInput, value: any) => void;
  setInviteLinkField: (field: keyof UpsertSpaceInput['inviteLinks'], value: any) => void;
  space: UpsertSpaceInput;
  upsertSpace: () => Promise<void>;
  upserting: boolean;
};

export default function useCreateSpace(): UseEditSpaceHelper {
  const { showNotification } = useNotificationContext();

  const [space, setSpace] = useState<UpsertSpaceInput>({
    id: '',
    admins: [],
    adminUsernames: [],
    adminUsernamesV1: [],
    avatar: '',
    creator: '',
    features: [],
    inviteLinks: {},
    name: '',
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

  function setSpaceField(field: keyof UpsertSpaceInput, value: any) {
    setSpace((prev) => ({ ...prev, [field]: value }));
  }

  function setSpaceIntegrationField(field: keyof UpsertSpaceInput['spaceIntegrations'], value: any) {
    setSpace((prev) => ({ ...prev, spaceIntegrations: { ...prev.spaceIntegrations, [field]: value } }));
  }

  function setInviteLinkField(field: keyof UpsertSpaceInput['inviteLinks'], value: any) {
    setSpace((prev) => ({ ...prev, inviteLinks: { ...prev.inviteLinks, [field]: value } }));
  }

  function getSpaceInput(): UpsertSpaceInput {
    return {
      id: space.id,
      admins: space.admins,
      adminUsernames: space.adminUsernames,
      adminUsernamesV1: space.adminUsernamesV1.map((admin) => ({ username: admin.username, nameOfTheUser: admin.nameOfTheUser })) || [],
      avatar: space.avatar,
      creator: space.creator,
      features: space.features,
      name: space.name,
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
      response = await createSpaceMutation({
        variables: {
          spaceInput: getSpaceInput(),
        },
      });
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
    setSpaceField,
    setSpaceIntegrationField,
    setInviteLinkField,
    upsertSpace,
    upserting,
  };
}
