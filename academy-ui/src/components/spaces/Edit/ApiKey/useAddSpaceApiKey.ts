import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { Session } from '@dodao/web-core/types/auth/Session';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';

export function useAddSpaceApiKey(space: SpaceWithIntegrationsFragment, onUpdate: (space: any) => void) {
  const { showNotification } = useNotificationContext();
  const { data: clientSession } = useSession() as { data: Session | null };

  const addApiKey = async (apiKey: string) => {
    try {
      // Simulate generating a new API key
      const response = await fetch(`${getBaseUrl()}/api/actions/spaces/generate-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          creator: clientSession?.username,
          apiKey: apiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.space);
        showNotification({ type: 'success', message: 'API key added successfully' });
      } else {
        throw new Error('Failed to add new API key');
      }
    } catch (error) {
      console.error('Error adding new API key:', error);
      showNotification({ type: 'error', message: 'Failed to add new API key' });
    }
  };
  return {
    addApiKey,
  };
}
