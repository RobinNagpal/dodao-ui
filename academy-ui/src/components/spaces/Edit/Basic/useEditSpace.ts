import { UpsertSpaceInput } from '@/graphql/generated/generated-types';
import { SpaceTags } from '@/utils/api/fetchTags';
import { getEditSpaceType, getSpaceInput, SpaceEditType } from '@/utils/space/spaceUpdateUtils';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
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

interface SpaceUpsertRequest {
  spaceInput: UpsertSpaceInput;
}

export default function useEditSpace(spaceId?: string): UseEditSpaceHelper {
  const { showNotification } = useNotificationContext();
  const { postData, putData } = useFetchUtils();
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

    if (spaceId?.trim()) {
      await putData<SpaceEditType, SpaceUpsertRequest>(
        `/api/${spaceId}/actions/spaces/update-space-and-integration`,
        { spaceInput: getSpaceInput(spaceId, space) },
        {
          errorMessage: 'Failed to update space',
          successMessage: 'Space updated successfully',
        }
      );
    } else {
      await postData<SpaceEditType, SpaceUpsertRequest>(
        `/api/spaces/create-space`,
        { spaceInput: getSpaceInput(slugify(space.name), space) },
        {
          errorMessage: 'Failed to create space',
          successMessage: 'Space created successfully',
        }
      );
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
