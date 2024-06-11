import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { UpsertSpaceInput, useCreateSpaceMutation, useExtendedSpaceQuery, useUpdateSpaceMutation } from '@/graphql/generated/generated-types';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { getEditSpaceType, getSpaceInput, SpaceEditType } from '@/utils/space/spaceUpdateUtils';
import { useState } from 'react';

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
        setSpace(getEditSpaceType(spaceResponse));
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

  async function upsertSpace() {
    setUpserting(true);
    try {
      let response;
      if (spaceId?.trim()) {
        response = await updateSpaceMutation({
          variables: {
            spaceInput: getSpaceInput(spaceId, space),
          },
        });
      } else {
        response = await createSpaceMutation({
          variables: {
            spaceInput: getSpaceInput(slugify(space.name), space),
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
