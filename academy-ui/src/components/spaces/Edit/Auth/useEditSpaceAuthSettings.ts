import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { AuthSettings, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export type UpdateSpaceAuthSettingsHelper = {
  setAuthSettingsField: (field: keyof AuthSettings, value: any) => void;
  updateAuthSettings: () => Promise<void>;
  authSettings: AuthSettings;
  updating: boolean;
};

export function useEditSpaceAuthSettings(space: SpaceWithIntegrationsFragment): UpdateSpaceAuthSettingsHelper {
  const [authSettings, setAuthSettings] = useState<AuthSettings>(space.authSettings || {});
  const [updating, setUpdating] = useState(false);
  const { showNotification } = useNotificationContext();

  function setAuthSettingsField(field: keyof AuthSettings, value: any) {
    setAuthSettings({
      ...authSettings,
      [field]: value,
    });
  }

  async function updateAuthSettings() {
    try {
      setUpdating(true);
      const response = await fetch('/api/spaces/update-auth-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          input: {
            enableLogin: !!authSettings.enableLogin,
            loginOptions: authSettings.loginOptions || [],
          },
        }),
      });
      if (response.ok) {
        const updatedSpace: SpaceWithIntegrationsFragment = await response.json();
        setAuthSettings({
          ...updatedSpace.authSettings,
        });
        showNotification({ type: 'success', message: 'Auth settings updated' });
      } else {
        showNotification({ type: 'error', message: 'Failed to update auth settings' });
      }
      setUpdating(false);
    } catch (e) {
      console.log(e);
      showNotification({ type: 'error', message: 'Failed to update auth settings' });
      setUpdating(false);
    }
  }

  return {
    authSettings,
    setAuthSettingsField,
    updateAuthSettings,
    updating,
  };
}
