import { useEditSpaceAuthSettings } from '@/components/spaces/Edit/Auth/useEditSpaceAuthSettings';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Checkboxes from '@dodao/web-core/components/core/checkboxes/Checkboxes';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { LoginProviders } from '@dodao/web-core/types/deprecated/models/enums';
import React from 'react';

export default function UpsertSpaceAuthSettingsModal(props: { space: SpaceWithIntegrationsDto; open: boolean; onClose: () => void }) {
  const { authSettings, setAuthSettingsField, updateAuthSettings, updating } = useEditSpaceAuthSettings(props.space);
  return (
    <FullPageModal open={props.open} onClose={props.onClose} title="Auth Settings">
      <div className="space-y-12 text-left p-4">
        <div className="border-b pb-12">
          <ToggleWithIcon label={'Enable login'} enabled={!!authSettings.enableLogin} setEnabled={(value) => setAuthSettingsField('enableLogin', value)} />

          <Checkboxes
            label={'Login Options'}
            items={Object.keys(LoginProviders).map((key) => ({ id: key, label: key, name: key }))}
            onChange={(options) => setAuthSettingsField('loginOptions', options)}
            selectedItemIds={authSettings.loginOptions ? authSettings.loginOptions : Object.keys(LoginProviders)}
            className="mt-6"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-x-6 p-4">
        <Button variant="outlined">Cancel</Button>
        <Button
          variant="contained"
          primary
          loading={updating}
          disabled={updating}
          onClick={async () => {
            await updateAuthSettings();
            props.onClose();
          }}
        >
          Save
        </Button>
      </div>
    </FullPageModal>
  );
}
