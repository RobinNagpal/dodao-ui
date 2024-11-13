import { AuthSettings } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useState } from 'react';

export type UpdateSpaceAuthSettingsHelper = {
  setAuthSettingsField: (field: keyof AuthSettings, value: any) => void;
  updateAuthSettings: () => Promise<void>;
  authSettings: AuthSettings;
  updating: boolean;
};

interface UpdateAuthSettingsRequest {
  spaceId: string;
  input: AuthSettings;
}

export function useEditSpaceAuthSettings(space: SpaceWithIntegrationsDto): UpdateSpaceAuthSettingsHelper {
  const [authSettings, setAuthSettings] = useState<AuthSettings>(space.authSettings || {});
  const [updating, setUpdating] = useState(false);
  const { postData } = useFetchUtils();

  function setAuthSettingsField(field: keyof AuthSettings, value: any) {
    setAuthSettings({
      ...authSettings,
      [field]: value,
    });
  }

  async function updateAuthSettings() {
    setUpdating(true);
    const response = await postData<SpaceWithIntegrationsDto, UpdateAuthSettingsRequest>(
      `${getBaseUrl()}/api/spaces/update-auth-settings`,
      {
        spaceId: space.id,
        input: {
          enableLogin: !!authSettings.enableLogin,
          loginOptions: authSettings.loginOptions || [],
        },
      },
      {
        errorMessage: 'Failed to update auth settings',
        successMessage: 'Auth settings updated',
      }
    );
    const updatedSpace: SpaceWithIntegrationsDto = response!;
    setAuthSettings({
      ...updatedSpace.authSettings,
    });

    setUpdating(false);
  }

  return {
    authSettings,
    setAuthSettingsField,
    updateAuthSettings,
    updating,
  };
}
