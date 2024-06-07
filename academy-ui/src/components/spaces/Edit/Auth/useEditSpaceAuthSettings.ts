import { useNotificationContext } from '@/contexts/NotificationContext';
import { AuthSettings, SpaceWithIntegrationsFragment, useUpdateSpaceAuthSettingsMutation } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export type UpdateSpaceAuthSettingsHelper = {
  setAuthSettingsField: (field: keyof AuthSettings, value: any) => void;
  updateAuthSettings: () => Promise<void>;
  authSettings: AuthSettings;
  updating: boolean;
};

export function useEditSpaceAuthSettings(space: SpaceWithIntegrationsFragment): UpdateSpaceAuthSettingsHelper {
  const [authSettings, setAuthSettings] = useState<AuthSettings>(space.authSettings || {});
  const [updateSpaceAuthSettingsMutation] = useUpdateSpaceAuthSettingsMutation();
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
      const updatedSpace = await updateSpaceAuthSettingsMutation({
        variables: {
          spaceId: space.id,
          input: {
            enableLogin: !!authSettings.enableLogin,
            loginOptions: authSettings.loginOptions || [],
          },
        },
      });
      if (updatedSpace.data?.payload) {
        setAuthSettings({
          ...updatedSpace.data?.payload.authSettings,
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
