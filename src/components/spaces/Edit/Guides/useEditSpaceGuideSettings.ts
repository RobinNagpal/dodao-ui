import { useNotificationContext } from '@/contexts/NotificationContext';
import { GuideSettings, SpaceWithIntegrationsFragment, useUpdateSpaceGuideSettingsMutation } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export type UpdateSpaceGuideSettingsHelper = {
  setGuideSettingsField: (field: keyof GuideSettings, value: any) => void;
  updateGuideSettings: () => Promise<void>;
  guideSettings: GuideSettings;
  updating: boolean;
};

export function useEditSpaceGuideSettings(space: SpaceWithIntegrationsFragment): UpdateSpaceGuideSettingsHelper {
  const [guideSettings, setGuideSettings] = useState<GuideSettings>(space.guideSettings || {});
  const [updateSpaceGuideSettingsMutation] = useUpdateSpaceGuideSettingsMutation();
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
      const updatedSpace = await updateSpaceGuideSettingsMutation({
        variables: {
          spaceId: space.id,
          input: {
            askForLoginToSubmit: guideSettings.askForLoginToSubmit,
            captureRating: guideSettings.captureRating,
            showCategoriesInSidebar: guideSettings.showCategoriesInSidebar,
            showIncorrectAfterEachStep: guideSettings.showIncorrectAfterEachStep,
            showIncorrectOnCompletion: guideSettings.showIncorrectOnCompletion,
          },
        },
      });
      if (updatedSpace.data?.payload) {
        setGuideSettings({
          ...updatedSpace.data?.payload.guideSettings,
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
