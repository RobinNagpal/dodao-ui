import { SpaceTags } from '@/utils/api/fetchTags';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { UpsertSpaceInput, useExtendedSpaceQuery } from '@/graphql/generated/generated-types';
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
      spaceApiKeys: [],
    },
  });

  const [upserting, setUpserting] = useState(false);

  async function initialize() {
    if (spaceId) {
      const response = await fetch(`/api/spaces/${spaceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          tags: [SpaceTags.GET_SPACE.toString()],
        },
      });

      if (response.ok) {
        const res = await response.json();
        setSpace(getEditSpaceType(res.space));
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
        response = await fetch(`/api/${spaceId}/actions/spaces/update-space-and-integration`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ spaceInput: getSpaceInput(spaceId, space) }),
        });
      } else {
        response = await fetch(`/api/spaces/create-space`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ spaceInput: getSpaceInput(slugify(space.name), space) }),
        });
      }

      if (response?.ok) {
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
