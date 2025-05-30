import { SocialSettings } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export type UpdateSpaceSocialSettingsHelper = {
  setSocialSettingsField: (field: keyof SocialSettings, value: any) => void;
  updateSocialSettings: () => Promise<void>;
  socialSettings: SocialSettings;
  updating: boolean;
};

export function useEditSpaceSocialSettings(space: SpaceWithIntegrationsDto): UpdateSpaceSocialSettingsHelper {
  const [socialSettings, setSocialSettings] = useState<SocialSettings>(space.socialSettings || {});
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
      const response = await fetch(`${getBaseUrl()}/api/spaces/update-social-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          input: {
            linkedSharePdfBackgroundImage: socialSettings.linkedSharePdfBackgroundImage,
          },
        }),
      });

      if (response.ok) {
        const updatedSpace: SpaceWithIntegrationsDto = (await response.json()).space;
        setSocialSettings({
          ...updatedSpace.socialSettings,
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
