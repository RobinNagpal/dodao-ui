import { AuthSettings } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
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
  const { postData } = usePostData<SpaceWithIntegrationsDto, UpdateAuthSettingsRequest>(
    {
      errorMessage: 'Failed to update auth settings',
      successMessage: 'Auth settings updated',
    },
    {}
  );

  function setAuthSettingsField(field: keyof AuthSettings, value: any) {
    setAuthSettings({
      ...authSettings,
      [field]: value,
    });
  }

  async function updateAuthSettings() {
    setUpdating(true);
    const response = await postData(`${getBaseUrl()}/api/spaces/update-auth-settings`, {
      spaceId: space.id,
      input: {
        enableLogin: !!authSettings.enableLogin,
        loginOptions: authSettings.loginOptions || [],
      },
    });
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
