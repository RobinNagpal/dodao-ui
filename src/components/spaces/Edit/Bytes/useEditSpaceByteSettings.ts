import { useNotificationContext } from '@/contexts/NotificationContext';
import { ByteSettings, SpaceWithIntegrationsFragment, useUpdateSpaceByteSettingsMutation } from '@/graphql/generated/generated-types';
import { useState } from 'react';

export type UpdateSpaceByteSettingsHelper = {
  setByteSettingsField: (field: keyof ByteSettings, value: any) => void;
  updateByteSettings: () => Promise<void>;
  byteSettings: ByteSettings;
  updating: boolean;
};

export function useEditSpaceByteSettings(space: SpaceWithIntegrationsFragment): UpdateSpaceByteSettingsHelper {
  const [byteSettings, setByteSettings] = useState<ByteSettings>(space.byteSettings || {});
  const [updateSpaceByteSettingsMutation] = useUpdateSpaceByteSettingsMutation();
  const [updating, setUpdating] = useState(false);
  const { showNotification } = useNotificationContext();

  function setByteSettingsField(field: keyof ByteSettings, value: any) {
    setByteSettings({
      ...byteSettings,
      [field]: value,
    });
  }

  async function updateByteSettings() {
    try {
      setUpdating(true);
      const updatedSpace = await updateSpaceByteSettingsMutation({
        variables: {
          spaceId: space.id,
          input: {
            askForLoginToSubmit: byteSettings.askForLoginToSubmit,
            captureBeforeAndAfterRating: byteSettings.captureBeforeAndAfterRating,
            showCategoriesInSidebar: byteSettings.showCategoriesInSidebar,
          },
        },
      });
      if (updatedSpace.data?.payload) {
        setByteSettings({
          ...updatedSpace.data?.payload.byteSettings,
        });
        showNotification({ type: 'success', message: 'Byte settings updated' });
      } else {
        showNotification({ type: 'error', message: 'Failed to update byte settings' });
      }
      setUpdating(false);
    } catch (e) {
      console.log(e);
      showNotification({ type: 'error', message: 'Failed to update byte settings' });
      setUpdating(false);
    }
  }

  return {
    byteSettings,
    setByteSettingsField,
    updateByteSettings,
    updating,
  };
}
