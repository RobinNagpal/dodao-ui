import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';

interface AddApiKeyRequest {
  spaceId: string;
  creator: string;
  apiKey: string;
}

interface AddApiKeyResponse {
  space: SpaceWithIntegrationsFragment;
}

export interface AddSpaceKeyHook {
  addApiKey: (apiKey: string) => void;
}

export function useAddSpaceApiKey(space: SpaceWithIntegrationsFragment, onUpdate: (space: any) => void): AddSpaceKeyHook {
  const { showNotification } = useNotificationContext();
  const { postData } = useFetchUtils();
  const { data: clientSession } = useSession() as { data: Session | null };

  const addApiKey = async (apiKey: string) => {
    const username = clientSession?.username;
    if (!username) {
      showNotification({ type: 'error', message: 'No session present for user' });
      return;
    }

    // Simulate generating a new API key
    const response = await postData<AddApiKeyResponse, AddApiKeyRequest>(
      `${getBaseUrl()}/api/${space.id}/actions/spaces/generate-api-key`,
      {
        spaceId: space.id,
        creator: username,
        apiKey: apiKey,
      },
      {
        errorMessage: 'Failed to add new API key',
        successMessage: 'API key added successfully',
      }
    );

    onUpdate(response!.space);
  };
  return {
    addApiKey,
  };
}
