import { useNotificationContext } from '@/contexts/NotificationContext';
import { SocialSettings, SpaceWithIntegrationsFragment, useUpdateSpaceSocialSettingsMutation } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export type UpdateSpaceSocialSettingsHelper = {
  setSocialSettingsField: (field: keyof SocialSettings, value: any) => void;
  updateSocialSettings: () => Promise<void>;
  socialSettings: SocialSettings;
  updating: boolean;
};

export function useEditSpaceSocialSettings(space: SpaceWithIntegrationsFragment): UpdateSpaceSocialSettingsHelper {
  const [socialSettings, setSocialSettings] = useState<SocialSettings>(space.socialSettings || {});
  const [updateSpaceSocialSettingsMutation] = useUpdateSpaceSocialSettingsMutation();
  const [updating, setUpdating] = useState(false);
  const { showNotification } = useNotificationContext();

  function setSocialSettingsField(field: keyof SocialSettings, value: any) {
    setSocialSettings({
      ...socialSettings,
      [field]: value,
    });
  }

  async function updateSocialSettings() {
    try {
      setUpdating(true);
      const updatedSpace = await updateSpaceSocialSettingsMutation({
        variables: {
          spaceId: space.id,
          input: {
            linkedSharePdfBackgroundImage: socialSettings.linkedSharePdfBackgroundImage,
          },
        },
      });
      if (updatedSpace.data?.payload) {
        setSocialSettings({
          ...updatedSpace.data?.payload.socialSettings,
        });
        showNotification({ type: 'success', message: 'Social settings updated' });
      } else {
        showNotification({ type: 'error', message: 'Failed to update social settings' });
      }
      setUpdating(false);
    } catch (e) {
      console.log(e);
      showNotification({ type: 'error', message: 'Failed to update social settings' });
      setUpdating(false);
    }
  }

  return {
    socialSettings,
    setSocialSettingsField,
    updateSocialSettings,
    updating,
  };
}
