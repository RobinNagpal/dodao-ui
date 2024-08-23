import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { Space, SpaceTypes, useCreateNewTidbitSpaceMutation, useGetSpaceFromCreatorQuery } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { isSuperAdmin } from '@dodao/web-core/utils/auth/superAdmins';
import { getEditSpaceType, getSpaceInput, SpaceEditType } from '@/utils/space/spaceUpdateUtils';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface TidbitSpaceType {
  id?: string;
  name: string;
  avatar: string;
}

export type UseEditSpaceHelper = {
  setSpaceField: (field: keyof TidbitSpaceType, value: any) => void;
  tidbitSpace: TidbitSpaceType;
  createNewTidbitSpace: (params: { successCallback: (space: Space) => void; failureCallback?: () => void }) => Promise<void>;
  updateTidbitSpace: (params: { successCallback: (space: Space) => void; failureCallback?: () => void }) => Promise<void>;
  upserting: boolean;
  loading: boolean;
  existingSpace: Space | null;
};

export default function useCreateNewTidbitSpace(): UseEditSpaceHelper {
  const { showNotification } = useNotificationContext();
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;

  const [loading, setLoading] = useState(false);
  const [existingSpace, setExistingSpace] = useState<Space | null>(null);
  const superAdmin = !!(session && isSuperAdmin(session as Session));

  const {
    data: spaceByUsername,
    loading: loadingSpaceByUsername,
    refetch: refetchSpaceByUsername,
  } = useGetSpaceFromCreatorQuery({
    variables: {
      creatorUsername: session?.username!,
    },
    skip: !session?.username,
  });

  const [tidbitSpace, setTidbitSpace] = useState<TidbitSpaceType>({
    name: '',
    avatar: '',
  });

  const [upserting, setUpserting] = useState(false);

  const [createNewTidbitSpaceMutation] = useCreateNewTidbitSpaceMutation();

  useEffect(() => {
    if (session) {
      refetchSpaceByUsername();
    }
  }, [session]);

  useEffect(() => {
    if (spaceByUsername?.getSpaceFromCreator && !superAdmin) {
      const space = spaceByUsername.getSpaceFromCreator;
      setExistingSpace(space);
      setTidbitSpace({ id: space.id, name: space.name, avatar: space.avatar || '' });
    }
  }, [spaceByUsername]);

  useEffect(() => {
    setLoading(loadingSpaceByUsername);
  }, [loadingSpaceByUsername]);

  function setSpaceField(field: keyof TidbitSpaceType, value: any) {
    if (field === 'name' && !existingSpace?.id) {
      setTidbitSpace((prev) => ({ ...prev, id: slugify(value) }));
    }
    setTidbitSpace((prev) => ({ ...prev, [field]: value }));
  }

  async function createNewTidbitSpace(params: { successCallback: (space: Space) => void; failureCallback?: () => void }): Promise<void> {
    const { successCallback } = params;
    setUpserting(true);
    try {
      const response = await createNewTidbitSpaceMutation({
        variables: {
          spaceInput: getSpaceInput(tidbitSpace.id!, {
            admins: [],
            adminUsernames: [],
            adminUsernamesV1: [],
            avatar: tidbitSpace.avatar,
            creator: session?.username!,
            features: [],
            inviteLinks: {},
            name: tidbitSpace.name,
            type: SpaceTypes.TidbitsSite,
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
          }),
        },
      });

      if (response.data) {
        const userResponse = await fetch('/api/auth/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // TODO - handle recreating the user if not already created
        if (!userResponse.ok) {
          showNotification({ type: 'error', message: 'Something went wrong' });
          setUpserting(false);
          return;
        }
        const userData = await userResponse.json();

        const createUserResponse = await fetch('/api/auth/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...userData,
            spaceId: response.data?.createNewTidbitSpace.id,
          }),
        });
        if (!createUserResponse.ok) {
          showNotification({ type: 'error', message: 'Something went wrong' });
          setUpserting(false);
          return;
        } else {
          successCallback(response.data.createNewTidbitSpace);
          return;
        }
      } else {
        showNotification({ type: 'error', message: 'Something went wrong' });
        setUpserting(false);
        return;
      }
    } catch (error) {
      console.error(error);
      showNotification({ type: 'error', message: 'Error while upserting space' });
      setUpserting(false);

      throw error;
    }
  }

  async function updateTidbitSpace(params: { successCallback: (space: Space) => void; failureCallback?: () => void }) {
    const { successCallback } = params;
    setUpserting(true);
    const spaceToUpdate: SpaceEditType = {
      ...getEditSpaceType(existingSpace!),
      name: tidbitSpace.name,
      avatar: tidbitSpace.avatar,
      type: SpaceTypes.TidbitsSite,
    };
    const response = await fetch(`${getBaseUrl()}/api/spaces/update-space`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ spaceInput: getSpaceInput(tidbitSpace.id!, spaceToUpdate) }),
    });
    if (response.ok) {
      setUpserting(false);
      successCallback((await response.json()).space);
    } else {
      setUpserting(false);
      showNotification({ type: 'error', message: 'Error while updating space' });
    }
  }

  return {
    tidbitSpace,
    setSpaceField,
    createNewTidbitSpace,
    updateTidbitSpace,
    upserting,
    loading,
    existingSpace,
  };
}
