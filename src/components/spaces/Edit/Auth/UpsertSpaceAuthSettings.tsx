import Button from '@/components/core/buttons/Button';
import Checkboxes from '@/components/core/checkboxes/Checkboxes';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { useEditSpaceAuthSettings } from '@/components/spaces/Edit/Auth/useEditSpaceAuthSettings';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { LoginProviders } from '@/types/deprecated/models/enums';
import React from 'react';

export default function UpsertSpaceAuthSettings(props: { space: SpaceWithIntegrationsFragment }) {
  const { authSettings, setAuthSettingsField, updateAuthSettings, updating } = useEditSpaceAuthSettings(props.space);
  return (
    <>
      <div className="space-y-12">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

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
        <Button variant="contained" primary loading={updating} disabled={updating} onClick={updateAuthSettings}>
          Save
        </Button>
      </div>
    </>
  );
}
