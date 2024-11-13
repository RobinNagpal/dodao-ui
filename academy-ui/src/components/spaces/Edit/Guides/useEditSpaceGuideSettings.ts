import { GuideSettings } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export type UpdateSpaceGuideSettingsHelper = {
  setGuideSettingsField: (field: keyof GuideSettings, value: any) => void;
  updateGuideSettings: () => Promise<void>;
  guideSettings: GuideSettings;
  updating: boolean;
};

export function useEditSpaceGuideSettings(space: SpaceWithIntegrationsDto): UpdateSpaceGuideSettingsHelper {
  const [guideSettings, setGuideSettings] = useState<GuideSettings>(space.guideSettings || {});
  const [updating, setUpdating] = useState(false);
  const { showNotification } = useNotificationContext();

  function setGuideSettingsField(field: keyof GuideSettings, value: any) {
    setGuideSettings({
      ...guideSettings,
      [field]: value,
    });
  }

  async function updateGuideSettings() {
    try {
      setUpdating(true);
      const response = await fetch(`${getBaseUrl()}/api/spaces/update-guide-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          input: {
            askForLoginToSubmit: guideSettings.askForLoginToSubmit,
            captureRating: guideSettings.captureRating,
            showCategoriesInSidebar: guideSettings.showCategoriesInSidebar,
            showIncorrectAfterEachStep: guideSettings.showIncorrectAfterEachStep,
            showIncorrectOnCompletion: guideSettings.showIncorrectOnCompletion,
          },
        }),
      });

      if (response.ok) {
        const updatedSpace: SpaceWithIntegrationsDto = (await response.json()).space;
        setGuideSettings({
          ...updatedSpace.guideSettings,
        });
        showNotification({ type: 'success', message: 'Guide settings updated' });
      } else {
        showNotification({ type: 'error', message: 'Failed to update guide settings' });
      }
      setUpdating(false);
    } catch (e) {
      console.log(e);
      showNotification({ type: 'error', message: 'Failed to update guide settings' });
      setUpdating(false);
    }
  }

  return {
    guideSettings,
    setGuideSettingsField,
    updateGuideSettings,
    updating,
  };
}
