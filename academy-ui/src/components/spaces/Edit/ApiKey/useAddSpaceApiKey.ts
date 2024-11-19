import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';

interface AddApiKeyRequest {
  spaceId: string;
  creator: string;
  apiKey: string;
}

interface AddApiKeyResponse {
  space: SpaceWithIntegrationsDto;
}

export interface AddSpaceKeyHook {
  addApiKey: (apiKey: string) => void;
}

export function useAddSpaceApiKey(space: SpaceWithIntegrationsDto, onUpdate: (space: any) => void): AddSpaceKeyHook {
  const { showNotification } = useNotificationContext();
  const { postData } = usePostData<AddApiKeyResponse, AddApiKeyRequest>(
    {
      errorMessage: 'Failed to add new API key',
      successMessage: 'API key added successfully',
    },
    {}
  );
  const { data: clientSession } = useSession() as { data: Session | null };

  const addApiKey = async (apiKey: string) => {
    const username = clientSession?.username;
    if (!username) {
      showNotification({ type: 'error', message: 'No session present for user' });
      return;
    }

    // Simulate generating a new API key
    const response = await postData(`${getBaseUrl()}/api/${space.id}/actions/spaces/generate-api-key`, {
      spaceId: space.id,
      creator: username,
      apiKey: apiKey,
    });

    onUpdate(response!.space);
  };
  return {
    addApiKey,
  };
}
