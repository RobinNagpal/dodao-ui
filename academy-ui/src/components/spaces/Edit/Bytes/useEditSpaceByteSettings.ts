import { ByteSettings } from '@/graphql/generated/generated-types';
import { ByteViewMode } from '@/types/bytes/ByteDto';
import { UpsertByteSettingsRequest } from '@/types/request/space/UpsertByteSettingsRequest';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
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
  const { updateData: putData, loading } = useUpdateData<SpaceWithIntegrationsDto, UpsertByteSettingsRequest>(
    {},
    {
      errorMessage: 'Failed to update byte settings',
      successMessage: 'Byte settings updated successfully',
    },
    'PUT'
  );

  function setByteSettingsField(field: keyof ByteSettings, value: any) {
    setByteSettings({
      ...byteSettings,
      [field]: value,
    });
  }

  async function updateByteSettings() {
    const response = await putData(`${getBaseUrl()}/api/${space.id}/actions/spaces/update-byte-settings`, {
      askForLoginToSubmit: byteSettings.askForLoginToSubmit,
      captureRating: byteSettings.captureRating,
      showCategoriesInSidebar: byteSettings.showCategoriesInSidebar,
      byteViewMode: byteSettings.byteViewMode as ByteViewMode,
    });
    if (response) {
      setByteSettings({
        ...response.byteSettings,
      });
    }
  }

  return {
    byteSettings,
    setByteSettingsField,
    updateByteSettings,
    updating: loading,
  };
}
