import { ByteSettings } from '@/graphql/generated/generated-types';
import { ByteViewMode } from '@/types/bytes/ByteDto';
import { UpsertByteSettingsRequest } from '@/types/request/space/UpsertByteSettingsRequest';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export type UpdateSpaceByteSettingsHelper = {
  setByteSettingsField: (field: keyof ByteSettings, value: any) => void;
  updateByteSettings: () => Promise<void>;
  byteSettings: ByteSettings;
  updating: boolean;
};

export function useEditSpaceByteSettings(space: SpaceWithIntegrationsDto, onUpdateSettings: () => Promise<void>): UpdateSpaceByteSettingsHelper {
  const [byteSettings, setByteSettings] = useState<ByteSettings>(space.byteSettings || {});
  const [updating, setUpdating] = useState(false);
  const { putData } = useFetchUtils();

  function setByteSettingsField(field: keyof ByteSettings, value: any) {
    setByteSettings({
      ...byteSettings,
      [field]: value,
    });
  }

  async function updateByteSettings() {
    setUpdating(true);
    const response = await putData<SpaceWithIntegrationsDto, UpsertByteSettingsRequest>(
      `${getBaseUrl()}/api/${space.id}/actions/spaces/update-byte-settings`,
      {
        askForLoginToSubmit: byteSettings.askForLoginToSubmit,
        captureRating: byteSettings.captureRating,
        showCategoriesInSidebar: byteSettings.showCategoriesInSidebar,
        byteViewMode: byteSettings.byteViewMode as ByteViewMode,
      },
      {
        errorMessage: 'Failed to update byte settings',
        successMessage: 'Byte settings updated successfully',
      }
    );
    if (response) {
      setByteSettings({
        ...response.byteSettings,
      });
    }
    setUpdating(false);
  }

  return {
    byteSettings,
    setByteSettingsField,
    updateByteSettings,
    updating,
  };
}
