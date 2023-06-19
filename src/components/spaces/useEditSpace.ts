import { UpsertSpaceInput, useCreateSpaceMutation, useExtendedSpaceQuery, useUpdateSpaceMutation } from '@/graphql/generated/generated-types';
import { slugify } from '@/utils/auth/slugify';
import { useState } from 'react';

export interface SpaceEditType extends Omit<UpsertSpaceInput, 'id'> {
  id?: string;
}

type UseEditSpaceHelper = {
  setSpaceIntegrationField: (field: keyof UpsertSpaceInput['spaceIntegrations'], value: any) => void;
  setSpaceField: (field: keyof UpsertSpaceInput, value: any) => void;
  setInviteLinkField: (field: keyof UpsertSpaceInput['inviteLinks'], value: any) => void;
  initialize: () => Promise<void>;
  space: SpaceEditType;
  upsertSpace: () => Promise<void>;
  upserting: boolean;
};

export default function useEditSpace(spaceId?: string): UseEditSpaceHelper {
  const [space, setSpace] = useState<SpaceEditType>({
    id: spaceId,
    admins: [],
    avatar: '',
    creator: '',
    features: [],
    inviteLinks: {},
    name: '',
    skin: 'dodao',
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
          avatar: spaceResponse.avatar || '',
          creator: spaceResponse.creator,
          features: spaceResponse.features,
          inviteLinks: spaceResponse.inviteLinks || {},
          name: spaceResponse.name,
          skin: spaceResponse.skin,
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
      avatar: space.avatar,
      creator: space.creator,
      features: space.features,
      name: space.name,
      skin: space.skin,
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
      if (spaceId?.trim()) {
        await updateSpaceMutation({
          variables: {
            spaceInput: getSpaceInput(spaceId),
          },
        });
      } else {
        await createSpaceMutation({
          variables: {
            spaceInput: getSpaceInput(slugify(space.name)),
          },
        });
      }
    } catch (error) {
      console.error(error);
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
