import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { useEditSpaceByteSettings } from '@/components/spaces/Edit/Bytes/useEditSpaceByteSettings';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export default function UpsertSpaceByteSettingsModal(props: { space: SpaceWithIntegrationsFragment; open: boolean; onClose: () => void }) {
  const { byteSettings, setByteSettingsField, updateByteSettings, updating } = useEditSpaceByteSettings(props.space);
  return (
    <FullScreenModal open={props.open} onClose={props.onClose} title="Byte Settings">
      <div className="space-y-12 text-left">
        <div className="border-b pb-12">
          <ToggleWithIcon
            label={'Show ratings'}
            enabled={!!byteSettings.captureBeforeAndAfterRating}
            setEnabled={(value) => setByteSettingsField('captureBeforeAndAfterRating', value)}
          />

          <ToggleWithIcon
            label={'Ask for login to submit'}
            enabled={!!byteSettings.askForLoginToSubmit}
            setEnabled={(value) => setByteSettingsField('askForLoginToSubmit', value)}
          />

          <ToggleWithIcon
            label={'Show categories in sidebar'}
            enabled={!!byteSettings.showCategoriesInSidebar}
            setEnabled={(value) => setByteSettingsField('showCategoriesInSidebar', value)}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button
          variant="contained"
          primary
          loading={updating}
          disabled={updating}
          onClick={async () => {
            await updateByteSettings();
            props.onClose();
          }}
        >
          Save
        </Button>
      </div>
    </FullScreenModal>
  );
}
