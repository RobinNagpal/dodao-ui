import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import ToggleWithIcon from '@/components/core/toggles/ToggleWithIcon';
import { useEditSpaceGuideSettings } from '@/components/spaces/Edit/Guides/useEditSpaceGuideSettings';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import React from 'react';

export default function UpsertSpaceGuideSettingsModal(props: { space: SpaceWithIntegrationsFragment; open: boolean; onClose: () => void }) {
  const { guideSettings, setGuideSettingsField, updateGuideSettings, updating } = useEditSpaceGuideSettings(props.space);
  return (
    <FullScreenModal open={props.open} onClose={props.onClose} title="Guide Settings">
      <div className="py-4 px-8">
        <div className="space-y-12 text-left">
          <div className="border-b pb-12">
            <ToggleWithIcon
              label={'Capture ratings'}
              enabled={!!guideSettings.captureRating}
              setEnabled={(value) => setGuideSettingsField('captureRating', value)}
            />

            <ToggleWithIcon
              label={'Ask for login to submit'}
              enabled={!!guideSettings.askForLoginToSubmit}
              setEnabled={(value) => setGuideSettingsField('askForLoginToSubmit', value)}
            />

            <ToggleWithIcon
              label={'Show categories in sidebar'}
              enabled={!!guideSettings.showCategoriesInSidebar}
              setEnabled={(value) => setGuideSettingsField('showCategoriesInSidebar', value)}
            />

            <ToggleWithIcon
              label={'Show incorrect after each step'}
              enabled={!!guideSettings.showIncorrectAfterEachStep}
              setEnabled={(value) => setGuideSettingsField('showIncorrectAfterEachStep', value)}
            />

            <ToggleWithIcon
              label={'Show incorrect on completion'}
              enabled={!!guideSettings.showIncorrectOnCompletion}
              setEnabled={(value) => setGuideSettingsField('showIncorrectOnCompletion', value)}
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
              await updateGuideSettings();
              props.onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </FullScreenModal>
  );
}
