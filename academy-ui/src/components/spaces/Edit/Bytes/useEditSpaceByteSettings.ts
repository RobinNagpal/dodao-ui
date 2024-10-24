import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { ByteSettings, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export type UpdateSpaceByteSettingsHelper = {
  setByteSettingsField: (field: keyof ByteSettings, value: any) => void;
  updateByteSettings: () => Promise<void>;
  byteSettings: ByteSettings;
  updating: boolean;
};

export function useEditSpaceByteSettings(space: SpaceWithIntegrationsFragment, onUpdateSettings: () => Promise<void>): UpdateSpaceByteSettingsHelper {
  const [byteSettings, setByteSettings] = useState<ByteSettings>(space.byteSettings || {});
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
      const response = await fetch(`${getBaseUrl()}/api/${space.id}/actions/spaces/update-byte-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId: space.id,
          input: {
            askForLoginToSubmit: byteSettings.askForLoginToSubmit,
            captureRating: byteSettings.captureRating,
            showCategoriesInSidebar: byteSettings.showCategoriesInSidebar,
            byteViewMode: byteSettings.byteViewMode,
          },
        }),
      });
      if (response.ok) {
        const updatedSpace: SpaceWithIntegrationsFragment = (await response.json()).space;
        setByteSettings({
          ...updatedSpace.byteSettings,
        });
        await onUpdateSettings();
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
