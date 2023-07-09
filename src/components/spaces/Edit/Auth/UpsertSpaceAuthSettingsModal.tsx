import Button from '@/components/core/buttons/Button';
import Checkboxes from '@/components/core/checkboxes/Checkboxes';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { useEditSpaceAuthSettings } from '@/components/spaces/Edit/Auth/useEditSpaceAuthSettings';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { LoginProviders } from '@/types/deprecated/models/enums';
import React from 'react';

export default function UpsertSpaceAuthSettingsModal(props: { space: SpaceWithIntegrationsFragment; open: boolean; onClose: () => void }) {
  const { authSettings, setAuthSettingsField, updateAuthSettings, updating } = useEditSpaceAuthSettings(props.space);
  return (
    <FullScreenModal open={props.open} onClose={props.onClose} title="Auth Settings">
      <div className="space-y-12 text-left">
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

      <div className="mt-6 flex items-center justify-end gap-x-6">
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
    </FullScreenModal>
  );
}
